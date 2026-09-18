import fs from 'node:fs';
import path from 'node:path';
import { renderHogwartsCard } from './render_card.mjs';

const envPath = path.join(import.meta.dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const sortingHatToken = envContent.match(/SORTING_HAT_BOT_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/)?.[1]?.trim();
const housekeeperToken = envContent.match(/DISCORD_BOT_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/)?.[1]?.trim();
const token = sortingHatToken || housekeeperToken;
const headers = { Authorization: `Bot ${token}` };
const GUILD_ID = '964526957721186354';
const GREAT_HALL_ID = '1340457788656058438';
const SORTING_HAT_ID = '1362685213762785363';

const houseConfig = {
  slytherin: { id: '1362693831845220536', name: 'Slytherin', emoji: '🐍', traits: 'Ambition • Cunning • Resourcefulness' },
  gryffindor: { id: '1362687135320375296', name: 'Gryffindor', emoji: '🦁', traits: 'Bravery • Daring • Chivalry' },
  ravenclaw: { id: '1362692640901955694', name: 'Ravenclaw', emoji: '🦅', traits: 'Intelligence • Wisdom • Creativity' },
  hufflepuff: { id: '1362690726990712943', name: 'Hufflepuff', emoji: '🦡', traits: 'Loyalty • Patience • Dedication' }
};

async function deploySpaciousStandings() {
  console.log('🏰 Fetching live server members from Discord API...');

  let membersRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });

  if (!membersRes.ok && housekeeperToken) {
    console.log('ℹ️ Using privileged housekeeper token to audit guild members...');
    membersRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
      headers: { Authorization: `Bot ${housekeeperToken}`, 'Content-Type': 'application/json' }
    });
  }

  if (!membersRes.ok) {
    throw new Error(`Failed to fetch members: ${await membersRes.text()}`);
  }

  const members = await membersRes.json();
  console.log(`Audited ${members.length} members.`);

  const houseData = {
    slytherin: { count: 0, members: [] },
    gryffindor: { count: 0, members: [] },
    ravenclaw: { count: 0, members: [] },
    hufflepuff: { count: 0, members: [] }
  };

  for (const m of members) {
    const roles = m.roles || [];
    const tag = `<@${m.user.id}>`;
    for (const [key, conf] of Object.entries(houseConfig)) {
      if (roles.includes(conf.id)) {
        houseData[key].count++;
        houseData[key].members.push(tag);
      }
    }
  }

  const counts = {
    slytherin: houseData.slytherin.count,
    gryffindor: houseData.gryffindor.count,
    ravenclaw: houseData.ravenclaw.count,
    hufflepuff: houseData.hufflepuff.count
  };

  console.log('Live Counts:', counts);

  // 1. Render Flashy Graphic Card
  console.log('🎨 Generating 2K Flashy Hogwarts Graphic Card...');
  const imagePath = await renderHogwartsCard(counts);

  // 2. Check if existing pinned message is still present in channel
  let targetMessageId = null;
  if (fs.existsSync('hogwarts_state.json')) {
    try {
      const state = JSON.parse(fs.readFileSync('hogwarts_state.json', 'utf8'));
      targetMessageId = state.messageId || state.pinned_message_id;
    } catch (e) {}
  }

  let messageExists = false;
  if (targetMessageId) {
    try {
      const checkRes = await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/messages/${targetMessageId}`, { headers });
      if (checkRes.ok) {
        const msg = await checkRes.json();
        const meRes = await fetch('https://discord.com/api/v10/users/@me', { headers });
        const meUser = await meRes.json();
        if (msg.author?.id === meUser.id) {
          messageExists = true;
          console.log(`📌 Found existing Standings Card (${targetMessageId}) authored by ${meUser.username}! Updating in place...`);
        } else {
          console.log(`⚠️ Standings Card (${targetMessageId}) was authored by ${msg.author?.username} (${msg.author?.id}), not ${meUser.username}. Deleting old message so it can be re-posted as ${meUser.username}...`);
          await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/messages/${targetMessageId}`, {
            method: 'DELETE',
            headers
          });
          messageExists = false;
        }
      }
    } catch (e) {
      console.error('Error verifying existing message author:', e);
    }
  }

  // 3. Build Single Elegant Embed (Directly beneath the 4K top image)
  const rosterEmbed = {
    title: '📜 HOGWARTS HOUSE STANDINGS & OFFICIAL ROSTERS',
    description: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n*Welcome to The Great Hall of Hogwarts School of Witchcraft and Wizardry! Beneath the enchanted candlelit sky, four legendary houses compete for glory and the House Cup. All sorted students are seated at their official house tables below.*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    color: 0xD4AF37,
    fields: [
      {
        name: `🐍 SLYTHERIN HOUSE — ${houseData.slytherin.count} ${houseData.slytherin.count === 1 ? 'Student' : 'Students'}`,
        value: houseData.slytherin.members.length > 0 
          ? `>>> ${houseData.slytherin.members.join(' • ')}`
          : '> *No students sorted yet*',
        inline: false
      },
      {
        name: `🦁 GRYFFINDOR HOUSE — ${houseData.gryffindor.count} ${houseData.gryffindor.count === 1 ? 'Student' : 'Students'}`,
        value: houseData.gryffindor.members.length > 0 
          ? `>>> ${houseData.gryffindor.members.join(' • ')}`
          : '> *No students sorted yet*',
        inline: false
      },
      {
        name: `🦅 RAVENCLAW HOUSE — ${houseData.ravenclaw.count} ${houseData.ravenclaw.count === 1 ? 'Student' : 'Students'}`,
        value: houseData.ravenclaw.members.length > 0 
          ? `>>> ${houseData.ravenclaw.members.join(' • ')}`
          : '> *No students sorted yet*',
        inline: false
      },
      {
        name: `🦡 HUFFLEPUFF HOUSE — ${houseData.hufflepuff.count} ${houseData.hufflepuff.count === 1 ? 'Student' : 'Students'}`,
        value: houseData.hufflepuff.members.length > 0 
          ? `>>> ${houseData.hufflepuff.members.join(' • ')}`
          : '> *No students sorted yet*',
        inline: false
      },
      {
        name: '🎩 HOW TO CLAIM YOUR HOUSE',
        value: `Put on the Sorting Hat during server **Onboarding** or head over to <#${SORTING_HAT_ID}>!`,
        inline: false
      }
    ],
    footer: { text: 'Hogwarts School of Witchcraft and Wizardry • Live Standing Roster' },
    timestamp: new Date().toISOString()
  };

  // 4. Multipart Form Data Post or Patch
  const imageBuffer = fs.readFileSync(imagePath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  const payloadJson = JSON.stringify({ embeds: [rosterEmbed] });

  let postData = '';
  postData += `--${boundary}\r\n`;
  postData += `Content-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n`;
  postData += payloadJson + '\r\n';
  postData += `--${boundary}\r\n`;
  postData += `Content-Disposition: form-data; name="files[0]"; filename="hogwarts_card_render.png"\r\nContent-Type: image/png\r\n\r\n`;

  const preBuffer = Buffer.from(postData, 'utf8');
  const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const fullBody = Buffer.concat([preBuffer, imageBuffer, postBuffer]);

  let finalMessageId = targetMessageId;

  if (messageExists) {
    console.log(`🔄 Updating existing Standings Card (${targetMessageId}) in place with latest rosters...`);
    const patchRes = await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/messages/${targetMessageId}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: fullBody
    });

    if (!patchRes.ok) {
      throw new Error(`Failed to update message: ${await patchRes.text()}`);
    }
    console.log(`✅ Standings Card (${targetMessageId}) updated in place! (Message remains anchored at top)`);
  } else {
    console.log('📤 Posting fresh Standings Card as Message #1 at the top of #🍻・the-great-hall...');
    const postRes = await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/messages`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: fullBody
    });

    if (!postRes.ok) {
      throw new Error(`Failed to post message: ${await postRes.text()}`);
    }

    const createdMsg = await postRes.json();
    finalMessageId = createdMsg.id;
    console.log(`✅ Posted Standings Card as Message #1! Message ID: ${finalMessageId}`);

    // Pin message
    console.log('📌 Pinning in #🍻・the-great-hall...');
    const pinRes = await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/pins/${finalMessageId}`, {
      method: 'PUT',
      headers
    });

    if (pinRes.ok) {
      console.log('✅ Successfully pinned the Standings Card!');
    }

    // Clean pin system notification
    await new Promise(r => setTimeout(r, 1200));
    const recentRes = await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/messages?limit=5`, { headers });
    if (recentRes.ok) {
      const recents = await recentRes.json();
      for (const msg of recents) {
        if (msg.type === 6) { // 6 = CHANNEL_PINNED_MESSAGE
          await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}/messages/${msg.id}`, {
            method: 'DELETE',
            headers
          });
          console.log('🧹 Cleaned system pin notification message.');
        }
      }
    }
  }

  // 7. Save State
  const newState = {
    messageId: finalMessageId,
    channelId: GREAT_HALL_ID,
    lastUpdated: new Date().toISOString(),
    counts
  };
  fs.writeFileSync('hogwarts_state.json', JSON.stringify(newState, null, 2));
  console.log('💾 Saved new message ID to hogwarts_state.json');

  const ccStatePaths = [
    'C:\\Users\\Brian\\Documents\\antigravity\\magical-pasteur\\BDC_Central_Command\\hogwarts_state.json',
    'C:\\Users\\Brian\\Documents\\antigravity\\magical-pasteur\\BDC_Central_Command\\data\\hogwarts_state.json',
    'C:\\Users\\Brian\\Documents\\antigravity\\magical-pasteur\\BDC_Central_Command\\sorting_hat\\hogwarts_state.json',
    '\\\\DESKTOP-1CC6J72\\Users\\Brian\\OneDrive\\Desktop\\BDC Central Command\\hogwarts_state.json',
    '\\\\DESKTOP-1CC6J72\\Users\\Brian\\OneDrive\\Desktop\\BDC Central Command\\data\\hogwarts_state.json',
    '\\\\DESKTOP-1CC6J72\\Users\\Brian\\OneDrive\\Desktop\\BDC Central Command\\sorting_hat\\hogwarts_state.json'
  ];
  for (const ccPath of ccStatePaths) {
    if (fs.existsSync(ccPath)) {
      try {
        const ccData = JSON.parse(fs.readFileSync(ccPath, 'utf8'));
        ccData.pinned_message_id = finalMessageId;
        fs.writeFileSync(ccPath, JSON.stringify(ccData, null, 2));
        console.log(`💾 Synced new pinned message ID to Central Command: ${ccPath}`);
      } catch (e) {}
    }
  }

  // 8. Update Channel Topics with Live Scores
  try {
    const ghTopic = `Main wizarding gathering hall!\n\n🐍 Slytherin: ${counts.slytherin} | 🦁 Gryffindor: ${counts.gryffindor} | 🦅 Ravenclaw: ${counts.ravenclaw} | 🦡 Hufflepuff: ${counts.hufflepuff}`;
    await fetch(`https://discord.com/api/v10/channels/${GREAT_HALL_ID}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: ghTopic })
    });

    const shTopic = `Step up to be sorted!\n\n🐍 Slytherin: ${counts.slytherin} | 🦁 Gryffindor: ${counts.gryffindor} | 🦅 Ravenclaw: ${counts.ravenclaw} | 🦡 Hufflepuff: ${counts.hufflepuff}`;
    await fetch(`https://discord.com/api/v10/channels/${SORTING_HAT_ID}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: shTopic })
    });
    console.log('📡 Synced live house standings to channel topics in The Great Hall and Sorting Hat.');
  } catch (err) {
    console.error('Error updating channel topics:', err);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🎉 SPACIOUS & BALANCED HOGWARTS ROSTER IS LIVE ON DISCORD!');
  console.log('═══════════════════════════════════════════════════════\n');
}

deploySpaciousStandings().catch(console.error);
