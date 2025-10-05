
import React from 'react';
import { UserProfile } from '../types';
import { DiamondIcon } from './Icons';

interface LikesYouScreenProps {
  likers: UserProfile[];
  onInstantMatch: (profile: UserProfile) => void;
  onGoPremium: () => void;
  // Fix: Add missing props to interface.
  vaultRequests: UserProfile[];
  onGrantVaultAccess: (requesterId: string) => void;
}

const LikesYouScreen: React.FC<LikesYouScreenProps> = ({ likers, vaultRequests, onInstantMatch, onGrantVaultAccess, onGoPremium }) => {
  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <header className="p-4 sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10 text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <DiamondIcon className="h-6 w-6 text-brand-accent" />
            <span>Who Likes You</span>
        </h1>
        <p className="text-sm text-brand-text-dark">Upgrade to see everyone and match instantly!</p>
      </header>
      
      {likers.length === 0 && vaultRequests.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <h2 className="text-xl font-semibold text-brand-text-light">No new activity...</h2>
            <p className="text-brand-text-dark mt-2">Your admirers and vault requests will appear here.</p>
          </div>
        </div>
      ) : (
        <main className="flex-grow p-4 overflow-y-auto">
          {vaultRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Vault Requests</h2>
              <div className="space-y-3">
                {vaultRequests.map(requester => (
                  <div key={requester.id} className="bg-brand-surface p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={requester.imageUrl} alt={requester.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{requester.name}</p>
                        <p className="text-xs text-brand-text-dark">Wants to see your private vault.</p>
                      </div>
                    </div>
                    <button onClick={() => onGrantVaultAccess(requester.id)} className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg text-sm">Grant Access</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {likers.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Who Likes You</h2>
              <div className="grid grid-cols-2 gap-4">
                {likers.map((liker, index) => (
                  <div 
                    key={liker.id} 
                    onClick={() => onInstantMatch(liker)} 
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group shadow-lg transition-all duration-300 hover:ring-2 ring-inset ring-transparent hover:ring-brand-accent"
                  >
                    <img 
                        src={liker.imageUrl} 
                        alt="A potential match" 
                        className="w-full h-full object-cover blur-md group-hover:blur-none transition-all duration-300"
                    />
                    { index > 0 && <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div> }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-2 text-white">
                      <p className="font-bold text-sm">{liker.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                    <button onClick={onGoPremium} className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">
                        See All {likers.length} Likes
                    </button>
                </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default LikesYouScreen;
