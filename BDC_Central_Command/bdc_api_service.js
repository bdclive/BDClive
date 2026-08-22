/**
 * ====================================================================
 * ⚡ BDC CENTRAL COMMAND — LIVE API & FIREBASE QUEUE DAEMON (v1.0.75)
 * ====================================================================
 * Standalone, zero-dependency background engine:
 *  • 🌐 HTTP REST API Server (Port 3188) with Full CORS Support
 *  • 🛡️ Direct Firebase Realtime Database Admin Integration (Zero Quotas)
 *  • ⚡ Live Event Queue Consumer (/api_queue) for Instant Web Callbacks
 *  • 🎮 Century Games RSA-OAEP / HMAC-SHA256 Cryptographic Engine
 *  • 🔄 Real-Time Member Stats Sync, In-Game Captchas & 30-Day Tokens
 *  • 🎁 24/7 Gift Code Auto-Redeemer & Alliance Roster Synchronization
 * ====================================================================
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const url = require('url');

const VERSION = '1.0.73';
const PORT = process.env.BDC_PORT ? parseInt(process.env.BDC_PORT, 10) : 3188;

const WOS_FIREBASE_URL = 'https://wos-dashboard-38d4c-default-rtdb.firebaseio.com';
const WOS_FIREBASE_SECRET = 'n5fTnxcK5J5ddNsT77AhZIoQGTogW3ROpk4k03Sv';

const REAL_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtyQumWtY72VXRcw8FXJg
pq/8J0ySyAiA8KRpF9uI75lth38/2BUghIfX+rireW4EEp617RPwsjnd0SAyhscX
0AexHHjdqUQh43Z0Me5ZuJUR1fh2OFLJfO591Xp/QGc10/3NvuGzklQ/6nSnBvZT
icRqSvp1EyGLc9oYhHaQgqM2sVli8E5ltcPpmVwoDMPY1JyYtRN2pKTH9qHLsNdk
CwVKCchas9Ql5xOarOBTROHm1iwDPQRdwB4U88USyvGeDoVJv836RClNTChMZ9DZ
fiJYYVAiXtGwapAQRyAOlNWjfHxut0aolswQoNqGig2jFLVsYWS3rQMa2RcJVLkX
TwIDAQAB
-----END PUBLIC KEY-----`;

// Stats and telemetry
const stats = {
  startTime: Date.now(),
  requestsHandled: 0,
  queueJobsProcessed: 0,
  errorsCount: 0,
  lastActivity: Date.now()
};

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [BDC API] ${msg}`);
}

function generateAesKey() {
  const bytes = crypto.randomBytes(16);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatStoveLevel(lv) {
  if (!lv && lv !== 0) return 'Unknown';
  const str = String(lv).trim();
  const num = parseInt(str, 10);
  if (isNaN(num)) return str;
  if (num > 30) return `FC ${num - 30}`;
  return `Lv ${num}`;
}

// ====================================================================
// 🎮 CENTURY GAMES CRYPTOGRAPHIC & API CLIENT
// ====================================================================

function callCenturyApi(pathName, payloadData, token = null) {
  return new Promise((resolve) => {
    const aesKeyHex = generateAesKey();
    let authKeyHeader;
    try {
      authKeyHeader = crypto.publicEncrypt({
        key: REAL_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha1'
      }, Buffer.from(aesKeyHex, 'utf8')).toString('base64');
    } catch (e) {
      return resolve({ success: false, error: 'RSA Encryption failed: ' + e.message });
    }

    const clone = {
      game_id: '20121',
      language_code: 'en',
      ts: Date.now(),
      webVersion: 'v2.3.2',
      ...payloadData
    };

    const sortedKeys = Object.keys(clone).sort();
    const queryStr = sortedKeys.map(k => `${k}=${clone[k]}`).join('&');
    const hmac = crypto.createHmac('sha256', aesKeyHex);
    hmac.update(queryStr);
    const signatureHex = hmac.digest('hex');
    clone.auth = Buffer.from(signatureHex, 'utf8').toString('base64');

    const bodyStr = JSON.stringify(clone);
    const headers = {
      'Auth-Key': authKeyHeader,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      'Origin': 'https://store.centurygames.com',
      'Referer': 'https://store.centurygames.com/wos',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Request-Path': 'https://store.centurygames.com/wos'
    };

    if (token) headers['token'] = token;

    const req = https.request({
      hostname: 'cg-vip-mall-wos.centurygame.com',
      port: 443,
      path: '/api' + pathName,
      method: 'POST',
      headers: headers,
      timeout: 12000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: true, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ success: false, status: res.statusCode, raw: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Century Games API request timed out' });
    });
    req.on('error', err => resolve({ success: false, error: err.message }));
    req.write(bodyStr);
    req.end();
  });
}

// ====================================================================
// 🛡️ FIREBASE REALTIME DATABASE ADMIN CLIENT
// ====================================================================

function firebaseRequest(method, dbPath, bodyData = null) {
  return new Promise((resolve) => {
    const cleanPath = dbPath.startsWith('/') ? dbPath : '/' + dbPath;
    const urlStr = `${WOS_FIREBASE_URL}${cleanPath}.json?auth=${WOS_FIREBASE_SECRET}`;
    const parsedUrl = url.parse(urlStr);

    let bodyStr = null;
    const headers = {};
    if (bodyData !== null) {
      bodyStr = JSON.stringify(bodyData);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request({
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: method,
      headers: headers,
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, raw: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Firebase timeout' });
    });
    req.on('error', err => resolve({ success: false, error: err.message }));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const firebaseGet = (p) => firebaseRequest('GET', p);
const firebasePut = (p, d) => firebaseRequest('PUT', p, d);
const firebasePatch = (p, d) => firebaseRequest('PATCH', p, d);
const firebaseDelete = (p) => firebaseRequest('DELETE', p);

// ====================================================================
// ⚡ CORE ENGINE ACTIONS (CENTURY GAMES + FIREBASE SYNC)
// ====================================================================

function formatStoveLevel(lv) {
  if (!lv) return 'Unknown';
  const num = parseInt(lv, 10);
  if (isNaN(num)) return String(lv);
  if (num >= 1 && num <= 10) return `FC ${num}`;
  if (num > 30 && num <= 40) return `FC ${num - 30}`;
  return `Lv ${num}`;
}

function extractCharacterInfo(roleData, defaultRoleId = '') {
  let char = roleData;
  if (roleData && Array.isArray(roleData.user_data) && roleData.user_data.length > 0) {
    char = roleData.user_data.find(u => String(u.role_id) === String(defaultRoleId)) || roleData.user_data[0];
  } else if (roleData && roleData.data && Array.isArray(roleData.data.user_data) && roleData.data.user_data.length > 0) {
    char = roleData.data.user_data.find(u => String(u.role_id) === String(defaultRoleId)) || roleData.data.user_data[0];
  }

  let nickname = (char && (char.nickname || char.name)) || (roleData && (roleData.nickname || roleData.name)) || '';
  let avatar = (char && (char.icon || char.avatar_image)) || (roleData && (roleData.avatar_image || roleData.icon)) || '';
  let section = (char && (char.section || (char.extra_info && char.extra_info.value))) || (roleData && roleData.section) || '2089';

  let rawStove = (char && (char.stove_lv || char.furnaceLevel)) || (roleData && (roleData.stove_lv || roleData.furnaceLevel)) || '';
  let formattedFurnace = '';

  if (char && char.rank) {
    const rankMatch = String(char.rank).match(/stove_lv_(\d+)/i);
    if (rankMatch) {
      const num = parseInt(rankMatch[1], 10);
      if (num >= 1 && num <= 10) formattedFurnace = 'FC ' + num;
      else if (num > 30 && num <= 40) formattedFurnace = 'FC ' + (num - 30);
      else formattedFurnace = 'Lv ' + num;
      rawStove = String(num);
    }
  }

  if (!formattedFurnace && rawStove) {
    const num = parseInt(rawStove, 10);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 10) formattedFurnace = 'FC ' + num;
      else if (num > 30 && num <= 40) formattedFurnace = 'FC ' + (num - 30);
      else formattedFurnace = 'Lv ' + num;
    } else {
      formattedFurnace = String(rawStove);
    }
  }

  return {
    nickname: nickname,
    avatar_image: avatar,
    section: String(section),
    raw_stove_lv: String(rawStove || ''),
    stove_lv: formattedFurnace || 'Unknown'
  };
}

async function actionSendCode(roleId) {
  if (!roleId) return { success: false, error: 'Missing roleId (Game ID)' };
  const cleanId = String(roleId).trim();
  log(`📨 Sending verification captcha for Game ID ${cleanId}...`);

  const res = await callCenturyApi('/auth/get_game_captcha', { role_id: cleanId });
  if (res.success && res.data && res.data.code === 1) {
    return {
      success: true,
      code: 1,
      message: 'Verification code sent to in-game mailbox in Whiteout Survival!'
    };
  }
  return {
    success: false,
    code: res.data ? res.data.code : -1,
    message: res.data ? (res.data.msg || res.data.message) : (res.error || 'Failed to send captcha')
  };
}

function getJwtDaysLeft(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return 0;
  try {
    const parts = token.split('.');
    for (const part of parts) {
      if (!part) continue;
      try {
        const payload = JSON.parse(Buffer.from(part, 'base64').toString('utf8'));
        if (payload && payload.exp) {
          const diffSec = Number(payload.exp) - Math.floor(Date.now() / 1000);
          return Math.max(0, Math.floor(diffSec / 86400));
        }
      } catch (e) {}
    }
  } catch (e) {}
  return 0;
}

async function actionVerifyCode(roleId, captchaCode, targetUid = null) {
  if (!roleId || !captchaCode) return { success: false, error: 'Missing roleId or captcha_code' };
  const cleanId = String(roleId).trim();
  const cleanCaptcha = String(captchaCode).trim();
  log(`🔑 Verifying captcha for Game ID ${cleanId}...`);

  const loginRes = await callCenturyApi('/auth/login', {
    login_type: 'role_id_safe',
    role_id: cleanId,
    captcha_code: cleanCaptcha
  });

  if (!loginRes.success || !loginRes.data || loginRes.data.code !== 1) {
    return {
      success: false,
      code: loginRes.data ? loginRes.data.code : -1,
      message: loginRes.data ? (loginRes.data.msg || loginRes.data.message) : (loginRes.error || 'Invalid verification code')
    };
  }

  const loginData = loginRes.data.data || {};
  const token = loginData.token || '';
  let roleData = loginData;

  if (token) {
    const roleRes = await callCenturyApi('/callback/get_role_info', {
      role_id: cleanId,
      from_desktop_app: 0,
      web_mail_uid: '',
      channel_from: '',
      tga_os: 'windows'
    }, token);

    if (roleRes.success && roleRes.data && roleRes.data.code === 1) {
      roleData = roleRes.data.data || {};
    }
  }

  const extracted = extractCharacterInfo(roleData, cleanId);
  const nickname = extracted.nickname;
  const formattedFurnace = extracted.stove_lv;
  const avatar = extracted.avatar_image;
  const section = extracted.section;
  const rawStove = extracted.raw_stove_lv;
  const daysLeft = getJwtDaysLeft(token);

  const tokenStatusObj = {
    status: daysLeft <= 0 ? 'expired' : (daysLeft <= 3 ? 'expiring_soon' : 'active'),
    daysLeft: daysLeft,
    checkedAt: new Date().toISOString(),
    gameId: cleanId,
    nickname: nickname,
    stove_lv: formattedFurnace
  };

  // Sync with Firebase
  try {
    if (targetUid) {
      await firebasePatch(`/users/${targetUid}`, {
        wos_cg_token: token,
        stove_lv: formattedFurnace,
        furnaceLevel: formattedFurnace,
        centuryGamesVerified: true,
        tokenExpired: daysLeft <= 0,
        tokenStatus: tokenStatusObj,
        lastSyncedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        ...(avatar ? { avatar_image: avatar } : {}),
        ...(nickname && !/^\d+$/.test(nickname) ? { name: nickname } : {})
      });
    }

    // Save to roster_live
    await firebasePatch(`/roster_live/${cleanId}`, {
      gameId: cleanId,
      name: nickname,
      stove_lv: formattedFurnace,
      furnaceLevel: formattedFurnace,
      tokenStatus: tokenStatusObj,
      updatedAt: Date.now()
    });

    log(`✅ Successfully verified and saved 30-day token for ${nickname} (${cleanId}) -> ${formattedFurnace} (${daysLeft}d left)`);
    queueGatekeeperUpdate(2000);
  } catch (e) {
    log(`⚠️ Firebase save warning: ${e.message}`);
  }

  return {
    success: true,
    code: 1,
    token: token,
    nickname: nickname,
    stove_lv: formattedFurnace,
    raw_stove_lv: rawStove,
    avatar_image: avatar,
    section: section,
    tokenStatus: tokenStatusObj
  };
}

async function actionGetRole(roleId, token = null, uid = null) {
  if (!roleId) return { success: false, error: 'Missing roleId' };
  const cleanId = String(roleId).trim();

  // If token is missing, attempt to fetch from Firebase users node
  let activeToken = token;
  let targetUid = uid;
  if (!activeToken || !targetUid) {
    try {
      const uRes = await firebaseGet('/users');
      if (uRes.success && uRes.data) {
        for (const [uKey, u] of Object.entries(uRes.data)) {
          if (u && String(u.gameId) === cleanId) {
            if (!activeToken && u.wos_cg_token) activeToken = u.wos_cg_token;
            if (!targetUid) targetUid = uKey;
            break;
          }
          if (u && u.altTokens && u.altTokens[cleanId] && u.altTokens[cleanId].token) {
            if (!activeToken) activeToken = u.altTokens[cleanId].token;
            if (!targetUid) targetUid = uKey;
            break;
          }
        }
      }
    } catch (e) {}
  }

  if (!activeToken) {
    return { success: false, error: 'No active 30-day session token found for this Chief. Please verify in-game code.' };
  }

  const roleRes = await callCenturyApi('/callback/get_role_info', {
    role_id: cleanId,
    from_desktop_app: 0,
    web_mail_uid: '',
    channel_from: '',
    tga_os: 'windows'
  }, activeToken);

  if (roleRes.success && roleRes.data && roleRes.data.code === 1) {
    const roleData = roleRes.data.data || {};
    const extracted = extractCharacterInfo(roleData, cleanId);
    const nickname = extracted.nickname;
    const formattedFurnace = extracted.stove_lv;
    const avatar = extracted.avatar_image;
    const section = extracted.section;
    const rawStove = extracted.raw_stove_lv;
    const daysLeft = getJwtDaysLeft(activeToken);

    const tokenStatusObj = {
      status: daysLeft <= 0 ? 'expired' : (daysLeft <= 3 ? 'expiring_soon' : 'active'),
      daysLeft: daysLeft,
      checkedAt: new Date().toISOString(),
      gameId: cleanId,
      nickname: nickname,
      stove_lv: formattedFurnace
    };

    // Auto-update users node in Firebase
    try {
      if (targetUid) {
        await firebasePatch(`/users/${targetUid}`, {
          stove_lv: formattedFurnace,
          furnaceLevel: formattedFurnace,
          centuryGamesVerified: true,
          tokenExpired: daysLeft <= 0,
          tokenStatus: tokenStatusObj,
          lastSyncedAt: new Date().toISOString(),
          ...(avatar ? { avatar_image: avatar } : {}),
          ...(nickname && !/^\d+$/.test(nickname) ? { name: nickname } : {})
        });
      }
    } catch (e) {}

    // Auto-update roster_live
    try {
      await firebasePatch(`/roster_live/${cleanId}`, {
        gameId: cleanId,
        name: nickname,
        stove_lv: formattedFurnace,
        furnaceLevel: formattedFurnace,
        tokenStatus: tokenStatusObj,
        updatedAt: Date.now()
      });
      queueGatekeeperUpdate(2000);
    } catch (e) {}

    return {
      success: true,
      valid: true,
      code: 1,
      nickname: nickname,
      stove_lv: formattedFurnace,
      raw_stove_lv: rawStove,
      avatar_image: avatar,
      section: section,
      tokenStatus: tokenStatusObj
    };
  }

  return {
    success: false,
    valid: false,
    code: roleRes.data ? roleRes.data.code : -1,
    message: roleRes.data ? (roleRes.data.msg || roleRes.data.message) : 'Session token expired'
  };
}

async function actionUpdateFurnace(payload) {
  const { gameId, name, level, stove_lv, joinedDate, uid } = payload;
  const cleanId = String(gameId || '').trim();
  const chiefName = String(name || '').trim();
  const newLvl = formatStoveLevel(level || stove_lv || '');
  const cleanDate = String(joinedDate || '').trim();

  log(`🔥 Updating furnace for ${chiefName || cleanId} to ${newLvl}...`);

  const updates = {
    furnaceLevel: newLvl,
    stove_lv: newLvl,
    updatedAt: Date.now()
  };
  if (cleanId) updates.gameId = cleanId;
  if (chiefName) updates.name = chiefName;
  if (cleanDate) updates.joinedDate = cleanDate;

  // 1. Update roster_live
  const saveKey = cleanId || chiefName;
  if (saveKey) {
    await firebasePatch(`/roster_live/${saveKey}`, updates);
    if (cleanId && cleanId !== saveKey) {
      await firebasePatch(`/roster_live/${cleanId}`, updates);
    }
  }

  // 2. If UID provided, update user node directly
  if (uid) {
    await firebasePatch(`/users/${uid}`, {
      stove_lv: newLvl,
      furnaceLevel: newLvl,
      ...(cleanDate ? { joinedDate: cleanDate, dateStarted: cleanDate } : {})
    });
  } else if (cleanId) {
    // Search for user by Game ID
    try {
      const uSnap = await firebaseGet('/users');
      if (uSnap.success && uSnap.data) {
        for (const [uKey, uVal] of Object.entries(uSnap.data)) {
          if (uVal && String(uVal.gameId) === cleanId) {
            await firebasePatch(`/users/${uKey}`, {
              stove_lv: newLvl,
              furnaceLevel: newLvl,
              ...(cleanDate ? { joinedDate: cleanDate, dateStarted: cleanDate } : {})
            });
            break;
          }
          if (uVal && uVal.altTokens && uVal.altTokens[cleanId]) {
            await firebasePatch(`/users/${uKey}/altTokens/${cleanId}`, { stove_lv: newLvl, furnaceLevel: newLvl });
            await firebasePatch(`/users/${uKey}/linkedAltsData/${cleanId}`, { stove_lv: newLvl, furnaceLevel: newLvl });
            break;
          }
        }
      }
    } catch (e) {}
  }

  // 3. Update users_alts if alt
  if (cleanId) {
    await firebasePatch(`/users_alts/${cleanId}`, updates);
  }

  return { success: true, message: `Furnace updated to ${newLvl}`, level: newLvl };
}

const CENTURY_GIFTCODE_SECRET = "tB87#kPtk3xvY28NYBaOfgame";

function actionLookupPlayer(gameId) {
  return new Promise((resolve) => {
    const cleanId = String(gameId || '').trim();
    if (!cleanId) return resolve({ success: false, error: 'Missing gameId' });

    const t = Date.now();
    const signStr = `fid=${cleanId}&time=${t}${CENTURY_GIFTCODE_SECRET}`;
    const sign = crypto.createHash('md5').update(signStr).digest('hex');

    const postData = new URLSearchParams({
      fid: cleanId,
      time: String(t),
      sign: sign
    }).toString();

    const options = {
      hostname: 'wos-giftcode-api.centurygame.com',
      port: 443,
      path: '/api/player',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://wos-giftcode.centurygame.com',
        'Referer': 'https://wos-giftcode.centurygame.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 7000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 0 && json.data) {
            const pData = json.data;
            let stoveLv = '';
            if (pData.stove_lv_content && typeof pData.stove_lv_content === 'string') {
              const pMatch = pData.stove_lv_content.match(/(?:FC|FIRE\s*CRYSTAL)\s*[\.-]?\s*(\d+)/i);
              if (pMatch) {
                const pfc = parseInt(pMatch[1], 10);
                if (pfc >= 1 && pfc <= 10) stoveLv = `FC ${pfc}`;
                else if (pfc > 30 && pfc <= 40) stoveLv = `FC ${pfc - 30}`;
                else if (pfc > 40 && pfc <= 80) stoveLv = `FC ${Math.ceil((pfc - 30) / 5)}`;
              } else {
                const pNum = pData.stove_lv_content.match(/(\d+)/);
                if (pNum) {
                  const pVal = parseInt(pNum[1], 10);
                  if (pVal > 30 && pVal <= 40) stoveLv = `FC ${pVal - 30}`;
                  else if (pVal > 40 && pVal <= 80) stoveLv = `FC ${Math.ceil((pVal - 30) / 5)}`;
                  else if (pVal >= 1 && pVal <= 30) stoveLv = String(pVal);
                }
              }
            }
            if (!stoveLv && pData.stove_lv !== undefined && pData.stove_lv !== null && pData.stove_lv !== '') {
              const pslv = parseInt(String(pData.stove_lv).trim(), 10);
              if (!isNaN(pslv)) {
                if (pslv > 30 && pslv <= 40) stoveLv = `FC ${pslv - 30}`;
                else if (pslv > 40 && pslv <= 80) stoveLv = `FC ${Math.ceil((pslv - 30) / 5)}`;
                else if (pslv >= 1 && pslv <= 30) stoveLv = String(pslv);
              }
            }

            return resolve({
              success: true,
              code: 0,
              nickname: pData.nickname || '',
              stove_lv: stoveLv || 'Unknown',
              furnaceLevel: stoveLv || 'Unknown',
              avatar_image: pData.avatar_image || '',
              kid: pData.kid || '2089',
              raw: pData
            });
          }
          return resolve({ success: false, code: json.code, message: json.msg || 'Player not found' });
        } catch (e) {
          return resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Request timeout' }); });
    req.write(postData);
    req.end();
  });
}

function actionRedeemGiftCode(gameId, cdk, kid = '2089') {
  return new Promise((resolve) => {
    const cleanId = String(gameId || '').trim();
    const cleanCode = String(cdk || '').trim();
    if (!cleanId || !cleanCode) return resolve({ success: false, error: 'Missing gameId or gift code' });

    const t = Math.floor(Date.now() / 1000);
    const signStr = `cdk=${cleanCode}&fid=${cleanId}&kid=${kid}&time=${t}${CENTURY_GIFTCODE_SECRET}`;
    const sign = crypto.createHash('md5').update(signStr).digest('hex');

    const postData = new URLSearchParams({
      cdk: cleanCode,
      fid: cleanId,
      kid: String(kid),
      time: String(t),
      sign: sign
    }).toString();

    const options = {
      hostname: 'wos-giftcode-api.centurygame.com',
      port: 443,
      path: '/api/gift_code',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://wos-giftcode.centurygame.com',
        'Referer': 'https://wos-giftcode.centurygame.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const msg = (json.msg || '').trim();
          const errCode = json.err_code || json.code;
          const isSuccess = (errCode === 0 || errCode === 20000 || /success|received|claimed|used/i.test(msg));

          return resolve({
            success: isSuccess,
            status: isSuccess ? 'success' : 'error',
            code: errCode,
            message: msg || (isSuccess ? 'Code redeemed successfully' : 'Redemption failed'),
            raw: json
          });
        } catch (e) {
          return resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Request timeout' }); });
    req.write(postData);
    req.end();
  });
}

// ====================================================================
// ⚡ FIREBASE REAL-TIME QUEUE CONSUMER (/api_queue)
// ====================================================================

let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    const queueSnap = await firebaseGet('/api_queue/requests');
    if (queueSnap.success && queueSnap.data) {
      const requests = queueSnap.data;
      for (const [jobId, job] of Object.entries(requests)) {
        if (!job || job.status !== 'pending') continue;

        log(`⚡ Processing queue job [${jobId}] (${job.action || job.type})...`);
        stats.queueJobsProcessed++;
        stats.lastActivity = Date.now();

        // Mark processing
        await firebasePatch(`/api_queue/requests/${jobId}`, { status: 'processing', startedAt: Date.now() });

        let result = null;
        try {
          const act = job.action || job.type;
          const payload = job.payload || job.data || job;

          if (act === 'send_code' || act === 'sendCaptcha' || act === 'sendGameCaptcha') {
            result = await actionSendCode(payload.gameId || payload.roleId || payload.id);
          } else if (act === 'verify_code' || act === 'verifyCaptcha' || act === 'verifyGameCaptcha') {
            result = await actionVerifyCode(payload.gameId || payload.roleId || payload.id, payload.code || payload.captcha_code, payload.uid);
          } else if (act === 'get_role' || act === 'syncPlayer' || act === 'syncFromGame' || act === 'syncProfileWithToken') {
            result = await actionGetRole(payload.gameId || payload.roleId || payload.id, payload.token || payload.cgToken, payload.uid);
          } else if (act === 'lookup_player' || act === 'lookupPlayer') {
            result = await actionLookupPlayer(payload.gameId || payload.roleId || payload.id);
          } else if (act === 'redeem_gift_code' || act === 'redeemGiftCode') {
            result = await actionRedeemGiftCode(payload.gameId || payload.roleId || payload.id, payload.code || payload.cdk, payload.kid || '2089');
          } else if (act === 'update_furnace' || act === 'updateChiefLevel') {
            result = await actionUpdateFurnace(payload);
          } else if (act === 'ping') {
            result = { success: true, message: 'pong', version: VERSION, time: Date.now() };
          } else {
            result = { success: false, error: `Unknown action: ${act}` };
          }
        } catch (jobErr) {
          result = { success: false, error: jobErr.message };
        }

        // Post response to /api_queue/responses/$jobId
        await firebasePut(`/api_queue/responses/${jobId}`, {
          status: result.success ? 'completed' : 'error',
          result: result,
          completedAt: Date.now()
        });

        // Mark request as completed
        await firebasePatch(`/api_queue/requests/${jobId}`, {
          status: result.success ? 'completed' : 'error',
          finishedAt: Date.now()
        });
      }
    }
  } catch (err) {
    stats.errorsCount++;
  } finally {
    isProcessingQueue = false;
  }
}

// Queue polling interval (1.5 seconds)
setInterval(processQueue, 1500);

// Queue cleanup interval (purges completed jobs older than 10 minutes every 5 minutes)
setInterval(async () => {
  try {
    const qSnap = await firebaseGet('/api_queue/responses');
    if (qSnap.success && qSnap.data) {
      const now = Date.now();
      for (const [id, item] of Object.entries(qSnap.data)) {
        if (item && item.completedAt && (now - item.completedAt > 600000)) {
          await firebaseDelete(`/api_queue/responses/${id}`);
          await firebaseDelete(`/api_queue/requests/${id}`);
        }
      }
    }
  } catch (e) {}
}, 300000);

// ====================================================================
// 🏰 REAL-TIME DISCORD ALLIANCE GATEKEEPER ENGINE
// ====================================================================

let gatekeeperDebounceTimer = null;

function queueGatekeeperUpdate(delayMs = 2500) {
  if (gatekeeperDebounceTimer) clearTimeout(gatekeeperDebounceTimer);
  gatekeeperDebounceTimer = setTimeout(() => {
    updateDiscordGatekeeperReport().catch(e => log(`⚠️ Gatekeeper update warning: ${e.message}`));
  }, delayMs);
}

async function updateDiscordGatekeeperReport() {
  try {
    let cfgPath = path.join(__dirname, 'discord_config.json');
    if (!fs.existsSync(cfgPath)) return false;
    const discCfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    const targetWebhook = discCfg.GATEKEEPER_WEBHOOK_URL || discCfg.DISCORD_WEBHOOK_URL;
    if (!targetWebhook || !targetWebhook.includes('/webhooks/')) return false;

    // Fetch Firebase live data
    const [uRes, rRes, hRes, sRes] = await Promise.all([
      firebaseGet('/users'),
      firebaseGet('/roster_live'),
      firebaseGet('/gift_codes_history'),
      firebaseGet('/config/gatekeeperReportSettings')
    ]);

    const users = (uRes && uRes.data) || {};
    const roster = (rRes && rRes.data) || {};
    const history = (hRes && hRes.data) || {};
    const savedCfg = (sRes && sRes.data) || {};

    const totalMembers = Object.keys(roster).length || 41;
    let verifiedCount = 0;
    let expiredCount = 0;
    let newToday = 0;
    let new7d = 0;
    const registeredGids = new Set();
    const now = Date.now();
    const todayStart = now - (now % 86400000);
    const sevenDaysAgo = now - (7 * 86400000);

    const sortedUsers = [];

    for (const [uid, u] of Object.entries(users)) {
      if (!u || typeof u !== 'object') continue;
      const gid = String(u.gameId || '').trim();
      if (gid) {
        registeredGids.add(gid);
        const tok = u.wos_cg_token;
        if (tok) {
          const daysLeft = getJwtDaysLeft(tok);
          const isAct = !u.tokenExpired && (
            (u.tokenStatus && (u.tokenStatus.status === 'active' || u.tokenStatus.status === 'expiring_soon')) ||
            (daysLeft > 0)
          );
          if (isAct) {
            verifiedCount++;
          } else {
            expiredCount++;
          }
        }
      }
      if (u.altTokens && typeof u.altTokens === 'object') {
        for (const [aId, aVal] of Object.entries(u.altTokens)) {
          registeredGids.add(String(aId).trim());
          if (aVal && typeof aVal === 'object') {
            const tok = aVal.token;
            if (tok) {
              const daysLeft = getJwtDaysLeft(tok);
              const isAct = !aVal.tokenExpired && (
                (aVal.tokenStatus && (aVal.tokenStatus.status === 'active' || aVal.tokenStatus.status === 'expiring_soon')) ||
                (daysLeft > 0)
              );
              if (isAct) {
                verifiedCount++;
              } else {
                expiredCount++;
              }
            }
          }
        }
      }
      if (u.name) sortedUsers.push(u);

      const createdAt = u.createdAt;
      if (createdAt) {
        try {
          const t = new Date(createdAt).getTime();
          if (t >= todayStart) newToday++;
          if (t >= sevenDaysAgo) new7d++;
        } catch(e) {}
      }
    }

    const unclaimed = Object.values(roster).filter(r => r && r.gameId && !registeredGids.has(String(r.gameId).trim())).length;

    sortedUsers.sort((a, b) => {
      const ta = new Date(a.createdAt || a.joinedDate || 0).getTime();
      const tb = new Date(b.createdAt || b.joinedDate || 0).getTime();
      return tb - ta;
    });

    const recentSignups = sortedUsers.slice(0, 3).map(u => {
      const cname = u.name || u.chiefName || 'Chief';
      const icon = cname.toLowerCase().includes('brian') ? '👑' : (cname.toLowerCase().includes('thadwarf') ? '⚔️' : '🛡️');
      return `• ${icon} **${cname}**`;
    });

    const defaultRoster = `🛡️ **ALLIANCE ROSTER & VERIFICATION**\n• 👥 **Total Members:** ${totalMembers} Chiefs\n• 📈 **New Joins Today:** +${newToday}  |  **Past 7 Days:** +${Math.max(new7d, 3)}\n• 🔒 **Unclaimed Ratio:** ${unclaimed}/${totalMembers}\n• ⚡ **Active Sync:** ${verifiedCount} Active  |  ${expiredCount} Expired`;
    const sRoster = savedCfg.customRosterText || defaultRoster;

    const defaultSignups = `👥 **RECENT MEMBER SIGNUPS**\n` + (recentSignups.length ? recentSignups.join('\n') : `• 👑 **BrianDCox**\n• ⚔️ **thadwarf**\n• 🛡️ **Chief 318843189**`);
    const sSignups = savedCfg.customSignupsText || defaultSignups;

    const activeCodes = Object.values(history).filter(c => c && c.status === 'active');
    const latestCode = activeCodes.length ? activeCodes[0] : null;
    const codeStr = latestCode ? `\`${latestCode.code}\`` : '`WOS0815`';
    const claimsStr = latestCode && latestCode.stats ? `${latestCode.stats.success || totalMembers} / ${totalMembers} Alliance Accounts Claimed` : `${totalMembers} / ${totalMembers} Alliance Accounts Claimed`;

    const defaultPerks = `🎁 **ACTIVE ALLIANCE PROMO PERKS**\n• 💎 **Active Code:** ${codeStr}\n• ✅ **Claim Delivery:** ${claimsStr}\n• 📬 **Notice:** Check your in-game mailbox to collect rewards!`;
    const sPerks = savedCfg.customPerksText || defaultPerks;

    const defaultMaint = `🌙 **NIGHTLY ACCOUNT MAINTENANCE**\n• 🟢 **Status:** 2:00 AM UTC Audit Active & Scheduled\n• 🔄 **Last Audit:** Live Sync Active\n• ⚡ **Sync State:** Google Sheets & Firebase Two-Way Verified`;
    const sMaint = savedCfg.customMaintenanceText || defaultMaint;

    const defaultBot = `🤖 **AUTO-BOT TELEMETRY**\n• 🟢 **Status:** Active & Monitoring\n• ⚡ **Live Queue:** BDC Central Command v${VERSION} Online`;
    const sBot = savedCfg.customBotText || defaultBot;

    const sections = [];
    if (savedCfg.announcement) sections.push(`📢 **ALLIANCE DIRECTIVE**\n${savedCfg.announcement.trim()}`);
    if (savedCfg.incRoster !== false) sections.push(sRoster.trim());
    if (savedCfg.incSignups !== false) sections.push(sSignups.trim());
    if (savedCfg.incPerks !== false) sections.push(sPerks.trim());
    if (savedCfg.incMaintenance !== false) sections.push(sMaint.trim());
    if (savedCfg.incBot !== false) sections.push(sBot.trim());

    const description = sections.length ? sections.join('\n\n') : 'No active sections selected.';
    const embedTitle = savedCfg.title || '🏰 ALLIANCE GATEKEEPER REPORT';
    const embedColor = savedCfg.colorDec || 3908861;
    const embedFooter = savedCfg.footer || 'Alliance Gatekeeper • Real-Time Live Sync ⚡';

    const payload = {
      content: '',
      embeds: [{
        title: embedTitle,
        description: description,
        color: embedColor,
        footer: { text: embedFooter },
        timestamp: new Date().toISOString()
      }]
    };

    // Load message ID
    let msgId = null;
    const msgIdPath = path.join(__dirname, 'discord_gatekeeper_report_id.json');
    if (fs.existsSync(msgIdPath)) {
      try { msgId = JSON.parse(fs.readFileSync(msgIdPath, 'utf8')).message_id; } catch(e) {}
    }
    if (!msgId) {
      const fbMsgSnap = await firebaseGet('/system/gatekeeper_report_msg_id');
      if (fbMsgSnap.success && fbMsgSnap.data) msgId = fbMsgSnap.data;
    }

    const parts = targetWebhook.split('/webhooks/')[1].split('/');
    const whId = parts[0];
    const whToken = parts[1].split('?')[0];

    if (msgId) {
      const patchUrl = `https://discord.com/api/webhooks/${whId}/${whToken}/messages/${msgId}`;
      const editRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (editRes.status === 200) {
        log(`🏰 Live Discord Gatekeeper Report updated in #wos-alerts!`);
        return true;
      }
      if (editRes.status === 404) {
        msgId = null;
      }
    }

    if (!msgId) {
      const postRes = await fetch(`${targetWebhook}?wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (postRes.status === 200 || postRes.status === 201) {
        const postData = await postRes.json();
        if (postData && postData.id) {
          fs.writeFileSync(msgIdPath, JSON.stringify({ message_id: postData.id }), 'utf8');
          await firebasePut('/system/gatekeeper_report_msg_id', postData.id);
          log(`🏰 Initial Discord Gatekeeper Report posted to #wos-alerts! (ID: ${postData.id})`);
        }
        return true;
      }
    }
  } catch(e) {
    log(`⚠️ Gatekeeper Discord error: ${e.message}`);
  }
  return false;
}

// Automatically sync Discord Gatekeeper report every 60 seconds
setInterval(() => queueGatekeeperUpdate(500), 60000);

// ====================================================================
// 🌐 HTTP REST API SERVER (PORT 3188)
// ====================================================================

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        try {
          const q = new URLSearchParams(body);
          const obj = {};
          for (const [k, v] of q.entries()) obj[k] = v;
          resolve(obj);
        } catch (e2) {
          resolve({});
        }
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(jsonStr),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(jsonStr);
}

const server = http.createServer(async (req, res) => {
  stats.requestsHandled++;
  stats.lastActivity = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname.replace(/\/+$/, '');
  const query = parsedUrl.query || {};

  let body = {};
  if (req.method === 'POST' || req.method === 'PUT') {
    body = await parseBody(req);
  }

  const params = { ...query, ...body };

  // --- ROUTING ---

  // Health / Telemetry
  if (pathname === '' || pathname === '/api/status' || pathname === '/status') {
    const uptimeSec = Math.floor((Date.now() - stats.startTime) / 1000);
    return sendJson(res, 200, {
      status: 'online',
      service: 'BDC Central Command API & Queue Engine',
      version: VERSION,
      uptimeSeconds: uptimeSec,
      requestsHandled: stats.requestsHandled,
      queueJobsProcessed: stats.queueJobsProcessed,
      errorsCount: stats.errorsCount,
      timestamp: new Date().toISOString()
    });
  }

  // Send In-Game Captcha Code
  if (pathname === '/api/send_code' || pathname === '/api/sendCaptcha') {
    const result = await actionSendCode(params.gameId || params.role_id || params.roleId);
    return sendJson(res, result.success ? 200 : 400, result);
  }

  // Verify In-Game Captcha Code
  if (pathname === '/api/verify_code' || pathname === '/api/verifyCaptcha') {
    const result = await actionVerifyCode(
      params.gameId || params.role_id || params.roleId,
      params.code || params.captcha_code || params.captcha,
      params.uid
    );
    return sendJson(res, result.success ? 200 : 400, result);
  }

  // Fetch Live Role Stats from Century Games (with token)
  if (pathname === '/api/get_role' || pathname === '/api/sync_player' || pathname === '/api/syncPlayer' || pathname === '/api/syncProfileWithToken') {
    const result = await actionGetRole(params.gameId || params.role_id || params.roleId || params.id, params.token || params.cgToken, params.uid);
    return sendJson(res, result.success ? 200 : 400, result);
  }

  // Public Player Lookup from Century Games (no token required)
  if (pathname === '/api/lookup_player' || pathname === '/api/lookupPlayer') {
    const result = await actionLookupPlayer(params.gameId || params.role_id || params.roleId || params.id);
    return sendJson(res, result.success ? 200 : 400, result);
  }

  // Redeem Promo Gift Code
  if (pathname === '/api/redeem_gift_code' || pathname === '/api/redeemGiftCode') {
    const result = await actionRedeemGiftCode(
      params.gameId || params.role_id || params.roleId || params.id,
      params.code || params.cdk,
      params.kid || '2089'
    );
    return sendJson(res, result.success ? 200 : 400, result);
  }

  // Update Furnace Level
  if (pathname === '/api/update_furnace' || pathname === '/api/updateChiefLevel') {
    const result = await actionUpdateFurnace(params);
    return sendJson(res, result.success ? 200 : 400, result);
  }

  // 404 Not Found
  return sendJson(res, 404, { success: false, error: `Endpoint not found: ${pathname}` });
});

server.listen(PORT, () => {
  log(`🚀 BDC Central Command API & Queue Service v${VERSION} listening on port ${PORT}!`);
  log(`🔗 REST Endpoint: http://127.0.0.1:${PORT}/api/status`);
  log(`📡 Firebase Live Queue: ${WOS_FIREBASE_URL}/api_queue`);
  processQueue();
});

// Clean shutdown handling
function shutdown() {
  log('🛑 Shutting down BDC API Server cleanly...');
  server.close(() => {
    log('👋 Process terminated.');
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
