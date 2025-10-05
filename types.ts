
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
  type: 'text' | 'audio' | 'gif' | 'photo' | 'video';
  audioUrl?: string; 
  gifUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  isDisappearing?: boolean;
  hasBeenViewed?: boolean;
  duration?: number; // in seconds for audio/video
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
  PRODUCT_PLAN,
  VERIFICATION,
  SAFETY_CENTER,
}

export interface FilterSettings {
  ageRange: { min: number; max: number };
  lookingFor: string[];
  kinks: string[];
  roles: string[];
  verifiedOnly: boolean;
}
