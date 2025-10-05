

import { UserProfile, ProfilePrompt, Kink, KinkLevel } from '../types.ts';
import { PROFILE_PROMPTS, LOOKING_FOR_OPTIONS, KINK_OPTIONS, ROLE_OPTIONS, KINK_EXPERIENCE_LEVELS, RELATIONSHIP_TYPE_OPTIONS } from '../constants.ts';

const NAMES = ['Sophia', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Mia', 'James', 'Chloe', 'Lucas', 'Isabella', 'Mason', 'Zoe', 'Logan', 'Aria', 'Ethan', 'Riley', 'Carter'];
const BIOS = [
  "Just a free spirit looking for a deep connection. Let's explore the city and each other.",
  "Tech geek by day, adventurer by weekend. My dog thinks I'm cool, so I have that going for me.",
  "Artist with a passion for spicy food and old movies. Tell me your favorite film and I'll tell you mine.",
  "Fitness enthusiast who loves a good cheat meal. Looking for a workout partner and a partner in crime.",
  "I'm an open book, but I prefer to be read by candlelight. Let's get lost in conversation.",
  "Sarcasm is my love language. If you can keep up, you might just win me over. Or at least a second date.",
  "World traveler with a bad case of wanderlust. Looking for someone to get lost with.",
  "Bookworm who occasionally pretends to be an extrovert. I'd rather be at home with a good book, but I'll make an exception for you."
];
const PROMPT_ANSWERS = [
    "finding out together.", "you telling me yours first.", "a little bit of danger.", "making you blush.", "not being afraid to ask for what they want.", "pineapple."
];

// Base location (San Francisco)
const BASE_LAT = 37.7749;
const BASE_LON = -122.4194;

const getRandomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const usedNames = new Set<string>();

export const generateMatches = (count: number = 10): UserProfile[] => {
  const matches: UserProfile[] = [];
  
  const availableNames = NAMES.filter(name => !usedNames.has(name));
  if (availableNames.length < count) {
      usedNames.clear();
      Object.assign(availableNames, NAMES);
  }

  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(Math.random() * availableNames.length);
    const name = availableNames.splice(nameIndex, 1)[0];
    usedNames.add(name);

    const id = `match-${name}-${Date.now()}-${i}`;
    
    const kinks: Kink[] = getRandomSubset(KINK_OPTIONS, Math.floor(Math.random() * 3) + 2).map(kinkName => ({
        name: kinkName,
        level: KINK_EXPERIENCE_LEVELS[Math.floor(Math.random() * KINK_EXPERIENCE_LEVELS.length)]
    }));

    // Fix: Add missing properties to conform to UserProfile type.
    matches.push({
      id,
      name,
      age: Math.floor(Math.random() * 12) + 20, // Age 20-31
      bio: BIOS[Math.floor(Math.random() * BIOS.length)],
      kinks,
      roles: getRandomSubset(ROLE_OPTIONS, Math.floor(Math.random() * 3) + 1),
      lookingFor: getRandomSubset(LOOKING_FOR_OPTIONS, Math.floor(Math.random() * 2) + 1),
      imageUrl: `https://picsum.photos/seed/${id}/400/600`,
      publicAlbum: [`https://picsum.photos/seed/${id}-1/400/600`, `https://picsum.photos/seed/${id}-2/400/600`],
      privateVault: Math.random() > 0.5 ? [`https://picsum.photos/seed/${id}-p1/400/600`] : [],
      vaultAccessRequestsFrom: [],
      vaultAccessGrantedTo: [],
      videoUrl: Math.random() < 0.2 ? `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4` : undefined,
      textPrompts: getRandomSubset(PROFILE_PROMPTS, Math.floor(Math.random() * 2) + 1).map(q => ({
        question: q,
        answer: PROMPT_ANSWERS[Math.floor(Math.random() * PROMPT_ANSWERS.length)],
      })),
      audioPrompts: [],
      isVerified: Math.random() < 0.6,
      badges: [],
      lastActive: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7),
      height: Math.floor(Math.random() * 41) + 155, // 155cm - 195cm
      relationshipType: RELATIONSHIP_TYPE_OPTIONS[Math.floor(Math.random() * RELATIONSHIP_TYPE_OPTIONS.length)],
      location: {
        lat: BASE_LAT + (Math.random() - 0.5) * 2, // Jitter within approx +/- 2 degrees
        lon: BASE_LON + (Math.random() - 0.5) * 2,
      },
      isSpotlight: Math.random() < 0.25, // 25% chance of being a spotlight profile
    });
  }
  return matches;
};