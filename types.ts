
export interface ProfilePrompt {
  question: string;
  answer: string;
}

export type KinkLevel = 'Curious' | 'Intermediate' | 'Experienced';

export interface Kink {
  name: string;
  level: KinkLevel;
}

export interface AudioPrompt {
  question: string;
  audioUrl: string;
  duration: number; // in seconds
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  kinks: Kink[];
  roles: string[];
  lookingFor: string[];
  imageUrl: string;
  videoUrl?: string;
  textPrompts: ProfilePrompt[];
  audioPrompts: AudioPrompt[];
  isVerified: boolean;
  badges: string[]; // Array of badge IDs
  lastActive: number; // UTC timestamp
  compatibilityScore?: {
    score: number;
    rationale: string;
  };
}

export interface ChatMessage {
  id:string;
  text?: string;
  sender: 'user' | 'ai';
  timestamp: number;
  status?: 'sent' | 'read';
  type: 'text' | 'audio' | 'gif';
  mediaUrl?: string; // for audio
  gifUrl?: string; // for gifs
  duration?: number; // in seconds for audio
  reactions?: { [emoji: string]: string[] }; // e.g. { '🔥': ['user'] }
}

export enum Screen {
  AGE_GATE,
  PROFILE_CREATOR,
  SWIPE,
  MATCHES,
  PROFILE,
  CHAT,
  VIDEO_CALL,
  LIKES_YOU,
  FILTER,
  PRODUCT_PLAN, // Added
}

export interface FilterSettings {
  ageRange: { min: number; max: number };
  lookingFor: string[];
  kinks: string[];
  roles: string[]; // Added
  verifiedOnly: boolean;
}