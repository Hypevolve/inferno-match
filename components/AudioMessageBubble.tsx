
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface AudioMessageBubbleProps {
    message: ChatMessage;
}

const formatTime = (seconds: number): string => {
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60).toString().padStart(2, '0');
    const sec = (floorSeconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
};

const AudioMessageBubble: React.FC<AudioMessageBubbleProps> = ({ message }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handleTimeUpdate = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
            setCurrentTime(audio.currentTime);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);


    return (
        <div className="flex items-center gap-2 p-2 rounded-2xl w-60" style={{
            background: message.sender === 'user' ? 'linear-gradient(to right, #FF3B91, #E4007C)' : '#282531'
        }}>
            <audio ref={audioRef} src={message.mediaUrl} preload="metadata"></audio>
            <button onClick={togglePlay} className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/20 rounded-full text-white">
                {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <div className="flex-grow flex flex-col justify-center text-white">
                <div className="w-full h-1.5 bg-white/30 rounded-full">
                    <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-xs font-mono text-right mt-1">
                   {formatTime(isPlaying ? currentTime : message.duration || 0)}
                </div>
            </div>
        </div>
    );
};

export default AudioMessageBubble;
