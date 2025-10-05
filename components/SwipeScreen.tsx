
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import ProfileCard from './ProfileCard';
import { RewindIcon, XIcon, StarIcon, HeartIcon, BoostIcon, FlameIcon, FilterIcon } from './Icons';

interface SwipeScreenProps {
  userProfile: UserProfile;
  currentProfile: UserProfile;
  isLoading: boolean;
  onLike: (profile: UserProfile) => void;
  onPass: (profile: UserProfile) => void;
  onSuperLike: (profile: UserProfile) => void;
  onRewind: () => void;
  canRewind: boolean;
  onBoost: () => void;
  isBoostActive: boolean;
  boostEndTime: number | null;
  onOpenFilters: () => void;
  areFiltersActive: boolean;
  // Fix: Add missing prop to interface.
  onRequestVaultAccess: (profileId: string) => void;
}

const BoostTimer: React.FC<{ endTime: number | null }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState("");
    
    useEffect(() => {
        if (!endTime) return;

        const updateTimer = () => {
            const remaining = Math.max(0, endTime - Date.now());
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return <span className="font-mono text-brand-secondary font-bold">{timeLeft}</span>;
};

const ActionStamp: React.FC<{ type: 'like' | 'nope' | 'superlike' }> = ({ type }) => {
    const styles = {
        like: { text: 'LIKE', borderColor: 'border-green-400', textColor: 'text-green-400', rotation: '-rotate-20' },
        nope: { text: 'NOPE', borderColor: 'border-brand-primary', textColor: 'text-brand-primary', rotation: 'rotate-20' },
        superlike: { text: 'SUPER LIKE', borderColor: 'border-brand-accent', textColor: 'text-brand-accent', rotation: '-rotate-20' }
    };
    const style = styles[type];
    return (
        <div className={`absolute top-16 ${type === 'nope' ? 'right-8' : 'left-8'} transform ${style.rotation} z-10`}>
            <div className={`px-6 py-2 text-4xl font-extrabold border-4 ${style.borderColor} ${style.textColor} rounded-2xl`}>
                {style.text}
            </div>
        </div>
    );
};

const ProfileCardSkeleton: React.FC = () => (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-brand-surface animate-pulse">
        <div className="bg-brand-surface-light w-full h-full"></div>
        <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="h-8 bg-brand-surface-light rounded-md w-3/4 mb-3"></div>
            <div className="h-4 bg-brand-surface-light rounded-md w-full mb-4"></div>
            <div className="h-4 bg-brand-surface-light rounded-md w-1/2 mb-4"></div>
            <div className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-brand-surface-light rounded-full"></div>
                <div className="h-6 w-24 bg-brand-surface-light rounded-full"></div>
            </div>
        </div>
    </div>
);

const SwipeScreen: React.FC<SwipeScreenProps> = ({ 
    userProfile, currentProfile, isLoading, onLike, onPass, onSuperLike, 
    onRewind, canRewind, onBoost, isBoostActive, boostEndTime,
    onOpenFilters, areFiltersActive, onRequestVaultAccess
}) => {
    
    const [action, setAction] = useState<'idle' | 'like' | 'pass' | 'superlike'>('idle');

    const handleAction = (profile: UserProfile, type: 'like' | 'pass' | 'superlike') => {
        if (action !== 'idle' || !profile) return;
        setAction(type);
        setTimeout(() => {
            if (type === 'like') onLike(profile);
            if (type === 'pass') onPass(profile);
            if (type === 'superlike') onSuperLike(profile);
            setAction('idle');
        }, 400);
    };

    return (
        <div className="flex-grow flex flex-col w-full h-full bg-brand-bg bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-brand-surface/80 to-brand-bg overflow-hidden">
             <header className="p-4 flex justify-between items-center text-white h-16 shrink-0">
                <div className="w-1/3"></div>
                <div className="w-1/3 flex justify-center">
                    {isBoostActive ? (
                        <div className="flex items-center gap-2 text-brand-secondary font-bold animate-pulse"><BoostIcon className="h-6 w-6" /><BoostTimer endTime={boostEndTime} /></div>
                    ) : (
                        <FlameIcon className="h-8 w-8 text-brand-text-dark" />
                    )}
                </div>
                <div className="w-1/3 flex justify-end">
                     <button onClick={onOpenFilters} className="relative p-2 text-brand-text-dark hover:text-white">
                        <FilterIcon className="h-7 w-7" />
                        {areFiltersActive && <span className="absolute top-1 right-1 w-3 h-3 bg-brand-primary rounded-full border-2 border-brand-bg"></span>}
                    </button>
                </div>
            </header>
             <div className="flex-grow flex items-center justify-center p-4 relative min-h-0">
                {isLoading ? (
                     <div className="w-full max-w-sm aspect-[3/5]"><ProfileCardSkeleton /></div>
                ) : !currentProfile ? (
                     <div className="w-full max-w-sm">
                        <div className="relative aspect-[3/5] rounded-2xl border-2 border-dashed border-brand-surface-light flex flex-col items-center justify-center p-4 text-center">
                            <h2 className="text-xl font-bold text-brand-text-dark">No one new around you</h2>
                            <p className="text-sm text-brand-text-dark mt-2">Try adjusting your filters or check back later!</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full max-w-sm aspect-[3/5]">
                        <div className={`transition-all duration-300 ease-in-out w-full h-full absolute
                            ${action === 'pass' ? '-translate-x-full rotate-[-15deg] opacity-0' : ''}
                            ${action === 'like' ? 'translate-x-full rotate-[15deg] opacity-0' : ''}
                            ${action === 'superlike' ? '-translate-y-full opacity-0 scale-75' : ''}`}>
                           {action === 'like' && <ActionStamp type="like" />}
                           {action === 'pass' && <ActionStamp type="nope" />}
                           {action === 'superlike' && <ActionStamp type="superlike" />}
                           <ProfileCard profile={currentProfile} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center gap-4 p-4 z-10 shrink-0">
                <button onClick={onRewind} disabled={!canRewind} className="p-4 bg-brand-surface rounded-full text-brand-accent shadow-lg transform transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    <RewindIcon className="h-7 w-7" />
                </button>
                <button onClick={() => handleAction(currentProfile, 'pass')} className="p-6 bg-brand-surface rounded-full text-brand-text-light shadow-lg transform transition-all hover:scale-110 active:scale-95 hover:bg-brand-surface-light">
                    <XIcon className="h-9 w-9" />
                </button>
                 <button onClick={() => handleAction(currentProfile, 'superlike')} className="p-5 bg-brand-surface rounded-full text-brand-accent shadow-lg transform transition-all hover:scale-110 active:scale-95 hover:bg-brand-surface-light">
                    <StarIcon className="h-8 w-8" />
                </button>
                <button onClick={() => handleAction(currentProfile, 'like')} className="p-6 bg-brand-surface rounded-full text-brand-primary shadow-lg transform transition-all hover:scale-110 active:scale-95 hover:bg-brand-surface-light">
                    <HeartIcon className="h-9 w-9" />
                </button>
                <button onClick={onBoost} disabled={isBoostActive} className="p-4 bg-brand-surface rounded-full text-brand-secondary shadow-lg transform transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    <BoostIcon className="h-7 w-7" />
                </button>
            </div>
        </div>
    );
};

export default SwipeScreen;
