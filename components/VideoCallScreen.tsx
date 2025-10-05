
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { PhoneHangUpIcon, MicOnIcon, MicOffIcon, VideoOnIcon, VideoOffIcon } from './Icons';
import { ICEBREAKER_QUESTIONS } from '../constants';

interface VideoCallScreenProps {
  userProfile: UserProfile;
  matchProfile: UserProfile;
  onEndCall: () => void;
}

const VIBE_CHECK_DURATION = 3 * 60; // 3 minutes
const QUESTION_INTERVAL = 30 * 1000; // 30 seconds

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ userProfile, matchProfile, onEndCall }) => {
    const [isConnecting, setIsConnecting] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [timeLeft, setTimeLeft] = useState(VIBE_CHECK_DURATION);
    const [currentQuestion, setCurrentQuestion] = useState("");
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const questionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
            setIsVideoOff(prev => !prev);
        }
    };
    
    const handleEndCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
        onEndCall();
    }

    const selectNewQuestion = () => {
        const newQuestion = ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)];
        setCurrentQuestion(newQuestion);
    };

    useEffect(() => {
        const setupCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                setTimeout(() => setIsConnecting(false), 1500);
            } catch (error) {
                console.error("Failed to start video call:", error);
                alert("Could not access camera/microphone. Please check permissions and try again.");
                onEndCall();
            }
        };
        setupCall();
        return () => {
             if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
             if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
             if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
        };
    }, [onEndCall]);

    useEffect(() => {
        if(isConnecting) return;

        selectNewQuestion();
        questionIntervalRef.current = setInterval(selectNewQuestion, QUESTION_INTERVAL);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleEndCall();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Simulate remote user speaking
        const speakingInterval = setInterval(() => {
            const isSpeakingNow = Math.random() > 0.6;
            setIsSpeaking(isSpeakingNow);
            if(isSpeakingNow && speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current)
            if(isSpeakingNow) speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), Math.random() * 2000 + 1000)
        }, 3000);

        return () => {
            clearInterval(timer);
            clearInterval(speakingInterval);
            if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
        };
    }, [isConnecting]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            <div className={`absolute inset-0 transition-all duration-500 ${isSpeaking ? 'speaking-pulse' : ''}`}>
                <img src={matchProfile.imageUrl} alt={matchProfile.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>
            <video ref={localVideoRef} autoPlay muted playsInline className={`absolute top-4 right-4 w-28 h-44 rounded-lg object-cover border-2 border-white/50 shadow-2xl z-20 transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}></video>

            {/* Vibe Check UI */}
            {!isConnecting && (
                 <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center text-white z-10 p-2 bg-black/30 rounded-lg">
                    <h2 className="font-bold text-xl drop-shadow-lg">Vibe Check: {formatTime(timeLeft)}</h2>
                </div>
            )}
            
            {currentQuestion && !isConnecting && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 p-4 bg-black/40 rounded-lg max-w-sm animate-fade-in">
                    <h3 className="text-2xl font-bold drop-shadow-lg">{currentQuestion}</h3>
                </div>
            )}


            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-6">
                <button onClick={toggleMute} className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <MicOffIcon className="h-8 w-8 text-white" /> : <MicOnIcon className="h-8 w-8 text-white" />}
                </button>
                 <button onClick={toggleVideo} className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110" aria-label={isVideoOff ? 'Video on' : 'Video off'}>
                    {isVideoOff ? <VideoOffIcon className="h-8 w-8 text-white" /> : <VideoOnIcon className="h-8 w-8 text-white" />}
                </button>
                <button onClick={handleEndCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110" aria-label="End call">
                    <PhoneHangUpIcon className="h-8 w-8 text-white" />
                </button>
            </div>
        </div>
    );
};

export default VideoCallScreen;
