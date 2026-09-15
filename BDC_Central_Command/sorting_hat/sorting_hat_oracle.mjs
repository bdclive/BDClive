import fs from 'node:fs';
import path from 'node:path';
import { fork } from 'node:child_process';
import { buildSortingHatReply, buildGreatHallProclamation, detectUserHouse, HOUSE_ROLES } from './house_dialogue.mjs';
import { startQuiz, handleQuizAnswer } from './sorting_quiz.mjs';

function resolveTokenAndGuild() {
  let t = '';
  let g = '964526957721186354';
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    try {
      const c = fs.readFileSync(envPath, 'utf8');
      const m = c.match(/DISCORD_BOT_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (m) t = m[1].trim();
    } catch {}
  }
  const configPaths = [
    path.resolve('../discord_config.json'),
    path.resolve('discord_config.json'),
    'C:/Users/Brian/Documents/antigravity/magical-pasteur/BDC_Central_Command/discord_config.json'
  ];
  for (const cp of configPaths) {
    if (!t && fs.existsSync(cp)) {
      try {
        const dConf = JSON.parse(fs.readFileSync(cp, 'utf8'));
        if (dConf.DISCORD_BOT_TOKEN) t = dConf.DISCORD_BOT_TOKEN.trim();
        if (dConf.DISCORD_GUILD_ID) g = dConf.DISCORD_GUILD_ID.trim();
      } catch {}
    }
  }
  return { token: t, guildId: g };
}

const { token, guildId: GUILD_ID } = resolveTokenAndGuild();
const headers = { Authorization: `Bot ${token}` };
const APP_ID = '1539623982356111360';
const SORTING_HAT_CHANNEL = '1362685213762785363';
const GREAT_HALL_CHANNEL = '1340457788656058438';
const UNSORTED_ROLE_ID = '1549533277642166394';

console.log('🧙 Starting Sorting Hat Interactive Oracle & 7-Question Quiz Daemon...');

let ws = null;
let heartbeatInterval = null;
let lastSeq = null;
let reconnectDelay = 2000;

function sendMultipart(url, method, payloadJson, fileAttachment) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let postData = '';
  postData += `--${boundary}\r\n`;
  postData += `Content-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n`;
  postData += JSON.stringify(payloadJson) + '\r\n';

  let fullBody;
  if (fileAttachment && fs.existsSync(fileAttachment.path)) {
    const fileBuf = fs.readFileSync(fileAttachment.path);
    postData += `--${boundary}\r\n`;
    postData += `Content-Disposition: form-data; name="files[0]"; filename="${fileAttachment.filename}"\r\nContent-Type: image/jpeg\r\n\r\n`;
    const preBuf = Buffer.from(postData, 'utf8');
    const postBuf = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    fullBody = Buffer.concat([preBuf, fileBuf, postBuf]);
  } else {
    postData += `--${boundary}--\r\n`;
    fullBody = Buffer.from(postData, 'utf8');
  }

  return fetch(url, {
    method,
    headers: {
      ...headers,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: fullBody
  });
}

