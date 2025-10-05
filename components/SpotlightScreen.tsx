
import React from 'react';
import { UserProfile } from '../types';
import ProfileCard from './ProfileCard';
import { StarIcon, XIcon, SparklesIcon } from './Icons';

interface SpotlightScreenProps {
  profiles: UserProfile[];
  onSuperLike: (profile: UserProfile) => void;
  onPass: (profile: UserProfile) => void;
}

const SpotlightScreen: React.FC<SpotlightScreenProps> = ({ profiles, onSuperLike, onPass }) => {
  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <header className="p-4 sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10 text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <SparklesIcon className="h-6 w-6 text-brand-accent" />
            <span>Spotlight</span>
        </h1>
        <p className="text-sm text-brand-text-dark">A curated feed of standout profiles just for you.</p>
      </header>
      
      {profiles.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-text-light">Spotlight is Empty</h2>
            <p className="text-brand-text-dark mt-2">Check back soon for more curated profiles!</p>
          </div>
        </div>
      ) : (
        <main className="flex-grow p-4 overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-8">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-brand-surface rounded-2xl shadow-lg pb-4">
                <div className="w-full max-w-sm aspect-[3/5] mx-auto">
                    <ProfileCard profile={profile} />
                </div>
                <div className="flex justify-center items-center gap-6 mt-4">
                    <button onClick={() => onPass(profile)} className="p-5 bg-brand-surface-light rounded-full text-brand-text-light shadow-lg transform transition-all hover:scale-110 active:scale-95">
                        <XIcon className="h-8 w-8" />
                    </button>
                    <button onClick={() => onSuperLike(profile)} className="p-6 bg-brand-surface-light rounded-full text-brand-accent shadow-lg transform transition-all hover:scale-110 active:scale-95">
                        <StarIcon className="h-10 w-10" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default SpotlightScreen;
