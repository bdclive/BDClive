import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const HOUSE_ROLES = {
  slytherin: {
    id: '1362693831845220536',
    key: 'slytherin',
    name: 'Slytherin',
    emoji: '🐍',
    color: 0x2ECC71,
    traits: 'Ambition • Cunning • Resourcefulness',
    crestFile: 'slytherin_crest.jpg',
    crestPath: path.resolve(__dirname, 'assets/house_crests/slytherin_crest.jpg'),
    quotes: [
      (user) => `*Ahhh, yes... I remember your mind well, ${user}! Shrewd, fiercely ambitious, and possessing a great thirst to prove yourself. No doubt about it—you belong among the serpents of **SLYTHERIN!*** 🐍`,
      (user) => `*A grand destiny awaits you, ${user}! Resourceful, cunning, and destined to achieve greatness. The dungeon fires burn bright for **SLYTHERIN!*** 🐍`,
      (user) => `*I see immense determination in your spirit, ${user}. A sharp instinct that knows how to navigate any challenge to victory. You sit proud in **SLYTHERIN!*** 🐍`
    ]
  },
  gryffindor: {
    id: '1362687135320375296',
    key: 'gryffindor',
    name: 'Gryffindor',
    emoji: '🦁',
    color: 0xE74C3C,
    traits: 'Bravery • Daring • Chivalry',
    crestFile: 'gryffindor_crest.jpg',
    crestPath: path.resolve(__dirname, 'assets/house_crests/gryffindor_crest.jpg'),
    quotes: [
      (user) => `*Ha! That courage is unmistakable, ${user}! A heart bursting with bravery, daring, and chivalrous fire. Your home stands proud high in the tower with **GRYFFINDOR!*** 🦁`,
      (user) => `*There is true grit in your veins, ${user}! Unafraid of the shadows, standing boldly in defense of your allies. A true lion of **GRYFFINDOR!*** 🦁`,
      (user) => `*Ah! A bold spirit walks among us, ${user}! Your chivalrous fire shines like a beacon across the castle. Without hesitation: **GRYFFINDOR!*** 🦁`
    ]
  },
  ravenclaw: {
    id: '1362692640901955694',
    key: 'ravenclaw',
    name: 'Ravenclaw',
    emoji: '🦅',
    color: 0x3498DB,
    traits: 'Intelligence • Wisdom • Creativity',
    crestFile: 'ravenclaw_crest.jpg',
    crestPath: path.resolve(__dirname, 'assets/house_crests/ravenclaw_crest.jpg'),
    quotes: [
      (user) => `*Hmm... an inquisitive mind, sharp as a talon, ${user}! Wit beyond measure, boundless creativity, and wisdom. An eagle through and through—you dwell in **RAVENCLAW!*** 🦅`,
      (user) => `*Ah, a seeker of knowledge and ancient mysteries, ${user}! Clever, eccentric, and intellectually fearless. Your aerie awaits in **RAVENCLAW!*** 🦅`,
      (user) => `*A brilliant spark of intellect, ${user}! Wisdom and original thought guide your every step. You take flight with **RAVENCLAW!*** 🦅`
    ]
  },
  hufflepuff: {
    id: '1362690726990712943',
    key: 'hufflepuff',
    name: 'Hufflepuff',
    emoji: '🦡',
    color: 0xF1C40F,
    traits: 'Loyalty • Patience • Dedication',
    crestFile: 'hufflepuff_crest.jpg',
    crestPath: path.resolve(__dirname, 'assets/house_crests/hufflepuff_crest.jpg'),
    quotes: [
      (user) => `*Ah, true, loyal, and just, ${user}! Unafraid of honest toil, with an unwavering devotion to your companions. You wear the yellow and black of **HUFFLEPUFF!*** 🦡`,
      (user) => `*A good and steadfast heart, ${user}! Where kindness, patience, and fierce loyalty dwell together. You are warmly welcomed into **HUFFLEPUFF!*** 🦡`,
      (user) => `*Sweet-natured yet fiercely protective of your clan, ${user}! A true friend to all who walk these halls. Stand proud with **HUFFLEPUFF!*** 🦡`
    ]
  }
};

