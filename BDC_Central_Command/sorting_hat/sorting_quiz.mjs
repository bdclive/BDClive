import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOUSE_ROLES, buildSortingHatReply } from './house_dialogue.mjs';

function resolveTokenAndGuild() {
  let t = '';
  let g = '964526957721186354';
  const scriptDir = typeof import.meta.dirname === 'string' ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));
  const envCandidates = [
    path.join(scriptDir, '.env'),
    path.resolve('.env')
  ];
  for (const ep of envCandidates) {
    if (fs.existsSync(ep)) {
      try {
        const c = fs.readFileSync(ep, 'utf8');
        const mSort = c.match(/SORTING_HAT_BOT_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/);
        if (mSort) { t = mSort[1].trim(); break; }
        const mDisc = c.match(/DISCORD_BOT_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/);
        if (mDisc) { t = mDisc[1].trim(); }
      } catch {}
    }
  }
  const configCandidates = [
    path.join(scriptDir, '../discord_config.json'),
    path.join(scriptDir, 'discord_config.json'),
    path.resolve('discord_config.json')
  ];
  for (const cp of configCandidates) {
    if (!t && fs.existsSync(cp)) {
      try {
        const dConf = JSON.parse(fs.readFileSync(cp, 'utf8'));
        if (dConf.SORTING_HAT_BOT_TOKEN) t = dConf.SORTING_HAT_BOT_TOKEN.trim();
        else if (dConf.DISCORD_BOT_TOKEN) t = dConf.DISCORD_BOT_TOKEN.trim();
        if (dConf.DISCORD_GUILD_ID) g = dConf.DISCORD_GUILD_ID.trim();
      } catch {}
    }
  }
  return { token: t, guildId: g };
}

const { token, guildId: GUILD_ID } = resolveTokenAndGuild();
const headers = { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' };

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: 'The Midnight Alley',
    prompt: 'You find yourself walking through a dimly lit cobblestone street late at night. You hear a strange, muffled cry echoing from a shadowed alleyway. What is your immediate instinct?',
    options: [
      { house: 'gryffindor', text: 'Advance into the alley immediately with your wand drawn to confront whatever danger lies within.' },
      { house: 'slytherin', text: 'Slip silently into the shadows to observe from a hidden vantage point before deciding your move.' },
      { house: 'ravenclaw', text: 'Pause to evaluate the sound, checking the surroundings for signs of magical enchantments or traps.' },
      { house: 'hufflepuff', text: 'Rush in to offer aid to anyone who might be wounded, prioritizing their safety above all else.' }
    ]
  },
  {
    id: 2,
    title: 'The Forbidden Door',
    prompt: 'While exploring an ancient, forgotten wing of the castle, you discover a heavy iron door sealed with an unyielding magical lock. What thought crosses your mind first?',
    options: [
      { house: 'ravenclaw', text: 'How deeply satisfying it will be to decipher the intricate magical riddle sealing it.' },
      { house: 'hufflepuff', text: 'Wondering if someone or something is trapped behind it in need of rescue.' },
      { house: 'gryffindor', text: 'The sheer thrill of forcing it open and braving whatever is forbidden on the other side.' },
      { house: 'slytherin', text: 'Knowing that whatever is kept under lock and key holds power you could wield.' }
    ]
  },
  {
    id: 3,
    title: 'The History Books',
    prompt: 'Generations from now, how would you most like your name to be remembered in the archives of the wizarding world?',
    options: [
      { house: 'ravenclaw', text: 'The Wise — celebrated for groundbreaking discoveries and unmatched intellect.' },
      { house: 'slytherin', text: 'The Great — remembered as an influential force who achieved what others deemed impossible.' },
      { house: 'hufflepuff', text: 'The Good — cherished for unwavering loyalty, kindness, and lifting up others.' },
      { house: 'gryffindor', text: 'The Bold — immortalized for extraordinary heroics and standing fearless in the dark.' }
    ]
  },
  {
    id: 4,
    title: 'The Four Chalices',
    prompt: 'Four mysterious chalices are placed before you on an enchanted altar. Which one do you drink?',
    options: [
      { house: 'hufflepuff', text: 'The warm golden chalice, smelling of fresh rain, roasted nuts, and hearth-baked bread.' },
      { house: 'slytherin', text: 'The dark obsidian chalice, swirling with an iridescent violet potion that hums with raw power.' },
      { house: 'ravenclaw', text: 'The silver chalice, crystal-clear, with diamond sparkles that whisper ancient forgotten truths.' },
      { house: 'gryffindor', text: 'The crimson chalice, dancing with golden sparks that emit heat and electric excitement.' }
    ]
  },
  {
    id: 5,
    title: 'Group Conflict',
    prompt: 'A bitter dispute breaks out among your companions during an important expedition. How do you handle it?',
    options: [
      { house: 'slytherin', text: 'Take command decisively, directing everyone toward the objective regardless of bruised egos.' },
      { house: 'hufflepuff', text: 'Step in to de-escalate tensions, listening patiently to both sides until harmony is restored.' },
      { house: 'gryffindor', text: 'Step between the arguing parties fearlessly, refusing to let cowardice or infighting jeopardize the group.' },
      { house: 'ravenclaw', text: 'Lay out the objective facts and logical consequences calmly until reason prevails over emotion.' }
    ]
  },
  {
    id: 6,
    title: 'The Boggart’s Mirror',
    prompt: 'When you stare into the dark, what fear unnerves you the most deep down?',
    options: [
      { house: 'slytherin', text: 'Being powerless or forgotten, unable to leave a lasting mark upon the world.' },
      { house: 'ravenclaw', text: 'Being proven ignorant or foolish, lacking the knowledge to solve what matters.' },
      { house: 'hufflepuff', text: 'Being abandoned, isolated, or letting down those who trusted you.' },
      { house: 'gryffindor', text: 'Being paralyzed by cowardice when someone depended on your courage.' }
    ]
  },
  {
    id: 7,
    title: 'The Enduring Gift',
    prompt: 'If you could possess only one enduring gift to carry with you throughout your life, which would you choose?',
    options: [
      { house: 'slytherin', text: 'Invincible Resolve — the iron will to overcome any adversary and rise to the summit.' },
      { house: 'ravenclaw', text: 'Pure Clarity — the perception to see through all illusions and grasp ultimate truth.' },
      { house: 'hufflepuff', text: 'Unshakable Devotion — a bond of fellowship that no distance or darkness can sever.' },
      { house: 'gryffindor', text: 'Untamed Valor — a roaring fire in your spirit that never bends, breaks, or cowers.' }
    ]
  }
];

