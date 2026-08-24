const crypto = require('crypto');
const https = require('https');

const REAL_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtyQumWtY72VXRcw8FXJg
pq/8J0ySyAiA8KRpF9uI75lth38/2BUghIfX+rireW4EEp617RPwsjnd0SAyhscX
0AexHHjdqUQh43Z0Me5ZuJUR1fh2OFLJfO591Xp/QGc10/3NvuGzklQ/6nSnBvZT
icRqSvp1EyGLc9oYhHaQgqM2sVli8E5ltcPpmVwoDMPY1JyYtRN2pKTH9qHLsNdk
CwVKCchas9Ql5xOarOBTROHm1iwDPQRdwB4U88USyvGeDoVJv836RClNTChMZ9DZ
fiJYYVAiXtGwapAQRyAOlNWjfHxut0aolswQoNqGig2jFLVsYWS3rQMa2RcJVLkX
TwIDAQAB
-----END PUBLIC KEY-----`;

function generateAesKey() {
  const bytes = crypto.randomBytes(16);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function callCenturyApi(path, payloadData, token = null) {
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

    if (token) {
      headers['token'] = token;
    }

    const req = https.request({
      hostname: 'cg-vip-mall-wos.centurygame.com',
      port: 443,
      path: '/api' + path,
      method: 'POST',
      headers: headers
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

    req.on('error', err => resolve({ success: false, error: err.message }));
    req.write(bodyStr);
    req.end();
  });
}

function sanitizeNickname(name) {
  if (!name) return '';
  return String(name)
    .replace(/\u00a0/g, ' ')
    .replace(/\u00c2/g, '')
    .replace(/Â/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCharacterInfo(roleData, defaultRoleId = '') {
  let char = roleData;
  if (roleData && Array.isArray(roleData.user_data) && roleData.user_data.length > 0) {
    char = roleData.user_data.find(u => String(u.role_id) === String(defaultRoleId)) || roleData.user_data[0];
  } else if (roleData && roleData.data && Array.isArray(roleData.data.user_data) && roleData.data.user_data.length > 0) {
    char = roleData.data.user_data.find(u => String(u.role_id) === String(defaultRoleId)) || roleData.data.user_data[0];
  }

  let nickname = (char && (char.nickname || char.name)) || (roleData && (roleData.nickname || roleData.name)) || '';
  nickname = sanitizeNickname(nickname);

  let avatar = (char && (char.icon || char.avatar_image)) || (roleData && (roleData.avatar_image || roleData.icon)) || '';
  let section = (char && (char.section || (char.extra_info && char.extra_info.value))) || (roleData && roleData.section) || '2089';

  let rawStove = (char && (char.stove_lv || char.furnaceLevel)) || (roleData && (roleData.stove_lv || roleData.furnaceLevel)) || '';
  let formattedFurnace = '';

  if (char && char.rank !== undefined && char.rank !== null && char.rank !== '') {
    const rankStr = String(char.rank).trim();
    const rankMatch = rankStr.match(/stove_lv_(\d+)/i);
    if (rankMatch) {
      const num = parseInt(rankMatch[1], 10);
      if (num >= 1 && num <= 10) formattedFurnace = 'FC ' + num;
      else if (num > 30 && num <= 40) formattedFurnace = 'FC ' + (num - 30);
      else formattedFurnace = 'Lv ' + num;
      rawStove = String(num);
    } else {
      const num = parseInt(rankStr, 10);
      if (!isNaN(num)) {
        if (num >= 1 && num <= 30) formattedFurnace = 'Lv ' + num;
        else if (num > 30 && num <= 40) formattedFurnace = 'FC ' + (num - 30);
        else formattedFurnace = 'Lv ' + num;
        rawStove = String(num);
      }
    }
  }

  if (!formattedFurnace && rawStove) {
    const num = parseInt(String(rawStove).trim(), 10);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 30) formattedFurnace = 'Lv ' + num;
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

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  const roleId = args[1];

  if (!action || !roleId) {
    console.log(JSON.stringify({
      success: false,
      error: 'Usage: node century_games_live_bridge.js <send_code|verify_code|get_role> <role_id> [captcha_code|token]'
    }));
    process.exit(1);
  }

  if (action === 'send_code') {
    const res = await callCenturyApi('/auth/get_game_captcha', { role_id: String(roleId) });
    if (res.success && res.data && res.data.code === 1) {
      console.log(JSON.stringify({
        success: true,
        code: 1,
        msg: 'Verification code sent to in-game mailbox in Whiteout Survival!'
      }));
    } else {
      console.log(JSON.stringify({
        success: false,
        code: res.data ? res.data.code : -1,
        msg: res.data ? res.data.msg : (res.error || 'Failed to send verification code')
      }));
    }
    return;
  }

  if (action === 'verify_code') {
    const captchaCode = args[2];
    if (!captchaCode) {
      console.log(JSON.stringify({ success: false, error: 'Missing captcha_code' }));
      process.exit(1);
    }

    const res = await callCenturyApi('/auth/login', {
      login_type: 'role_id_safe',
      role_id: String(roleId),
      captcha_code: String(captchaCode)
    });

    if (res.success && res.data && res.data.code === 1) {
      const loginData = res.data.data || {};
      const token = loginData.token || '';
      let roleData = loginData;

      if (token) {
        const roleRes = await callCenturyApi('/callback/get_role_info', {
          role_id: String(roleId),
          from_desktop_app: 0,
          web_mail_uid: '',
          channel_from: '',
          tga_os: 'windows'
        }, token);

        if (roleRes.success && roleRes.data && roleRes.data.code === 1) {
          roleData = roleRes.data.data || {};
        }
      }

      const extracted = extractCharacterInfo(roleData, roleId);

      console.log(JSON.stringify({
        success: true,
        code: 1,
        token: token,
        nickname: extracted.nickname,
        stove_lv: extracted.stove_lv,
        raw_stove_lv: extracted.raw_stove_lv,
        avatar_image: extracted.avatar_image,
        section: extracted.section,
        userData: roleData
      }));
    } else {
      console.log(JSON.stringify({
        success: false,
        code: res.data ? res.data.code : -1,
        msg: res.data ? res.data.msg : (res.error || 'Failed to verify code')
      }));
    }
    return;
  }

  if (action === 'get_role' || action === 'validate_token') {
    const token = args[2];
    if (!token) {
      console.log(JSON.stringify({ success: false, valid: false, error: 'Missing token' }));
      process.exit(1);
    }
    const res = await callCenturyApi('/callback/get_role_info', {
      role_id: String(roleId),
      from_desktop_app: 0,
      web_mail_uid: '',
      channel_from: '',
      tga_os: 'windows'
    }, token);

    if (res.success && res.data && res.data.code === 1) {
      const roleData = res.data.data || {};
      const extracted = extractCharacterInfo(roleData, roleId);

      console.log(JSON.stringify({
        success: true,
        valid: true,
        code: 1,
        nickname: extracted.nickname,
        stove_lv: extracted.stove_lv,
        raw_stove_lv: extracted.raw_stove_lv,
        avatar_image: extracted.avatar_image,
        section: extracted.section,
        userData: roleData
      }));
    } else {
      const msg = res.data ? res.data.msg : (res.error || 'Token expired or invalid');
      const code = res.data ? res.data.code : -1;
      console.log(JSON.stringify({
        success: false,
        valid: false,
        code: code,
        msg: msg
      }));
    }
    return;
  }

  console.log(JSON.stringify({ success: false, error: `Unknown action: ${action}` }));
}

main();
