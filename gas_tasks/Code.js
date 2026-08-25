// ====================================================================
// ⚡ BDC CENTRAL COMMAND — TASK SYNC & EMERGENCY EMAIL DISPATCHER
// ====================================================================

const FIREBASE_DB_URL = "https://livecounters-8eaa8-default-rtdb.firebaseio.com/";

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const api = params.api;
  
  if (api === "updateChiefLevel") {
    return handleUpdateChiefLevel(params);
  }
  
  if (api === "listSheets") {
    try {
      const token = ScriptApp.getOAuthToken();
      const url = "https://sheets.googleapis.com/v4/spreadsheets/1NEMy5X5leBqlVs9nxNwY2ynusLgyjmymekFk4avzUv0?fields=sheets.properties";
      const resp = UrlFetchApp.fetch(url, {
        method: "get",
        headers: { "Authorization": "Bearer " + token },
        muteHttpExceptions: true
      });
      return ContentService.createTextOutput(resp.getContentText())
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "OK", service: "BDC Central Command Email & Task Bridge" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleUpdateChiefLevel(params) {
  try {
    const gameId = String(params.gameId || "").trim();
    const name = String(params.name || "").trim();
    const furnaceLevel = String(params.furnaceLevel || "").trim();
    
    if (!gameId && !name) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Missing gameId or name" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const token = ScriptApp.getOAuthToken();
    const spreadsheetId = "1NEMy5X5leBqlVs9nxNwY2ynusLgyjmymekFk4avzUv0";
    
    // Read the sheet data
    const readUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/A1:Z100";
    const readResp = UrlFetchApp.fetch(readUrl, {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    });
    
    if (readResp.getResponseCode() !== 200) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Sheets API read failed: " + readResp.getContentText() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheetData = JSON.parse(readResp.getContentText());
    const rows = sheetData.values || [];
    
    let targetRow = -1;
    let gidCol = -1;
    let furnaceCol = -1;
    let nameCol = -1;
    
    // Header detection
    for (let r = 0; r < Math.min(3, rows.length); r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const val = String(rows[r][c]).toLowerCase();
        if (val.includes("game id") || val.includes("player id") || val === "gid" || val === "id") gidCol = c;
        if (val.includes("furnace") || val.includes("stove") || val.includes("level")) furnaceCol = c;
        if (val.includes("chief") || val.includes("name") || val.includes("nickname")) nameCol = c;
      }
      if (furnaceCol !== -1 && (gidCol !== -1 || nameCol !== -1)) break;
    }
    
    // Fallback column positions if header detection was ambiguous
    if (furnaceCol === -1) furnaceCol = 2; // Col C
    
    // Search rows for chief
    for (let r = 1; r < rows.length; r++) {
      const rowGid = gidCol !== -1 && rows[r][gidCol] ? String(rows[r][gidCol]).trim() : "";
      const rowName = nameCol !== -1 && rows[r][nameCol] ? String(rows[r][nameCol]).trim().toLowerCase() : "";
      
      if ((gameId && rowGid === gameId) || (name && rowName === name.toLowerCase())) {
        targetRow = r + 1; // 1-indexed
        break;
      }
    }
    
    if (targetRow !== -1) {
      // Column letter calculation (A=1, B=2, C=3, etc.)
      const colLetter = String.fromCharCode(65 + furnaceCol);
      const updateRange = colLetter + targetRow;
      const writeUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + updateRange + "?valueInputOption=USER_ENTERED";
      
      const writeResp = UrlFetchApp.fetch(writeUrl, {
        method: "put",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + token },
        payload: JSON.stringify({
          values: [[furnaceLevel]]
        }),
        muteHttpExceptions: true
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        updated: true, 
        row: targetRow, 
        cell: updateRange,
        gameId: gameId, 
        name: name, 
        furnaceLevel: furnaceLevel 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      updated: false, 
      reason: "Chief not found in sheet rows", 
      gameId: gameId, 
      name: name 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testSendMail() {
  MailApp.sendEmail({
    to: "briandivacox@gmail.com",
    subject: "🚨 [BDC Central Command Alert] Test Alert & Repair Guide",
    htmlBody: "<h3>⚡ BDC Central Command Email Test</h3><p>Your email alerts and step-by-step repair guides are now active!</p>",
    name: "BDC Central Command"
  });
  Logger.log("Test email sent!");
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = {};
      }
    }
    
    const api = payload.api || payload.action || "";
    
    if (api === "updateChiefLevel") {
      return handleUpdateChiefLevel(payload);
    }
    
    if (api === "sendAlertEmail") {
      const recipient = payload.recipient || "briandivacox@gmail.com";
      const subject = payload.subject;
      const htmlBody = payload.htmlBody || payload.body;
      const textBody = payload.textBody || "";
      
      // Strict guard: Never dispatch empty / default placeholder emails
      if (!subject && !htmlBody && !textBody) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Empty email payload ignored. No email dispatched." 
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      MailApp.sendEmail({
        to: recipient,
        subject: subject || "🚨 [BDC Central Command] Alert",
        body: textBody || "Alert from BDC Central Command",
        htmlBody: htmlBody || textBody,
        name: "BDC Central Command"
      });
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Email successfully dispatched to " + recipient,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (api === "syncTasks") {
      syncGoogleTasksToFirebase();
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Tasks synced to Firebase" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "OK", 
      message: "BDC Task Bridge API ready",
      receivedApi: api 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function syncGoogleTasksToFirebase() {
  try {
    const token = ScriptApp.getOAuthToken();
    const googleApiOptions = {
      method: "get",
      headers: { 
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      },
      muteHttpExceptions: true
    };

    const listUrl = "https://tasks.googleapis.com/tasks/v1/users/@me/lists";
    const listResponse = UrlFetchApp.fetch(listUrl, googleApiOptions);
    
    if (listResponse.getResponseCode() !== 200) {
      Logger.log("Failed to fetch task lists from Google: " + listResponse.getContentText());
      return;
    }

    const listData = JSON.parse(listResponse.getContentText());
    const taskLists = listData.items;
    
    if (!taskLists || taskLists.length === 0) {
      Logger.log("No task lists found.");
      return;
    }

    let totalTaskCount = 0;
    let listCounts = {};

    taskLists.forEach(list => {
      let firebaseKey = list.title.replace(/[^a-zA-Z0-9_]/g, "_") + "_count";
      const taskUrl = `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?status=needsAction`;
      const taskResponse = UrlFetchApp.fetch(taskUrl, googleApiOptions);
      
      if (taskResponse.getResponseCode() === 200) {
        const taskData = JSON.parse(taskResponse.getContentText());
        let count = (taskData.items) ? taskData.items.length : 0;
        listCounts[firebaseKey] = count;
        totalTaskCount += count;
      } else {
        listCounts[firebaseKey] = 0;
      }
    });

    listCounts["Task_count"] = totalTaskCount;

    const firebaseOptions = {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(listCounts)
    };

    UrlFetchApp.fetch(FIREBASE_DB_URL + "tasks.json", firebaseOptions);
    Logger.log("Successfully synchronized task counts to Firebase!");

  } catch (error) {
    Logger.log("Error syncing tasks: " + error.toString());
  }
}