function triggerLeaderboardRefresh() {
  console.log('🔄 Triggering background Great Hall leaderboard refresh...');
  try {
    const child = fork('deploy_flashy_standings.mjs', [], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch (e) {
    console.error('Error triggering leaderboard refresh:', e);
  }
}

const recentProclamations = new Map();

async function postGreatHallProclamation(userId, houseKey, username = '') {
  const lastAnnounced = recentProclamations.get(userId);
  // Debounce duplicate clicks within 30 seconds
  if (lastAnnounced && Date.now() - lastAnnounced < 30000) {
    console.log(`⏱️ Skipping duplicate Great Hall proclamation for ${userId} (debounced)`);
    return false;
  }
  recentProclamations.set(userId, Date.now());

  try {
    const proclamation = buildGreatHallProclamation(userId, houseKey);
    const sendUrl = `https://discord.com/api/v10/channels/${GREAT_HALL_CHANNEL}/messages`;
    const payload = {
      content: proclamation.content,
      embeds: [proclamation.embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5, // LINK
              label: '🏆 View Full Standings',
              url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
            },
            {
              type: 2,
              style: 5, // LINK
              label: '🎩 Take Sorting Ceremony',
              url: `https://discord.com/channels/${GUILD_ID}/${SORTING_HAT_CHANNEL}`
            }
          ]
        }
      ]
    };

    const res = await sendMultipart(sendUrl, 'POST', payload, proclamation.fileAttachment);
    if (res.ok) {
      console.log(`📢 Proclaimed new ${houseKey} student ${username || userId} in #🍻・the-great-hall!`);
      
      // Persist to hogwarts_state.json
      try {
        const stateFile = path.resolve('hogwarts_state.json');
        if (fs.existsSync(stateFile)) {
          const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
          if (!state.announced_students) state.announced_students = {};
          state.announced_students[userId] = {
            house: houseKey,
            username: username || '',
            timestamp: new Date().toISOString()
          };
          fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

          // Also mirror to Central Command's data dir if exists
          const ccState = path.resolve('../magical-pasteur/BDC_Central_Command/hogwarts_state.json');
          if (fs.existsSync(ccState)) {
            try { fs.writeFileSync(ccState, JSON.stringify(state, null, 2)); } catch {}
          }
          const ccDataState = path.resolve('../magical-pasteur/BDC_Central_Command/data/hogwarts_state.json');
          if (fs.existsSync(ccDataState)) {
            try { fs.writeFileSync(ccDataState, JSON.stringify(state, null, 2)); } catch {}
          }
        }
      } catch (err) {
        console.error('Error saving announced student to state:', err);
      }
      return true;
    } else {
      console.error(`⚠️ Failed to post Great Hall proclamation:`, await res.text());
      return false;
    }
  } catch (err) {
    console.error('Error sending Great Hall proclamation:', err);
    return false;
  }
}

