
import React from 'react';
import { UserProfile, KinkLevel } from '../types';
import { VerifiedIcon, DiamondIcon } from './Icons';

interface UserProfileScreenProps {
    userProfile: UserProfile;
    onEditProfile: () => void;
    onVerifyProfile: () => void;
    isIncognito: boolean;
    onToggleIncognito: () => void;
    onGoPremium: () => void;
}

const KinkLevelIndicator: React.FC<{ level: KinkLevel }> = ({ level }) => {
    const levelStyles = { 'Curious': 'bg-green-500', 'Intermediate': 'bg-yellow-500', 'Experienced': 'bg-red-500' };
    return <span className={`w-2 h-2 rounded-full ${levelStyles[level]}`} title={level}></span>;
};


const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userProfile, onEditProfile, onVerifyProfile, isIncognito, onToggleIncognito, onGoPremium }) => {
    return (
        <div className="flex flex-col h-full bg-brand-bg overflow-y-auto p-6 items-center no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <div className="relative w-40 h-40 mt-8 mb-4">
                {userProfile.videoUrl ? (
                    <video src={userProfile.videoUrl} autoPlay muted loop playsInline className="w-full h-full rounded-full object-cover border-4 border-brand-primary shadow-lg" />
                ) : (
                    <img src={userProfile.imageUrl} alt={userProfile.name} className="w-full h-full rounded-full object-cover border-4 border-brand-surface-light shadow-lg"/>
                )}
            </div>

            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">{userProfile.name}, {userProfile.age}</h1>
                {userProfile.isVerified && <VerifiedIcon className="h-7 w-7 text-blue-400" title="Verified Profile" />}
            </div>

            <div className="w-full my-6">
                <button onClick={onEditProfile} className="w-full bg-brand-surface-light text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 hover:bg-brand-surface">
                  Edit Profile
                </button>
            </div>

            <div className="w-full max-w-md mx-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {!userProfile.isVerified && (
                        <button onClick={onVerifyProfile} className="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-700 h-full">
                            Get Verified
                        </button>
                    )}
                     <button onClick={onGoPremium} className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                        <DiamondIcon className="h-5 w-5" />
                        Go Premium
                    </button>
                </div>
                
                <div className="w-full p-4 bg-brand-surface rounded-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-brand-primary">Incognito Mode</h2>
                        <div onClick={onToggleIncognito} className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isIncognito ? 'bg-brand-primary' : 'bg-brand-surface-light'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isIncognito ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>
                    <p className="text-xs text-brand-text-dark mt-2">
                        {isIncognito ? "You are hidden. Only people you like will see your profile." : "Your profile is visible to others. Turn on to browse privately."}
                    </p>
                </div>

                <div className="w-full p-4 bg-brand-surface rounded-lg">
                    <h2 className="font-bold text-brand-primary mb-2">My Bio</h2>
                    <p className="text-brand-text-dark text-sm">{userProfile.bio}</p>
                </div>
                
                <div className="w-full p-4 bg-brand-surface rounded-lg grid grid-cols-2 gap-4">
                    <div>
                        <h2 className="font-bold text-brand-primary mb-2">I'm Looking For...</h2>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.lookingFor.map(tag => (<span key={tag} className="px-3 py-1 text-xs bg-brand-primary/80 text-white rounded-full">{tag}</span>))}
                        </div>
                    </div>
                     <div>
                        <h2 className="font-bold text-brand-primary mb-2">My Roles</h2>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.roles.map(role => (<span key={role} className="px-3 py-1 text-xs bg-brand-secondary/80 text-white rounded-full">{role}</span>))}
                        </div>
                    </div>
                </div>

                {userProfile.textPrompts.length > 0 && (
                    <div className="w-full p-4 bg-brand-surface rounded-lg">
                        <h2 className="font-bold text-brand-primary mb-2">My Answers</h2>
                        <div className="space-y-3">
                            {userProfile.textPrompts.map((prompt, index) => (
                                <div key={index}>
                                    <p className="text-xs font-semibold text-brand-text-dark">{prompt.question}</p>
                                    <p className="text-sm italic mt-1 text-brand-text-light">"{prompt.answer}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="w-full p-4 bg-brand-surface rounded-lg">
                    <h2 className="font-bold text-brand-primary mb-2">My Kinks & Interests</h2>
                    <div className="flex flex-wrap gap-2">
                        {userProfile.kinks.map(kink => (
                            <span key={kink.name} className="flex items-center gap-2 px-3 py-1 text-xs bg-brand-surface-light text-brand-text-light rounded-full">
                                <KinkLevelIndicator level={kink.level} />
                                {kink.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileScreen;
