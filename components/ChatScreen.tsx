
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { BackIcon, CheckIcon, DoubleCheckIcon, VideoIcon, MicIcon, FlameIcon, XIcon } from './Icons';
import AudioMessageBubble from './AudioMessageBubble';
import { getGeminiChatResponse, getGeminiInitialMessage, getGeminiIcebreaker, getGeminiFantasyResponse } from '../services/geminiService';
import { GIFS } from '../constants';

interface ChatScreenProps {
  userProfile: UserProfile;
  matchProfile: UserProfile;
  onEndChat: () => void;
  onStartVideoCall: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ userProfile, matchProfile, onEndChat, onStartVideoCall }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isFantasyMode, setIsFantasyMode] = useState(false);
  const [fantasyScenario, setFantasyScenario] = useState('');
  const [showFantasyModal, setShowFantasyModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      const initialText = await getGeminiInitialMessage(matchProfile);
      setMessages([{ id: `ai-greeting-${Date.now()}`, text: initialText, sender: 'ai', timestamp: Date.now(), type: 'text' }]);
      setIsLoading(false);
    };
    initializeChat();
    return () => { if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); };
  }, [matchProfile]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  const handleSendMessage = useCallback(async (messageContent: string | { gif: string }) => {
    if (isLoading) return;

    let userMessage: ChatMessage;
    if (typeof messageContent === 'string' && messageContent.trim()) {
        userMessage = { id: `user-${Date.now()}`, text: messageContent, sender: 'user', timestamp: Date.now(), status: 'sent', type: 'text' };
    } else if (typeof messageContent === 'object' && messageContent.gif) {
        userMessage = { id: `user-${Date.now()}`, text: `[User sent a GIF]`, gifUrl: messageContent.gif, sender: 'user', timestamp: Date.now(), status: 'sent', type: 'gif' };
    } else {
        return;
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const responseText = isFantasyMode
        ? await getGeminiFantasyResponse(newMessages, fantasyScenario, userProfile, matchProfile)
        : await getGeminiChatResponse(newMessages, matchProfile);
    
    setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: 'read' } : m));

    const aiMessage: ChatMessage = { id: `ai-response-${Date.now()}`, text: responseText, sender: 'ai', timestamp: Date.now(), type: 'text' };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);

  }, [userInput, isLoading, messages, matchProfile, isFantasyMode, fantasyScenario, userProfile]);

  const handleSendAudio = async (audioUrl: string, duration: number) => {
    const audioMessage: ChatMessage = { id: `user-audio-${Date.now()}`, sender: 'user', timestamp: Date.now(), status: 'sent', type: 'audio', mediaUrl: audioUrl, duration: Math.round(duration), text: '[User sent a voice message]' };
    const newMessages = [...messages, audioMessage];
    setMessages(newMessages);
    setIsLoading(true);
    const responseText = await getGeminiChatResponse(newMessages, matchProfile);
    setMessages(prev => prev.map(m => m.id === audioMessage.id ? { ...m, status: 'read' } : m));
    const aiMessage: ChatMessage = { id: `ai-response-${Date.now()}`, text: responseText, sender: 'ai', timestamp: Date.now(), type: 'text' };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };
  
  const handleIcebreaker = async () => {
      setIsLoading(true);
      const suggestion = await getGeminiIcebreaker(userProfile, matchProfile);
      setUserInput(suggestion);
      setIsLoading(false);
  };
  
  const startFantasyMode = () => {
    if (fantasyScenario.trim()) {
        setIsFantasyMode(true);
        setShowFantasyModal(false);
        const systemMessage: ChatMessage = { id: `system-${Date.now()}`, text: `Fantasy Mode Started: "${fantasyScenario}"`, sender: 'ai', timestamp: Date.now(), type: 'text'};
        setMessages(prev => [...prev, systemMessage]);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(m => {
        if (m.id === messageId) {
            const reactions = { ...(m.reactions || {}) };
            if (!reactions[emoji]) reactions[emoji] = [];
            // Simple toggle for user reaction
            if (reactions[emoji].includes('user')) {
                reactions[emoji] = reactions[emoji].filter(r => r !== 'user');
                if(reactions[emoji].length === 0) delete reactions[emoji];
            } else {
                reactions[emoji].push('user');
            }
            return { ...m, reactions };
        }
        return m;
    }));
  };
  
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.addEventListener("dataavailable", event => {
            audioChunksRef.current.push(event.data);
        });

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingIntervalRef.current = setInterval(() => {
            setRecordingTime(prevTime => prevTime + 1);
        }, 1000);

    } catch (err) {
        console.error("Error starting recording:", err);
        alert("Microphone access was denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const audioUrl = reader.result as string;
                const audio = new Audio(audioUrl);
                audio.onloadedmetadata = () => {
                    handleSendAudio(audioUrl, audio.duration);
                };
            };
            // Stop all media tracks to turn off the mic indicator
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        });
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <header className={`flex items-center justify-between p-4 shadow-md z-10 transition-colors ${isFantasyMode ? 'bg-purple-900/50' : 'bg-brand-surface'}`}>
        <div className="flex items-center">
          <button onClick={onEndChat} className="p-2 text-brand-text-dark hover:text-white"><BackIcon className="h-6 w-6" /></button>
          <img src={matchProfile.imageUrl} alt={matchProfile.name} className="h-10 w-10 rounded-full object-cover ml-4 border-2 border-brand-primary" />
          <div className="ml-4">
            <h2 className="font-bold text-white">{matchProfile.name}</h2>
            <p className={`text-xs ${isFantasyMode ? 'text-purple-300' : 'text-green-400'}`}>{isFantasyMode ? 'Fantasy Mode' : 'Online'}</p>
          </div>
        </div>
         <div className="flex items-center gap-2">
            <button onClick={() => setShowFantasyModal(true)} className="p-2 text-brand-text-dark hover:text-purple-400 transition-colors" title="Start Fantasy Mode"><FlameIcon className="h-6 w-6" /></button>
            <button onClick={onStartVideoCall} className="p-2 text-brand-text-dark hover:text-brand-primary transition-colors"><VideoIcon className="h-6 w-6" /></button>
        </div>
      </header>

      <main className="flex-grow p-4 overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div onDoubleClick={() => handleReaction(msg.id, '🔥')} className={`relative max-w-xs md:max-w-md lg:max-w-lg shadow-md rounded-2xl ${msg.sender === 'user' ? 'bg-brand-gradient text-white rounded-br-none' : 'bg-brand-surface-light text-brand-text-light rounded-bl-none'}`}>
                 <div className="px-4 py-2">
                    {msg.type === 'audio' && msg.mediaUrl ? <AudioMessageBubble message={msg} />
                     : msg.type === 'gif' ? <img src={msg.gifUrl} alt="gif" className="rounded-lg max-h-40" />
                     : <p className="text-sm break-words pr-5">{msg.text}</p>}
                 </div>
                 {msg.sender === 'user' && msg.status && (<div className="absolute bottom-1.5 right-2">{msg.status === 'sent' ? <CheckIcon className="h-4 w-4 text-gray-400" /> : <DoubleCheckIcon className="h-4 w-4 text-brand-accent" />}</div>)}
              </div>
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className="flex gap-1 mt-1">
                    {Object.entries(msg.reactions).map(([emoji, reactors]) => reactors.length > 0 && (
                        <div key={emoji} className="px-1.5 py-0.5 bg-brand-surface-light rounded-full text-xs flex items-center gap-1"><span>{emoji}</span><span className="text-white">{reactors.length}</span></div>
                    ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && !isRecording && (
            <div className="flex justify-start"><div className="px-4 py-3 rounded-2xl bg-brand-surface-light text-brand-text-light rounded-bl-none"><div className="flex items-center space-x-1"><span className="text-sm text-brand-text-dark">Typing</span><div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse delay-75"></div><div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse delay-150"></div><div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse delay-300"></div></div></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 bg-brand-surface">
        <div className="flex items-center bg-brand-surface-light rounded-full px-4 py-1">
            {isRecording ? (
                 <div className="flex items-center justify-between w-full"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><span className="text-red-500 font-mono text-sm">{Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}</span></div><button onClick={stopRecording} className="ml-2 p-2 rounded-full bg-brand-gradient text-white transition-all hover:shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button></div>
            ) : (
                <>
                    <button onClick={handleIcebreaker} disabled={isLoading} className="p-2 text-brand-accent disabled:opacity-50"><FlameIcon className="h-6 w-6" /></button>
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)} placeholder="Say something naughty..." className="flex-grow bg-transparent text-brand-text-light placeholder-brand-text-dark focus:outline-none mx-2" disabled={isLoading} />
                    {userInput.trim() ? (
                        <button onClick={() => handleSendMessage(userInput)} disabled={isLoading} className="ml-2 p-2 rounded-full bg-brand-gradient text-white disabled:opacity-50 transition-all hover:shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                    ) : (
                        <>
                        <button onClick={() => handleSendMessage({ gif: GIFS[Math.floor(Math.random() * GIFS.length)]})} disabled={isLoading} className="p-2 text-white disabled:opacity-50">GIF</button>
                        <button onClick={startRecording} disabled={isLoading} className="ml-2 p-2 rounded-full text-white disabled:opacity-50 transition-all"><MicIcon className="h-6 w-6" /></button>
                        </>
                    )}
                 </>
            )}
        </div>
      </footer>

      {showFantasyModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-brand-surface rounded-lg p-6 max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Enter Fantasy Mode</h2>
                    <button onClick={() => setShowFantasyModal(false)}><XIcon className="w-6 h-6 text-brand-text-dark" /></button>
                </div>
                <p className="text-brand-text-dark mb-4">Describe a roleplay scenario to begin. The AI will act as narrator and your partner.</p>
                <textarea value={fantasyScenario} onChange={e => setFantasyScenario(e.target.value)} rows={4} placeholder="e.g., We're at a clandestine masquerade ball..." className="block w-full bg-brand-surface-light border-transparent rounded-md shadow-sm p-3 text-white placeholder-brand-text-dark mb-4" />
                <button onClick={startFantasyMode} className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg">Start Fantasy</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