async function handleSlashCommand(interaction) {
  const { id, token: intToken, data, member } = interaction;
  const userId = member?.user?.id;
  const username = member?.user?.username;
  console.log(`🪄 Slash Command /${data.name} from ${username} (${userId})`);

  if (data.name === 'standings' || data.name === 'houses') {
    let counts = { slytherin: 3, gryffindor: 2, ravenclaw: 1, hufflepuff: 0 };
    try {
      if (fs.existsSync('hogwarts_state.json')) {
        const state = JSON.parse(fs.readFileSync('hogwarts_state.json', 'utf8'));
        if (state.counts) counts = state.counts;
        else if (state.house_counts) counts = state.house_counts;
      }
    } catch (e) {}

    const sortedHouses = [
      { name: 'Slytherin', key: 'slytherin', emoji: '🐍', count: counts.slytherin || 0, color: 0x2ECC71 },
      { name: 'Gryffindor', key: 'gryffindor', emoji: '🦁', count: counts.gryffindor || 0, color: 0xE74C3C },
      { name: 'Ravenclaw', key: 'ravenclaw', emoji: '🦅', count: counts.ravenclaw || 0, color: 0x3498DB },
      { name: 'Hufflepuff', key: 'hufflepuff', emoji: '🦡', count: counts.hufflepuff || 0, color: 0xF1C40F }
    ].sort((a, b) => b.count - a.count);

    const leader = sortedHouses[0];
    const totalSorted = sortedHouses.reduce((sum, h) => sum + h.count, 0);

    const embed = {
      author: {
        name: 'The Sorting Hat • Hogwarts Standings',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/864/864388.png'
      },
      title: '🏆 HOGWARTS HOUSE CUP STANDINGS',
      description: [
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `👑 **Current Leader**: **${leader.name.toUpperCase()}** with **${leader.count}** students!`,
        `*Total Sorted Students across Hogwarts:* **${totalSorted}**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      ].join('\n'),
      color: leader.color,
      fields: sortedHouses.map((h, i) => ({
        name: `${i === 0 ? '👑 ' : ''}${h.emoji} ${h.name.toUpperCase()} HOUSE`,
        value: `>>> **${h.count}** ${h.count === 1 ? 'Student' : 'Students'} • *${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Place*`,
        inline: true
      })),
      footer: {
        text: 'Live standings updated in The Great Hall • Pinned card reflects full rosters'
      },
      timestamp: new Date().toISOString()
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5, // LINK
            label: '🏰 Visit The Great Hall',
            url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
          },
          {
            type: 2,
            style: 5, // LINK
            label: '🎩 Sorting Room',
            url: `https://discord.com/channels/${GUILD_ID}/${SORTING_HAT_CHANNEL}`
          }
        ]
      }
    ];

    await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4,
        data: { embeds: [embed], components }
      })
    });
    console.log(`✅ Sent /${data.name} standings to ${username}!`);
    return;
  }

  if (data.name === 'sortme' || data.name === 'quiz') {
    // Start 7-Question Quiz
    const quizState = startQuiz(userId);
    await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          embeds: [quizState.embed],
          components: quizState.components
        }
      })
    });
    console.log(`✅ Started 7-Question Sorting Ceremony Quiz for ${username}!`);
    return;
  }

  // /myhouse or /sortinghat command
  await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 5 }) // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
  });

  const roles = member?.roles || [];
  const reply = buildSortingHatReply(userId, roles);

  let components = [];
  if (!reply.isSorted) {
    components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1, // PRIMARY
            label: '🎩 Take the Sorting Ceremony Quiz',
            custom_id: `start_quiz_${userId}`
          },
          {
            type: 2,
            style: 5, // LINK
            label: '🏆 View Great Hall Standings',
            url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
          }
        ]
      }
    ];
  } else {
    components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5, // LINK
            label: '🏆 View Great Hall Standings',
            url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
          }
        ]
      }
    ];
  }

  const editUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${intToken}/messages/@original`;
  await sendMultipart(editUrl, 'PATCH', { embeds: [reply.embed], components }, reply.fileAttachment);
  console.log(`✅ Sent /myhouse reply to ${username}! House: ${reply.house || 'Unsorted'}`);
}

async function handleButtonInteraction(interaction) {
  const { id, token: intToken, data, member, message } = interaction;
  const customId = data.custom_id;
  const clickerId = member?.user?.id;

  console.log(`🔘 Button Clicked: ${customId} by ${member?.user?.username}`);

  // 1a. User clicked the permanent station button in #sorting-hat
  if (customId === 'start_ceremony_quiz') {
    const quizState = startQuiz(clickerId);
    await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          embeds: [quizState.embed],
          components: quizState.components,
          flags: 64 // EPHEMERAL: Private to this wizard, allowing multiple simultaneous students!
        }
      })
    });
    console.log(`✅ Started private 7-Question Ceremony Quiz for ${member?.user?.username} (${clickerId})`);
    return;
  }

  // 1b. User clicked "Take the Sorting Ceremony Quiz" button from /myhouse
  if (customId.startsWith('start_quiz_')) {
    const targetUserId = customId.replace('start_quiz_', '');
    if (clickerId !== targetUserId) {
      await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: { content: '❌ Only the wizard being sorted may consult the hat!', flags: 64 } // EPHEMERAL
        })
      });
      return;
    }

    const quizState = startQuiz(clickerId);
    await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 7, // UPDATE_MESSAGE
        data: {
          embeds: [quizState.embed],
          components: quizState.components
        }
      })
    });
    return;
  }

  // 2. User clicked an answer choice: quiz_${userId}_${questionIndex}_${optionIdx}
  if (customId.startsWith('quiz_')) {
    const parts = customId.split('_');
    const targetUserId = parts[1];
    const questionIndex = parseInt(parts[2], 10);
    const optionIdx = parseInt(parts[3], 10);

    if (clickerId !== targetUserId) {
      await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 4,
          data: { content: '❌ Only the wizard taking the ceremony may choose their path!', flags: 64 }
        })
      });
      return;
    }

    // Process answer
    const result = await handleQuizAnswer(clickerId, questionIndex, optionIdx);

    // If more questions remaining: update message embed & buttons
    if (!result.isFinished) {
      await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 7, // UPDATE_MESSAGE
          data: {
            embeds: [result.embed],
            components: result.components
          }
        })
      });
      return;
    }

    // Final result! ACK with defer update, then send multipart with crest seal
    await fetch(`https://discord.com/api/v10/interactions/${id}/${intToken}/callback`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 6 }) // DEFERRED_UPDATE_MESSAGE
    });

    const editUrl = `https://discord.com/api/v10/webhooks/${APP_ID}/${intToken}/messages/@original`;
    const finalComponents = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5, // LINK
            label: '🏆 View Great Hall Standings',
            url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
          }
        ]
      }
    ];
    await sendMultipart(editUrl, 'PATCH', { embeds: [result.embed], components: finalComponents }, result.fileAttachment);
    console.log(`🎉 Official Ceremony Complete! Sorted ${member?.user?.username} into ${result.house}!`);

    // 📢 Proclaim new sorting in #🍻・the-great-hall!
    await postGreatHallProclamation(clickerId, result.houseKey, member?.user?.username);

    // Trigger leaderboard table refresh in background
    triggerLeaderboardRefresh();
  }
}

