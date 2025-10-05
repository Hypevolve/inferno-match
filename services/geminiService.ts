
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
You will be playing the role of ${aiCharacter}. The user is playing the role of ${userCharacter}.
Your role is to advance the story, describe the environment, and respond as your character. Be descriptive, engaging, and seductive.
Keep your responses focused on the scene and immersive. Do not break character.`;
};

// Fix: Add helper function to convert chat messages to Gemini's Content format.
const messageToContent = (messages: ChatMessage[]): Content[] => {
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
            role: msg.sender === 'user' ? 'user' : 'model',
            parts,
        };
    });
};

// Fix: Export getGeminiInitialMessage function.
export const getGeminiInitialMessage = async (matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: "You're starting the conversation. Send a captivating opening message." }] }],
            config: {
                systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting initial message from Gemini:", error);
        return "Hey there ;)";
    }
};

// Fix: Export getGeminiChatResponse function.
export const getGeminiChatResponse = async (messages: ChatMessage[], matchProfile: UserProfile): Promise<string> => {
    try {
        const systemInstruction = generatePersonaSystemInstruction(matchProfile);
        const contents = messageToContent(messages);
        
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return "I'm not sure what to say to that... try something else?";
    }
};

// Fix: Export getGeminiIcebreaker function.
export const getGeminiIcebreaker = async (userProfile: UserProfile, matchProfile: UserProfile): Promise<string> => {
    try {
        const prompt = `You are on a dating app called Inferno. You are user "${userProfile.name}".
        You are looking at the profile of "${matchProfile.name}".
        Their bio is: "${matchProfile.bio}".
        Their kinks are: ${matchProfile.kinks.map(k => k.name).join(', ')}.
        Your task is to generate one single, short, flirty, and direct icebreaker message to send to ${matchProfile.name} based on their profile. The message should be something that can be directly sent. Do not add quotation marks around it.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text.trim().replace(/^"|"$/g, ''); // remove quotes if any
    } catch (error) {
        console.error("Error getting icebreaker from Gemini:", error);
        return "Are you a magician? Because whenever I look at you, everyone else disappears.";
    }
};

// Fix: Export getGeminiFantasyResponse function.
export const getGeminiFantasyResponse = async (
    messages: ChatMessage[],
    scenario: string,
    userProfile: UserProfile,
    matchProfile: UserProfile
): Promise<string> => {
    try {
        const systemInstruction = getFantasySystemInstruction(scenario, userProfile.name, matchProfile.name);
        // Filter out system messages for fantasy history
        const history = messages.filter(m => m.type !== 'system');
        const contents = messageToContent(history);
        
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting fantasy response from Gemini:", error);
        return "My imagination seems to be running wild... let's try that again.";
    }
};

// Fix: Export getSafetyArticleContent function.
export const getSafetyArticleContent = async (title: string): Promise<string> => {
    try {
        const prompt = `You are a safety expert for an NSFW-friendly dating app called Inferno.
        Write a concise, helpful, and easy-to-understand article on the topic: "${title}".
        The tone should be informative and reassuring, not preachy. Use markdown for formatting, like using bold for headings or key terms.`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        // A simple markdown to HTML conversion
        let text = response.text.trim();
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // italics
        return text;
    } catch (error) {
        console.error("Error getting safety article from Gemini:", error);
        return "We're having trouble loading this article right now. Please check back later.";
    }
};
