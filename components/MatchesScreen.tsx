
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';

interface MatchesScreenProps {
  matches: UserProfile[];
  onChat: (profile: UserProfile) => void;
}

type SortByType = 'default' | 'active';

const MatchesScreen: React.FC<MatchesScreenProps> = ({ matches, onChat }) => {
  const [sortBy, setSortBy] = useState<SortByType>('default');

  const sortedMatches = useMemo(() => {
    const sorted = [...matches];
    if (sortBy === 'active') {
      return sorted.sort((a, b) => b.lastActive - a.lastActive);
    }
    // 'default' is newest first, which is the natural order of the matches array
    return sorted;
  }, [matches, sortBy]);

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <header className="p-4 sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10 space-y-4">
        <h1 className="text-2xl font-bold text-white text-center">Your Matches</h1>
        <div className="flex justify-center gap-2 bg-brand-surface p-1 rounded-full">
            <button 
                onClick={() => setSortBy('default')}
                className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${sortBy === 'default' ? 'bg-brand-primary text-white' : 'text-brand-text-dark'}`}
            >
                Newest
            </button>
            <button 
                onClick={() => setSortBy('active')}
                className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors ${sortBy === 'active' ? 'bg-brand-primary text-white' : 'text-brand-text-dark'}`}
            >
                Recently Active
            </button>
        </div>
      </header>
      
      {matches.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-text-light">No matches yet...</h2>
            <p className="text-brand-text-dark mt-2">Keep swiping to find your connection!</p>
          </div>
        </div>
      ) : (
        <main className="flex-grow p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {sortedMatches.map(match => (
              <div key={match.id} onClick={() => onChat(match)} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group shadow-lg transition-all duration-300 hover:ring-2 ring-inset ring-transparent hover:ring-brand-primary">
                <img src={match.imageUrl} alt={match.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-2 text-white">
                  <p className="font-bold text-sm">{match.name}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default MatchesScreen;
