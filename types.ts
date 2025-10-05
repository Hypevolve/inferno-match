
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
  name:string;
  age: number;
  bio: string;
  kinks: Kink[];
  roles: string[];
  lookingFor: string[];
  imageUrl: string; // Main profile picture
  publicAlbum: string[]; // Additional public photos
  privateVault: string[]; // Private photos
  vaultAccessRequestsFrom: string[]; // Array of user IDs who requested access
  vaultAccessGrantedTo: string[]; // Array of user IDs who have access
  videoUrl?: string;
  textPrompts: ProfilePrompt[];
  audioPrompts: AudioPrompt[];
  isVerified: boolean;
  badges: string[]; // Array of badge IDs
  lastActive: number; // UTC timestamp
  height: number; // in cm
  relationshipType: string;
  location: {
    lat: number;
    lon: number;
  };
  isSpotlight?: boolean;
}

export interface ChatMessage {
  id:string;
  text?: string;
  sender: 'user' | 'ai';
  timestamp: number;
  status?: 'sent' | 'read';
  type: 'text' | 'audio' | 'gif' | 'photo' | 'video' | 'system' | 'game' | 'scenario';
  audioUrl?: string; 
  gifUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  isDisappearing?: boolean;
  hasBeenViewed?: boolean;
  duration?: number; // in seconds for audio/video
  reactions?: { [emoji: string]: string[] }; // e.g. { '🔥': ['user'] }
  gameInfo?: { type: 'invite' | 'prompt' | 'result'; text: string; level?: 'Flirty' | 'Spicy' | 'Inferno' };
  scenarioInfo?: { title: string; text: string };
}

export enum Screen {
  AGE_GATE,
  ONBOARDING_WELCOME,
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
  SPOTLIGHT,
  LOGGED_OUT,
}

export interface FilterSettings {
  ageRange: { min: number; max: number };
  distance: number; // in km
  heightRange: { min: number; max: number }; // in cm
  relationshipTypes: string[];
  lookingFor: string[];
  kinks: string[];
  roles: string[];
  verifiedOnly: boolean;
  dealbreakers: {
    distance: boolean;
    ageRange: boolean;
    heightRange: boolean;
    relationshipTypes: boolean;
  };
}
