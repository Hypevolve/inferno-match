
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
Be creative, descriptive, and seductive. Match the user's level of detail`;
};

// FIX: Implement and export missing service functions.
const profileToText = (profile: UserProfile): string => {
  return `
    Name: ${profile.name}
    Age: ${profile.age}
    Bio: "${profile.bio}"
    Kinks: ${profile.kinks.map(k => `${k.name} (${k.level})`).join(', ') || 'Not specified'}
    Roles: ${profile.roles.join(', ') || 'Not specified'}
    Looking for: ${profile.lookingFor.join(', ') || 'Not specified'}
    Relationship Type: ${profile.relationshipType}
    Text Prompts: ${profile.textPrompts.map(p => `Q: ${p.question} A: ${p.answer}`).join(' | ')}
  `.trim();
};

export const getGeminiCompatibilityScore = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<{ score: number; summary: string; } | null> => {
    try {
        const prompt = `
Analyze the compatibility between these two dating app users for a BDSM and kink-focused app called Inferno.
Provide a compatibility score from 0 to 100 and a very short, one-sentence summary of their compatibility.

User 1:
${profileToText(userProfile)}

User 2:
${profileToText(matchProfile)}

Based on their kinks, roles, what they are looking for, and general bio, determine how compatible they are.
A high score means they have very compatible interests and relationship goals. A low score means they are likely a poor match.
Focus on shared kinks, complementary roles (e.g., Dominant and Submissive), and similar relationship intentions.
`;
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "A compatibility score from 0 to 100." },
                summary: { type: Type.STRING, description: "A one-sentence summary of their compatibility." },
            },
            required: ["score", "summary"],
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.5,
            },
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);
        
        return { score: data.score, summary: data.summary };

    } catch (error) {
        console.error("Error getting Gemini compatibility score:", error);
        return null;
    }
};

export const getGeminiInitialMessage = async (matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const prompt = "Write a short, flirty opening message to send to a new match. Make it intriguing.";

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting Gemini initial message:", error);
        return `Hey there 😉`; // Fallback message
    }
};

const chatHistoryToContents = (messages: ChatMessage[]): Content[] => {
    // Filter out system messages that are not for the model
    return messages
        .filter(msg => msg.id.startsWith('user-') || msg.id.startsWith('ai-'))
        .map(msg => {
            const role = msg.sender === 'user' ? 'user' : 'model';
            // ChatScreen.tsx seems to create a 'text' property even for media messages
            return { role, parts: [{ text: msg.text || '' }] };
    });
};

export const getGeminiChatResponse = async (messages: ChatMessage[], matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const contents = chatHistoryToContents(messages);
        
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
                // Add a stop sequence to prevent rambling
                stopSequences: ["\n\n"],
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting Gemini chat response:", error);
        return "Sorry, my mind went blank for a moment... what were we talking about? 😉";
    }
};

export const getGeminiIcebreaker = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const prompt = `
You are a dating coach for an NSFW-friendly dating app called Inferno.
Your client is about to message a new match.
Based on their profiles, suggest a single, clever, and flirty icebreaker message for your client to send.
The icebreaker should be a question or a playful observation that invites a response.
Keep it short and witty. Do not include any intro like "Here's a suggestion:". Just provide the message.

Your Client's Profile:
${profileToText(userProfile)}

Their Match's Profile:
${profileToText(matchProfile)}

Generate one icebreaker message:
`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 1.0, // more creative
            },
        });

        return response.text.trim().replace(/^"|"$/g, ''); // Remove quotes if any
    } catch (error) {
        console.error("Error getting Gemini icebreaker:", error);
        return "I was going to write something clever, but your profile made me forget my pickup line."; // Fallback
    }
};

export const getGeminiFantasyResponse = async (messages: ChatMessage[], scenario: string, userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = getFantasySystemInstruction(scenario, userProfile.name, matchProfile.name);
        // Filter out the initial system message about fantasy mode starting
        const history = messages.filter(msg => !msg.id.startsWith('system-'));
        const contents = chatHistoryToContents(history);
        
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting Gemini fantasy response:", error);
        return "*(OOC: The connection seems to have flickered for a moment. Where were we? Let's continue the story...)*";
    }
};

export const getSafetyArticleContent = async (title: string): Promise<string> => {
    try {
        const prompt = `
You are a safety advisor for an NSFW-friendly, BDSM & kink dating app called Inferno.
Write a helpful and non-judgmental article for users on the topic of "${title}".
The tone should be informative, empowering, and sex-positive.
Focus on practical advice, communication, and setting boundaries.
Use clear paragraphs separated by newlines. You can use hyphens (-) for lists.
Do not include a title in the response, as it's already provided. Start directly with the content.
Do not use markdown formatting like #, ##, or **.
`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.6,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error getting Gemini safety article:", error);
        return "We're currently updating our safety resources. Please check back later.";
    }
};
