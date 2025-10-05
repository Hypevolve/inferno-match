
import React from 'react';
import { FlameIcon } from './Icons';

interface OnboardingWelcomeScreenProps {
  onStart: () => void;
}

const OnboardingWelcomeScreen: React.FC<OnboardingWelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-8 bg-brand-bg">
        <style>{`
             @keyframes subtle-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .animate-subtle-float {
                animation: subtle-float 4s ease-in-out infinite;
            }
        `}</style>
      <FlameIcon className="h-24 w-24 text-brand-primary animate-subtle-float" />
      <h1 className="text-4xl font-extrabold text-white mt-6">Welcome to Inferno</h1>
      <p className="text-brand-text-dark mt-4 max-w-sm">
        The space for uncensored connections. Explore your desires, find your match, and ignite your passion.
      </p>
      <button
        onClick={onStart}
        className="w-full max-w-xs mt-10 bg-brand-gradient text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/30"
      >
        Create My Profile
      </button>
    </div>
  );
};

export default OnboardingWelcomeScreen;
