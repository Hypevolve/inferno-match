
import { GoogleGenAI, GenerateContentResponse, Content, Type } from "@google/genai";
import { UserProfile, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

const generatePersonaSystemInstruction = (matchProfile: UserProfile): string => {
    const kinksString = matchProfile.kinks.map(k => `${k.name} (${k.level})`).join(', ');
    return `You are ${matchProfile.name}, a ${matchProfile.age}-year-old individual on a dating app called Inferno.
Your bio is: "${matchProfile.bio}".
You are interested in: ${kinksString}.
Your roles are: ${matchProfile.roles.join(', ')}.
You are looking for: ${matchProfile.lookingFor.join(', ')}.
Your personality is flirty, a bit mysterious, and direct. You are on an NSFW-friendly dating app, so you can be suggestive and bold, but don't be vulgar immediately.
Your goal is to have an engaging, seductive conversation. Keep your responses relatively short and conversational, like a real person texting. Use emojis occasionally.
Never break character. Never say you are an AI or a language model.`;
};

const getFantasySystemInstruction = (scenario: string, userCharacter: string, aiCharacter: string): string => {
    return `You are the narrator and a character in an erotic roleplay session on the Inferno dating app.
The scenario is: "${scenario}".
You will be playing the role of ${aiCharacter}. The user is playing ${userCharacter}.
Your role is to drive the story forward, describing the environment, your character's actions, and responding to the user's actions.
Be creative, descriptive, and seductive. Match the user's level of detail.
Keep your responses contained to the roleplay. Do not break character or mention that you are an AI.`;
};

const buildHistory = (history: ChatMessage[]): Content[] => {
    // FIX: Correctly map ChatMessage to Content array for the Gemini API.
    return history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }],
    }));
};

// FIX: Implement and export getGeminiCompatibilityScore for App.tsx
export const getGeminiCompatibilityScore = async (
  userProfile: UserProfile,
  matchProfile: UserProfile,
): Promise<{ score: number; rationale: string } | null> => {
  try {
    const prompt = `Analyze the compatibility between two dating profiles based on their bios, kinks, roles, and what they are looking for.
    
    My Profile:
    Name: ${userProfile.name}
    Bio: ${userProfile.bio}
    Looking for: ${userProfile.lookingFor.join(', ')}
    Roles: ${userProfile.roles.join(', ')}
    Kinks: ${userProfile.kinks.map(k => `${k.name} (${k.level})`).join(', ')}

    Their Profile:
    Name: ${matchProfile.name}
    Bio: ${matchProfile.bio}
    Looking for: ${matchProfile.lookingFor.join(', ')}
    Roles: ${matchProfile.roles.join(', ')}
    Kinks: ${matchProfile.kinks.map(k => `${k.name} (${k.level})`).join(', ')}

    Based on this information, provide a compatibility score from 0 to 100 and a brief, one-sentence rationale for the score. The rationale should be creative and slightly suggestive, fitting the NSFW-friendly dating app theme.
    Your response MUST be in JSON format.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER, description: 'Compatibility score from 0 to 100.' },
                    rationale: { type: Type.STRING, description: 'A brief, one-sentence rationale for the score.' }
                },
                required: ['score', 'rationale']
            }
        }
    });
    
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);

    if (typeof result.score === 'number' && typeof result.rationale === 'string') {
        result.score = Math.max(0, Math.min(100, result.score));
        return result;
    }
    console.error("Parsed Gemini response is not in the expected format:", result);
    return null;

  } catch (error) {
    console.error("Error getting compatibility score:", error);
    return null;
  }
};

// FIX: Implement and export getGeminiInitialMessage for ChatScreen.tsx
export const getGeminiInitialMessage = async (matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const prompt = "Start the conversation with an engaging and flirty opening line based on your profile. Be direct but clever.";
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error getting initial message:", error);
        return "Hey there ;)"; // Fallback message
    }
};

// FIX: Implement and export getGeminiChatResponse for ChatScreen.tsx
export const getGeminiChatResponse = async (history: ChatMessage[], matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const contents = buildHistory(history);
        
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "I'm not sure what to say to that, tell me more."; // Fallback message
    }
};

// FIX: Implement and export getGeminiIcebreaker for ChatScreen.tsx
export const getGeminiIcebreaker = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const prompt = `Based on my profile and their profile, suggest a witty and flirty icebreaker message I can send. Just give me the message, nothing else. The tone should be confident and a little daring.
        
        My Profile:
        Bio: ${userProfile.bio}
        Looking for: ${userProfile.lookingFor.join(', ')}
        Kinks: ${userProfile.kinks.map(k => k.name).join(', ')}

        Their Profile:
        Name: ${matchProfile.name}
        Bio: ${matchProfile.bio}
        Looking for: ${matchProfile.lookingFor.join(', ')}
        Kinks: ${matchProfile.kinks.map(k => k.name).join(', ')}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        let text = response.text.trim();
        if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
        }
        return text;
    } catch (error) {
        console.error("Error getting icebreaker:", error);
        return "Hey, I saw your profile and was intrigued..."; // Fallback
    }
};

// FIX: Implement and export getGeminiFantasyResponse for ChatScreen.tsx
export const getGeminiFantasyResponse = async (
    history: ChatMessage[],
    scenario: string,
    userProfile: UserProfile,
    matchProfile: UserProfile,
): Promise<string> => {
    try {
        const systemInstruction = getFantasySystemInstruction(scenario, userProfile.name, matchProfile.name);
        const contents = buildHistory(history);

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error getting fantasy response:", error);
        return "I seem to have lost my train of thought..."; // Fallback
    }
};