// In-memory active quiz sessions
export const quizSessions = new Map();

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateProgressBar(current, total) {
  const filled = '🟩'.repeat(current);
  const empty = '⬛'.repeat(total - current);
  return `[${filled}${empty}] **Question ${current} of ${total}**`;
}

export function renderQuestion(userId, questionIndex, shuffledOptions) {
  const q = QUIZ_QUESTIONS[questionIndex];
  const labels = ['A', 'B', 'C', 'D'];

  let description = `*${q.prompt}*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  shuffledOptions.forEach((opt, idx) => {
    description += `**[ ${labels[idx]} ]** ${opt.text}\n\n`;
  });
  description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${generateProgressBar(questionIndex + 1, QUIZ_QUESTIONS.length)}`;

  const embed = {
    author: {
      name: 'The Sorting Hat • Hogwarts Ceremony',
      icon_url: 'https://cdn-icons-png.flaticon.com/512/864/864388.png'
    },
    title: `🎩 HOGWARTS CEREMONY: ${q.title.toUpperCase()}`,
    description,
    color: 0xD4AF37,
    footer: { text: 'Select the choice that best reflects your true instincts' }
  };

  const buttons = shuffledOptions.map((opt, idx) => ({
    type: 2, // BUTTON
    style: 2, // SECONDARY (Gray, neutral)
    label: `Choice ${labels[idx]}`,
    custom_id: `quiz_${userId}_${questionIndex}_${idx}`
  }));

  const components = [
    {
      type: 1, // ACTION_ROW
      components: buttons
    }
  ];

  return { embed, components };
}

export function startQuiz(userId) {
  const firstOptions = shuffleArray(QUIZ_QUESTIONS[0].options);
  const session = {
    userId,
    questionIndex: 0,
    scores: { slytherin: 0, gryffindor: 0, ravenclaw: 0, hufflepuff: 0 },
    currentOptions: firstOptions,
    startedAt: Date.now()
  };
  quizSessions.set(userId, session);

  return renderQuestion(userId, 0, firstOptions);
}

export async function handleQuizAnswer(userId, questionIndex, optionIdx) {
  let session = quizSessions.get(userId);
  if (!session) {
    return startQuiz(userId);
  }

  // Prevent duplicate clicks on wrong question index
  if (session.questionIndex !== questionIndex) {
    return renderQuestion(userId, session.questionIndex, session.currentOptions);
  }

  const chosenOption = session.currentOptions[optionIdx];
  if (chosenOption && chosenOption.house) {
    session.scores[chosenOption.house]++;
  }

  session.questionIndex++;

  // More questions remaining
  if (session.questionIndex < QUIZ_QUESTIONS.length) {
    const nextOptions = shuffleArray(QUIZ_QUESTIONS[session.questionIndex].options);
    session.currentOptions = nextOptions;
    return renderQuestion(userId, session.questionIndex, nextOptions);
  }

  // Quiz Finished! Determine winning house
  let winningHouseKey = 'gryffindor';
  let maxScore = -1;
  for (const [houseKey, score] of Object.entries(session.scores)) {
    if (score > maxScore) {
      maxScore = score;
      winningHouseKey = houseKey;
    }
  }

  const winningHouse = HOUSE_ROLES[winningHouseKey];
  quizSessions.delete(userId); // Cleanup session

  console.log(`🎉 Quiz Complete for User ${userId}! Scores:`, session.scores, `-> Result: ${winningHouse.name}`);

  // Automatically assign Discord Role!
  try {
    const roleUrl = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${winningHouse.id}`;
    const assignRes = await fetch(roleUrl, { method: 'PUT', headers });
    if (assignRes.ok) {
      console.log(`✅ Assigned ${winningHouse.name} role (${winningHouse.id}) to user ${userId}`);
    } else {
      console.error(`⚠️ Failed to assign role: ${await assignRes.text()}`);
    }

    // Remove 🎩 Unsorted role if student had it
    const unsortedRoleUrl = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/1549533277642166394`;
    await fetch(unsortedRoleUrl, { method: 'DELETE', headers }).catch(() => {});
  } catch (e) {
    console.error('Error assigning role:', e);
  }

  // Build Final Sorting Hat Verdict & 4K House Crest
  const reply = buildSortingHatReply(userId, [winningHouse.id]);

  return {
    isFinished: true,
    house: winningHouse.name,
    houseKey: winningHouseKey,
    winningHouse,
    embed: {
      ...reply.embed,
      title: `⚡ THE SORTING HAT HAS DECIDED: ${winningHouse.name.toUpperCase()}!`,
      description: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n*A thorough examination of your mind, your fears, and your greatest instincts has brought clarity!*\n\n${reply.embed.description.replace(/━/g, '').trim()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    },
    fileAttachment: reply.fileAttachment,
    components: [] // Remove buttons
  };
}