async function handleMessage(message) {
  if (message.author?.bot) return;

  const isMentioned = message.mentions?.some(u => u.id === APP_ID);
  const isInSortingChannel = message.channel_id === SORTING_HAT_CHANNEL || message.channel_id === GREAT_HALL_CHANNEL;
  const contentLower = (message.content || '').toLowerCase();

  const isHouseQuery = contentLower.includes('house') ||
                       contentLower.includes('sort') ||
                       contentLower.includes('who am i') ||
                       contentLower.includes('which house') ||
                       contentLower.includes('what house');

  if (!isMentioned && !(isInSortingChannel && isHouseQuery)) {
    return;
  }

  console.log(`📜 Sorting Hat query from ${message.author.username} in channel ${message.channel_id}`);

  // Fetch member roles
  let roles = message.member?.roles;
  if (!roles) {
    try {
      const memRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${message.author.id}`, { headers });
      if (memRes.ok) {
        const memData = await memRes.json();
        roles = memData.roles || [];
      }
    } catch (e) {}
  }

  const reply = buildSortingHatReply(message.author.id, roles || []);

  let components = [];
  if (!reply.isSorted) {
    components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1,
            label: '🎩 Take the Sorting Ceremony Quiz',
            custom_id: `start_quiz_${message.author.id}`
          },
          {
            type: 2,
            style: 5, // LINK
            label: '🏆 View Standings',
            url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
          }
        ]
      }
    ];
  } else {
    components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5, // LINK
            label: '🏆 View Great Hall Standings',
            url: `https://discord.com/channels/${GUILD_ID}/${GREAT_HALL_CHANNEL}`
          }
        ]
      }
    ];
  }

  const sendUrl = `https://discord.com/api/v10/channels/${message.channel_id}/messages`;
  const payload = {
    embeds: [reply.embed],
    components,
    message_reference: {
      message_id: message.id
    }
  };

  const res = await sendMultipart(sendUrl, 'POST', payload, reply.fileAttachment);
  if (res.ok) {
    console.log(`✅ Replied to ${message.author.username}! House: ${reply.house || 'Unsorted'}`);
  } else {
    console.error(`❌ Failed to post message:`, await res.text());
  }
}

