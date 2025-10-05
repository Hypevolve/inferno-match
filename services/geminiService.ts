
import { GoogleGenAI, GenerateContentResponse, Content, Type, Part } from "@google/genai";
import { UserProfile, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

const dataUriToPart = (dataUri: string): Part | null => {
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    const [_, mimeType, base64] = match;
    return { inlineData: { mimeType, data: base64 } };
};

const generatePersonaSystemInstruction = (matchProfile: UserProfile): string => {
    const kinksString = matchProfile.kinks.map(k => `${k.name} (${k.level})`).join(', ');
    return `You are ${matchProfile.name}, a ${matchProfile.age}-year-old individual on a dating app called Inferno.
Your bio is: "${matchProfile.bio}".
You are interested in: ${kinksString}.
Your roles are: ${matchProfile.roles.join(', ')}.
You are looking for: ${matchProfile.lookingFor.join(', ')}.
Your personality is flirty, a bit mysterious, and direct. You are on an NSFW-friendly dating app, so you can be suggestive and bold, but don't be vulgar immediately.
Your goal is to have an engaging, seductive conversation. Keep your responses relatively short and conversational, like a real person texting. Use emojis occasionally.
Never break character. Never say you are an AI or a language model. You can see and comment on images sent to you.`;
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
    return history.map(msg => {
        const parts: Part[] = [];
        let text = msg.text || '';
        if (!msg.text) { // Add context for media-only messages
            if (msg.type === 'photo' || msg.imageUrl) text = '[User sent a photo]';
            else if (msg.type === 'video' || msg.videoUrl) text = '[User sent a video]';
            else if (msg.type === 'gif' || msg.gifUrl) text = '[User sent a GIF]';
            else if (msg.type === 'audio' || msg.audioUrl) text = '[User sent a voice message]';
        }

        if (text) {
            parts.push({ text });
        }
        if (msg.imageUrl) {
            const imagePart = dataUriToPart(msg.imageUrl);
            if (imagePart) parts.push(imagePart);
        }
        
        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: parts,
        };
    }).filter(c => c.parts.length > 0);
};

export const getGeminiCompatibilityScore = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<{ score: number; rationale: string; } | null> => {
    const prompt = `
Analyze the compatibility between two dating profiles.
Provide a compatibility score from 0 to 100 and a short, flirty, and intriguing rationale (1-2 sentences).
The rationale should be something the user would see in the app to explain why they are a good match.

User's Profile:
- Name: ${userProfile.name}
- Kinks: ${userProfile.kinks.map(k => `${k.name} (${k.level})`).join(', ')}
- Roles: ${userProfile.roles.join(', ')}
- Looking for: ${userProfile.lookingFor.join(', ')}

Match's Profile:
- Name: ${matchProfile.name}
- Kinks: ${matchProfile.kinks.map(k => `${k.name} (${k.level})`).join(', ')}
- Roles: ${matchProfile.roles.join(', ')}
- Looking for: ${matchProfile.lookingFor.join(', ')}

Based on their shared interests, potential dynamics, and overall vibe, calculate a compatibility score and provide the rationale.
`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Compatibility score from 0 to 100" },
                        rationale: { type: Type.STRING, description: "A short, flirty rationale for the match." }
                    },
                    required: ['score', 'rationale']
                },
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        if (typeof data.score === 'number' && typeof data.rationale === 'string') {
            return data;
        }
        return null;
    } catch (e) {
        console.error("Error getting compatibility score from Gemini:", e);
        return null;
    }
};

export const getGeminiInitialMessage = async (matchProfile: UserProfile): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: "Start our conversation with a flirty and engaging opening message." }] }],
            config: {
                systemInstruction: generatePersonaSystemInstruction(matchProfile),
            },
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error getting initial message from Gemini:", e);
        return `Hey there 😉 I saw your profile and couldn't resist saying hi. You seem... intriguing.`;
    }
};

export const getGeminiIcebreaker = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    const prompt = `
You are a witty and flirty dating assistant for a user named ${userProfile.name}.
Your task is to generate a single, clever icebreaker message for ${userProfile.name} to send to their match, ${matchProfile.name}.
The icebreaker should be based on their profiles and be intriguing enough to get a response. Keep it short and conversational. Do not include any greeting like "Hey" or "Hi". Just provide the message itself.

User's Profile (${userProfile.name}):
- Kinks: ${userProfile.kinks.map(k => k.name).join(', ')}
- Looking for: ${userProfile.lookingFor.join(', ')}

Match's Profile (${matchProfile.name}):
- Bio: ${matchProfile.bio}
- Kinks: ${matchProfile.kinks.map(k => k.name).join(', ')}

Generate one icebreaker suggestion.
`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return response.text.trim().replace(/"/g, ''); // Remove quotes if the model adds them
    } catch (e) {
        console.error("Error getting icebreaker from Gemini:", e);
        return `I noticed you're into ${matchProfile.kinks[0]?.name || 'adventure'}. Tell me more...`;
    }
};

export const getGeminiChatResponse = async (history: ChatMessage[], matchProfile: UserProfile): Promise<string> => {
    try {
        const contents = buildHistory(history);
        const response = await ai.models.generateContent({
            model,
            contents: contents,
            config: {
                systemInstruction: generatePersonaSystemInstruction(matchProfile),
            },
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error getting chat response from Gemini:", e);
        return "I'm not sure what to say to that, but I'm definitely interested in hearing more about you.";
    }
};

export const getGeminiFantasyResponse = async (history: ChatMessage[], scenario: string, userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const contents = buildHistory(history);
        const systemInstruction = getFantasySystemInstruction(scenario, userProfile.name, matchProfile.name);
        const response = await ai.models.generateContent({
            model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error getting fantasy response from Gemini:", e);
        return "My mind is racing with possibilities... what do you do next?";
    }
};

export const getSafetyArticleContent = async (topic: string): Promise<string> => {
    const prompt = `
Generate a concise, informative, and easy-to-understand article for a dating app's Safety Center.
The app is called Inferno and is for adults interested in kink and alternative lifestyles.
The tone should be helpful, non-judgmental, and empowering.
The topic is: "${topic}".

Provide the content as plain text. Use paragraphs for readability. Do not use markdown.
`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return response.text.trim();
    } catch (e) {
        console.error(`Error getting safety article for "${topic}":`, e);
        return `We're sorry, we couldn't load this article at the moment. The core principle of "${topic}" is clear communication and mutual respect. Always prioritize your safety and the safety of your partners.`;
    }
};
