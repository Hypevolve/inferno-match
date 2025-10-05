


import { GoogleGenAI, Content, Part } from "@google/genai";
import { UserProfile, ChatMessage } from '../types.ts';

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
if (!apiKey) {
    console.warn("Gemini API key is not configured. Falling back to mock responses.");
}
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
You will be playing the role of ${aiCharacter}. The user is playing the role of ${userCharacter}.
Your role is to advance the story, describe the environment, and respond as your character. Be descriptive, sensual, and engaging. Keep the story moving forward based on the user's responses.`;
};

// FIX: Added helper function to convert chat messages to Gemini's content format.
const chatMessagesToContent = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => {
        const parts: Part[] = [];
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        if (msg.imageUrl) {
            const imagePart = dataUriToPart(msg.imageUrl);
            if (imagePart) parts.push(imagePart);
        }
        return {
            role: msg.sender === 'ai' ? 'model' : 'user',
            parts: parts,
        };
    }).filter(c => c.parts.length > 0);
};

// FIX: Implemented and exported getGeminiInitialMessage
export const getGeminiInitialMessage = async (matchProfile: UserProfile): Promise<string> => {
    if (!ai) {
        return "Hey there ;)";
    }
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const response = await ai.models.generateContent({
            model: model,
            contents: "Send your very first opening message to the user. Be flirty and interesting. Don't be too forward, just enough to get them curious.",
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting initial message from Gemini:", error);
        return "Hey there ;)"; // Fallback message
    }
};

// FIX: Implemented and exported getGeminiChatResponse
export const getGeminiChatResponse = async (messages: ChatMessage[], matchProfile: UserProfile): Promise<string> => {
    if (!ai) {
        const latest = messages[messages.length - 1];
        return latest?.text ? `Tell me more about "${latest.text}"...` : "I'm not sure what to say to that...";
    }
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const contents = chatMessagesToContent(messages);

        if (contents.length === 0) {
            return "I'm not sure what to say to that...";
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return "I'm not sure what to say to that... try something else?"; // Fallback message
    }
};

// FIX: Implemented and exported getGeminiIcebreaker
export const getGeminiIcebreaker = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    if (!ai) {
        return `So, ${matchProfile.name}, should we skip the small talk or savor it?`;
    }
    try {
        const prompt = `Based on our profiles, suggest a flirty and interesting icebreaker I (the user) can send to you.
        My profile name: ${userProfile.name}. My bio: "${userProfile.bio}". My interests: ${userProfile.kinks.map(k => k.name).join(', ')}.
        Your profile (who I'm talking to) name: ${matchProfile.name}. Your bio: "${matchProfile.bio}". Your interests: ${matchProfile.kinks.map(k => k.name).join(', ')}.
        Just return the message text, nothing else before or after. Don't wrap it in quotes.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful dating assistant for an app called Inferno. You help users craft witty and engaging messages."
            }
        });

        let text = response.text.trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            text = text.substring(1, text.length - 1);
        }
        return text;
    } catch (error) {
        console.error("Error getting icebreaker from Gemini:", error);
        return "What's the most adventurous thing you've ever done?"; // Fallback
    }
};

// FIX: Implemented and exported getGeminiFantasyResponse
export const getGeminiFantasyResponse = async (messages: ChatMessage[], scenario: string, userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    if (!ai) {
        return `Let's imagine ${scenario.toLowerCase()}... you start and I'll follow.`;
    }
    try {
        const systemInstruction = getFantasySystemInstruction(scenario, userProfile.name, matchProfile.name);
        const history = chatMessagesToContent(messages.filter(m => m.type !== 'system' && m.type !== 'game'));

        if (history.length === 0) {
            // This is the first turn after starting fantasy mode. The AI should start the story.
            history.push({ role: 'user', parts: [{ text: `(The scene begins: ${scenario})` }] });
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: history,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting fantasy response from Gemini:", error);
        return "I seem to have lost my train of thought... Where were we?"; // Fallback
    }
};

// FIX: Implemented and exported getSafetyArticleContent
export const getSafetyArticleContent = async (title: string): Promise<string> => {
    if (!ai) {
        return `${title}\n\n• Prioritize consent and communication.\n• Take things at a pace that feels good for everyone involved.\n• Check back soon for more detailed guidance.`;
    }
    try {
        const systemInstruction = "You are a helpful assistant for Inferno, an NSFW-friendly dating app. Your role is to provide clear, helpful, and non-judgmental information about BDSM and kink safety. Your tone should be informative, reassuring, and sex-positive. Use clear headings and bullet points (using simple text and newlines) to make the content easy to read.";
        const prompt = `Write a short article for the app's Safety Center on the topic: "${title}". Cover the key points in a concise and easy-to-understand way. Structure it with a main title, and then paragraphs or bulleted lists.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error getting safety article for "${title}":`, error);
        return "We couldn't load this article right now. Please check your connection and try again."; // Fallback
    }
};