export const UNSORTED_QUOTES = [
  (user) => `*Hmm... curious, very curious, ${user}! You ask me of your house, yet you haven't placed me upon your head! Put on the Sorting Hat in <#1362685213762785363> or complete server **Onboarding** to discover your true house!* 🎩`,
  (user) => `*A newcomer with an unwritten destiny, ${user}! The magic hasn't taken hold yet because you haven't been sorted! Step into <#1362685213762785363> to find where you belong!* 🎩`
];

export function detectUserHouse(memberRoles = []) {
  for (const house of Object.values(HOUSE_ROLES)) {
    if (memberRoles.includes(house.id)) {
      return house;
    }
  }
  return null;
}

export function buildSortingHatReply(userId, memberRoles = []) {
  const userTag = `<@${userId}>`;
  const house = detectUserHouse(memberRoles);

  if (!house) {
    const randomQuote = UNSORTED_QUOTES[Math.floor(Math.random() * UNSORTED_QUOTES.length)](userTag);
    return {
      isSorted: false,
      embed: {
        author: {
          name: 'The Sorting Hat • Hogwarts School',
          icon_url: 'https://cdn-icons-png.flaticon.com/512/864/864388.png'
        },
        title: '🎩 AN UNWRITTEN DESTINY',
        description: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${randomQuote}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        color: 0xD4AF37,
        fields: [
          {
            name: '🎩 How to Get Sorted',
            value: '>>> Select your house in <#1362685213762785363> or complete server **Onboarding**!',
            inline: false
          }
        ],
        footer: { text: 'Hogwarts School of Witchcraft and Wizardry • Sorting Ceremony' },
        timestamp: new Date().toISOString()
      },
      fileAttachment: null
    };
  }

  const randomQuote = house.quotes[Math.floor(Math.random() * house.quotes.length)](userTag);

  return {
    isSorted: true,
    house: house.name,
    embed: {
      author: {
        name: 'The Sorting Hat • Hogwarts School',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/864/864388.png'
      },
      title: `${house.emoji} OFFICIAL HOUSE CONFIRMATION: ${house.name.toUpperCase()}`,
      description: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${randomQuote}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      color: house.color,
      fields: [
        {
          name: '✨ House Virtues',
          value: `>>> *${house.traits}*`,
          inline: true
        },
        {
          name: '🏰 Seating',
          value: `>>> Take your seat at the **${house.name} Table** in <#1340457788656058438>!`,
          inline: true
        }
      ],
      image: {
        url: `attachment://${house.crestFile}`
      },
      footer: {
        text: `Hogwarts School of Witchcraft and Wizardry • Official ${house.name} Crest Seal`
      },
      timestamp: new Date().toISOString()
    },
    fileAttachment: {
      filename: house.crestFile,
      path: house.crestPath
    }
  };
}

export function buildGreatHallProclamation(userId, houseKey) {
  const house = HOUSE_ROLES[houseKey] || HOUSE_ROLES.gryffindor;
  const quoteFn = house.quotes[Math.floor(Math.random() * house.quotes.length)];
  const userTag = `<@${userId}>`;
  const speech = quoteFn(userTag);

  const embed = {
    author: {
      name: 'The Sorting Hat • Ceremony at The Great Hall',
      icon_url: 'https://cdn-icons-png.flaticon.com/512/864/864388.png'
    },
    title: `⚡ THE SORTING HAT HAS PROCLAIMED: ${house.name.toUpperCase()}! ${house.emoji}`,
    description: [
      `*Silence fell across the Great Hall as the ancient hat deliberated upon the stool...*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `**Step forward, ${userTag}!**`,
      `\n${speech}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    ].join('\n'),
    color: house.color,
    fields: [
      {
        name: `${house.emoji} House Virtues`,
        value: `>>> **${house.traits}**`,
        inline: true
      },
      {
        name: '🏰 House Table',
        value: `>>> Take your seat with **<@&${house.id}>**!`,
        inline: true
      }
    ],
    image: {
      url: `attachment://${house.crestFile}`
    },
    footer: {
      text: 'Hogwarts School of Witchcraft and Wizardry • Pinned leaderboard updated',
      icon_url: 'https://cdn-icons-png.flaticon.com/512/864/864388.png'
    },
    timestamp: new Date().toISOString()
  };

  return {
    content: `🔔 ⚡ **A new student has been sorted in The Great Hall!** Welcome ${userTag} to **${house.name.toUpperCase()}**! ${house.emoji}`,
    embed,
    fileAttachment: {
      filename: house.crestFile,
      path: house.crestPath
    }
  };
}

