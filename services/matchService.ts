
import { UserProfile, ProfilePrompt, Kink, KinkLevel } from '../types';
import { PROFILE_PROMPTS, LOOKING_FOR_OPTIONS, KINK_OPTIONS, ROLE_OPTIONS, KINK_EXPERIENCE_LEVELS } from '../constants';

const NAMES = ['Sophia', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Mia', 'James', 'Chloe', 'Lucas', 'Isabella', 'Mason', 'Zoe', 'Logan'];
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

const getRandomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Ensure we don't generate duplicate profiles in a single batch
const usedNames = new Set<string>();

export const generateMatches = (count: number = 10): UserProfile[] => {
  const matches: UserProfile[] = [];
  
  const availableNames = NAMES.filter(name => !usedNames.has(name));
  if (availableNames.length < count) {
      // Reset if we're out of unique names
      usedNames.clear();
      Object.assign(availableNames, NAMES);
  }

  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(Math.random() * availableNames.length);
    const name = availableNames.splice(nameIndex, 1)[0];
    usedNames.add(name);

    const age = Math.floor(Math.random() * 12) + 20; // Age 20-31
    const id = `match-${name}-${Date.now()}-${i}`;
    let bio = BIOS[Math.floor(Math.random() * BIOS.length)];

    const numPrompts = Math.floor(Math.random() * 2) + 1; // 1 or 2 prompts
    const textPrompts: ProfilePrompt[] = getRandomSubset(PROFILE_PROMPTS, numPrompts).map(q => ({
        question: q,
        answer: PROMPT_ANSWERS[Math.floor(Math.random() * PROMPT_ANSWERS.length)],
    }));
    
    const kinks: Kink[] = getRandomSubset(KINK_OPTIONS, Math.floor(Math.random() * 3) + 2).map(kinkName => ({
        name: kinkName,
        level: KINK_EXPERIENCE_LEVELS[Math.floor(Math.random() * KINK_EXPERIENCE_LEVELS.length)]
    }));

    matches.push({
      id,
      name,
      age,
      bio: bio,
      kinks,
      roles: getRandomSubset(ROLE_OPTIONS, Math.floor(Math.random() * 3) + 1), // 1 to 3 roles
      lookingFor: getRandomSubset(LOOKING_FOR_OPTIONS, Math.floor(Math.random() * 2) + 1), // 1 to 2 tags
      imageUrl: `https://picsum.photos/seed/${id}/400/600`,
      // Use a placeholder video that can be looped
      videoUrl: Math.random() < 0.2 ? `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4` : undefined, // 20% chance of having a video
      textPrompts,
      audioPrompts: [], // Keep audio prompts empty for now
      isVerified: Math.random() < 0.6, // 60% of profiles are verified
      badges: [],
      lastActive: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7), // active within the last week
    });
  }
  return matches;
};
