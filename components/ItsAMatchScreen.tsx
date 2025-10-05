

import React from 'react';
import { UserProfile } from '../types.ts';

interface ItsAMatchScreenProps {
  userProfile: UserProfile;
  matchProfile: UserProfile;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
  isSuperLike: boolean;
}

const ItsAMatchScreen: React.FC<ItsAMatchScreenProps> = ({ userProfile, matchProfile, onSendMessage, onKeepSwiping, isSuperLike }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4">
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
            @keyframes slide-up {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-up {
                animation: slide-up 0.5s 0.2s ease-out forwards;
            }
            .super-match-text {
                background: -webkit-linear-gradient(45deg, #FFC700, #FDDD48, #F0E68C);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        `}</style>
      
      <div className="text-center animate-slide-up opacity-0">
        <h1 className={`text-5xl font-extrabold italic ${isSuperLike ? 'super-match-text' : 'text-white'}`} style={{fontFamily: "'Brush Script MT', cursive'"}}>
            {isSuperLike ? "It's a Super Match!" : "It's a Match!"}
        </h1>
        <p className="text-gray-300 mt-2">
            {isSuperLike 
                ? `${matchProfile.name} super liked you too!`
                : `You and ${matchProfile.name} have liked each other.`
            }
        </p>
      </div>
      
      <div className="flex items-center justify-center my-10 space-x-[-40px]">
        <img src={userProfile.imageUrl} alt={userProfile.name} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl transform -rotate-12" />
        <img src={matchProfile.imageUrl} alt={matchProfile.name} className={`w-40 h-40 rounded-full object-cover border-4 ${isSuperLike ? 'border-brand-accent' : 'border-brand-primary'} shadow-2xl transform rotate-12`} />
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-4 animate-slide-up opacity-0" style={{animationDelay: '0.4s'}}>
        <button
          onClick={onSendMessage}
          className="w-full bg-brand-gradient text-white font-bold py-4 px-4 rounded-full transition-transform duration-300 hover:scale-105 hover:shadow-lg"
        >
          Send a Message
        </button>
        <button
          onClick={onKeepSwiping}
          className="w-full bg-brand-surface-light text-white font-bold py-4 px-4 rounded-full transition-transform duration-300 hover:scale-105"
        >
          Keep Swiping
        </button>
      </div>
    </div>
  );
};

export default ItsAMatchScreen;