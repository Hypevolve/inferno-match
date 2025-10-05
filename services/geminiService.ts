
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
    return history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }]
    }));
};

// FIX: Completed the function which was previously cut off, causing a return type error.
export const getGeminiChatResponse = async (history: ChatMessage[], matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const contents = buildHistory(history);

        const response = await ai.models.generateContent({
            model,
            contents: contents,
            config: {
                systemInstruction,
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting Gemini chat response:", error);
        return "Sorry, I'm having a little trouble thinking right now. 😉";
    }
};

// FIX: Added missing function `getGeminiInitialMessage` required by ChatScreen.tsx.
export const getGeminiInitialMessage = async (matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const prompt = "Write a short, flirty, and engaging opening message to a new match. Your message should invite a response.";

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting initial message:", error);
        return "Hey there ;)";
    }
};

// FIX: Added missing function `getGeminiIcebreaker` required by ChatScreen.tsx.
export const getGeminiIcebreaker = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const prompt = `Based on these two profiles, suggest a witty and slightly naughty icebreaker question or opening line that the user can send.
        
        USER PROFILE:
        - Looking for: ${userProfile.lookingFor.join(', ')}
        - Kinks: ${userProfile.kinks.map(k => k.name).join(', ')}
        - Roles: ${userProfile.roles.join(', ')}
        - Bio: ${userProfile.bio}

        MATCH PROFILE:
        - Name: ${matchProfile.name}
        - Looking for: ${matchProfile.lookingFor.join(', ')}
        - Kinks: ${matchProfile.kinks.map(k => k.name).join(', ')}
        - Roles: ${matchProfile.roles.join(', ')}
        - Bio: ${matchProfile.bio}

        The icebreaker should be a single message, ready to be sent. Do not include any explanation or prefixes like "Here's a suggestion:". Just provide the message text itself.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        // Remove quotes if the model wraps the response in them
        let text = response.text.trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            text = text.substring(1, text.length - 1);
        }
        return text;
    } catch (error) {
        console.error("Error getting icebreaker:", error);
        return "What's the most adventurous thing you've ever done?";
    }
};

// FIX: Added missing function `getGeminiFantasyResponse` required by ChatScreen.tsx.
export const getGeminiFantasyResponse = async (history: ChatMessage[], scenario: string, userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = getFantasySystemInstruction(scenario, userProfile.name, matchProfile.name);
        const contents = buildHistory(history);

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting Gemini fantasy response:", error);
        return "My imagination is running a bit wild right now... what were we doing again?";
    }
};