function connectGateway() {
  console.log('📡 Connecting to Discord Gateway WebSocket...');
  ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

  ws.onopen = () => {
    console.log('🔌 WebSocket connection established.');
    reconnectDelay = 2000;
  };

  ws.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      const { op, t, d, s } = msg;
      if (s) lastSeq = s;

      if (op === 10) { // HELLO
        console.log(`❤️ Heartbeat configured (${d.heartbeat_interval}ms)`);
        clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 1, d: lastSeq }));
          }
        }, d.heartbeat_interval);

        // Identify with GUILDS (1) + GUILD_MEMBERS (2) + GUILD_MESSAGES (512)
        ws.send(JSON.stringify({
          op: 2,
          d: {
            token,
            intents: 1 | 2 | 512,
            properties: { os: 'windows', browser: 'BDC_HouseKeeper', device: 'BDC_HouseKeeper' }
          }
        }));
      } else if (op === 1) {
        ws.send(JSON.stringify({ op: 1, d: lastSeq }));
      } else if (op === 7 || op === 9) {
        console.log(`⚠️ Received Gateway op ${op}. Reconnecting...`);
        ws.close();
      } else if (t === 'READY') {
        console.log(`\n═══════════════════════════════════════════════════════`);
        console.log(`🧙 SORTING HAT ORACLE & 7-QUESTION QUIZ IS LIVE!`);
        console.log(`Bot: ${d.user.username} (ID: ${d.user.id})`);
        console.log(`Commands: /myhouse • /sortme • /quiz • @mentions • Buttons`);
        console.log(`═══════════════════════════════════════════════════════\n`);
      } else if (t === 'INTERACTION_CREATE') {
        if (d.type === 2) { // Slash Command
          await handleSlashCommand(d);
        } else if (d.type === 3) { // Button Component Click
          await handleButtonInteraction(d);
        }
      } else if (t === 'MESSAGE_CREATE') {
        await handleMessage(d);
      } else if (t === 'GUILD_MEMBER_UPDATE') {
        const uId = d.user?.id;
        const newRoles = d.roles || [];

        // Check if member selected "IDK.. haven't talked to the Sorting Hat yet!?" in Onboarding (Unsorted role)
        const isUnsorted = newRoles.includes(UNSORTED_ROLE_ID);
        if (isUnsorted && uId) {
          const stateFile = path.resolve('hogwarts_state.json');
          let alreadyWelcomed = false;
          try {
            if (fs.existsSync(stateFile)) {
              const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
              if (state.welcomed_unsorted_students && state.welcomed_unsorted_students[uId]) {
                alreadyWelcomed = true;
              }
            }
          } catch {}

          if (!alreadyWelcomed) {
            console.log(`🪄 Unsorted student arrived from onboarding: ${d.user?.username} (${uId})`);
            try {
              const welcomeContent = `⚡ Greetings <@${uId}>! Welcome to Hogwarts! Step up to the stool above and click **[ 🎩 Step Forward & Take the Sorting Ceremony Quiz ]** to consult the Hat!`;
              const welcomeRes = await fetch(`https://discord.com/api/v10/channels/${SORTING_HAT_CHANNEL}/messages`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: welcomeContent })
              });

              if (welcomeRes.ok) {
                const welcomeMsg = await welcomeRes.json();
                console.log(`🔔 Sent welcome notification to #sorting-hat for ${d.user?.username} (msg: ${welcomeMsg.id})`);

                // Auto-delete welcome ping after 3 minutes to keep chamber pristine
                setTimeout(async () => {
                  try {
                    await fetch(`https://discord.com/api/v10/channels/${SORTING_HAT_CHANNEL}/messages/${welcomeMsg.id}`, {
                      method: 'DELETE',
                      headers
                    });
                    console.log(`🧹 Auto-cleaned welcome ping for ${uId}`);
                  } catch {}
                }, 180000);
              }

              // Persist to state
              if (fs.existsSync(stateFile)) {
                const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
                if (!state.welcomed_unsorted_students) state.welcomed_unsorted_students = {};
                state.welcomed_unsorted_students[uId] = {
                  username: d.user?.username || '',
                  timestamp: new Date().toISOString()
                };
                fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
              }
            } catch (err) {
              console.error('Error welcoming unsorted student:', err);
            }
          }
        }

        const houseObj = detectUserHouse(newRoles);
        if (houseObj && uId) {
          const stateFile = path.resolve('hogwarts_state.json');
          let alreadyAnnounced = false;
          try {
            if (fs.existsSync(stateFile)) {
              const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
              if (state.announced_students && state.announced_students[uId]) {
                alreadyAnnounced = true;
              }
            }
          } catch {}
          if (!alreadyAnnounced) {
            console.log(`🏰 New house member detected via onboarding/update: ${d.user?.username} -> ${houseObj.name}`);
            await postGreatHallProclamation(uId, houseObj.key, d.user?.username);
            triggerLeaderboardRefresh();
          }
        }
      }
    } catch (err) {
      console.error('Error handling gateway event:', err);
    }
  };

  ws.onclose = (ev) => {
    console.log(`🔌 WebSocket disconnected (code: ${ev.code}). Reconnecting in ${reconnectDelay}ms...`);
    clearInterval(heartbeatInterval);
    setTimeout(connectGateway, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err.message || err);
  };
}

connectGateway();
