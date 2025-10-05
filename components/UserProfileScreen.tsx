


import React, { useMemo, useRef, useState } from 'react';
import { UserProfile, KinkLevel } from '../types.ts';
import { VerifiedIcon, DiamondIcon, PhotoIcon, LockIcon, StarIcon, XIcon } from './Icons.tsx';
import { processImage, fileToDataUri } from '../helpers/imageProcessing.ts';

interface UserProfileScreenProps {
    userProfile: UserProfile;
    onEditProfile: () => void;
    onVerifyProfile: () => void;
    onOpenSafetyCenter: () => void;
    isIncognito: boolean;
    onToggleIncognito: () => void;
    onGoPremium: () => void;
    onLogout: () => void;
    onAddMedia: (album: 'public' | 'private', dataUri: string) => void;
    onRemoveMedia: (album: 'public' | 'private', url: string) => void;
}

const KinkLevelIndicator: React.FC<{ level: KinkLevel }> = ({ level }) => {
    const levelStyles = { 'Curious': 'bg-green-500', 'Intermediate': 'bg-yellow-500', 'Experienced': 'bg-red-500' };
    return <span className={`w-2 h-2 rounded-full ${levelStyles[level]}`} title={level}></span>;
};


const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userProfile, onEditProfile, onVerifyProfile, onOpenSafetyCenter, isIncognito, onToggleIncognito, onGoPremium, onLogout, onAddMedia, onRemoveMedia }) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [targetAlbum, setTargetAlbum] = useState<'public' | 'private' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const profileCompleteness = useMemo(() => {
        let score = 0;
        if (userProfile.bio) score += 20;
        if (userProfile.textPrompts.length > 0) score += 20;
        if (userProfile.kinks.length >= 3) score += 20;
        if (userProfile.roles.length > 0) score += 10;
        if (userProfile.isVerified) score += 30;
        return Math.min(100, score);
    }, [userProfile]);

    const handleAddClick = (album: 'public' | 'private') => {
        setTargetAlbum(album);
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && targetAlbum) {
            setIsUploading(true);
            try {
                const processed = await processImage(file);
                const dataUri = await fileToDataUri(processed);
                onAddMedia(targetAlbum, dataUri);
            } catch (error) {
                console.error("Error adding media:", error);
                alert("Could not upload image. Please try another one.");
            } finally {
                setIsUploading(false);
                setTargetAlbum(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-brand-bg overflow-y-auto p-4 items-center no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/*" disabled={isUploading} />
            <div className="relative w-32 h-32 mt-4 mb-4">
                 <svg className="absolute inset-[-6px]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#282531" strokeWidth="4" />
                    <circle 
                        cx="50" cy="50" r="48" fill="none" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={(2 * Math.PI * 48) * (1 - profileCompleteness / 100)}
                        transform="rotate(-90 50 50)"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#E4007C" />
                            <stop offset="100%" stopColor="#8A2BE2" />
                        </linearGradient>
                    </defs>
                </svg>
                {userProfile.videoUrl ? (
                    <video src={userProfile.videoUrl} autoPlay muted loop playsInline className="w-full h-full rounded-full object-cover shadow-lg" />
                ) : (
                    <img src={userProfile.imageUrl} alt={userProfile.name} className="w-full h-full rounded-full object-cover shadow-lg"/>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {profileCompleteness}%
                </div>
            </div>

            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">{userProfile.name}, {userProfile.age}</h1>
                {userProfile.isVerified && <VerifiedIcon className="h-7 w-7 text-blue-400" title="Verified Profile" />}
            </div>
            <p className="text-sm text-brand-text-dark mt-1">Profile Completeness</p>

            <div className="w-full max-w-md mx-auto space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={onEditProfile} className="w-full bg-brand-surface-light text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 hover:bg-brand-surface">
                      Edit Profile
                    </button>
                    {!userProfile.isVerified ? (
                        <button onClick={onVerifyProfile} className="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-700 h-full">
                            Get Verified
                        </button>
                    ) : (
                         <button onClick={onGoPremium} className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                            <DiamondIcon className="h-5 w-5" />
                            Premium
                        </button>
                    )}
                </div>

                <div className="w-full p-4 bg-brand-surface rounded-lg">
                    <h2 className="font-bold text-brand-primary mb-3 flex items-center gap-2"><PhotoIcon className="w-5 h-5"/>My Media</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="relative group">
                           <img src={userProfile.imageUrl} className="aspect-square object-cover rounded-md"/>
                           <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-full pointer-events-none">
                               <StarIcon className="w-4 h-4 text-brand-accent" />
                           </div>
                        </div>
                        {userProfile.publicAlbum.filter(p => p !== userProfile.imageUrl).map((url, i) => (
                            <div key={i} className="relative group">
                                <img src={url} className="aspect-square object-cover rounded-md"/>
                                <button onClick={() => onRemoveMedia('public', url)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={() => handleAddClick('public')} disabled={isUploading} className="aspect-square bg-brand-surface-light rounded-md flex items-center justify-center text-brand-text-dark text-2xl">
                            {isUploading && targetAlbum === 'public' ? <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div> : '+'}
                        </button>
                    </div>
                     <h2 className="font-bold text-brand-primary mt-4 mb-3 flex items-center gap-2"><LockIcon className="w-5 h-5"/>Private Vault</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {userProfile.privateVault.map((url, i) => (
                             <div key={i} className="relative group">
                                <img src={url} className="aspect-square object-cover rounded-md"/>
                                <button onClick={() => onRemoveMedia('private', url)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={() => handleAddClick('private')} disabled={isUploading} className="aspect-square bg-brand-surface-light rounded-md flex items-center justify-center text-brand-text-dark text-2xl">
                             {isUploading && targetAlbum === 'private' ? <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div> : '+'}
                        </button>
                    </div>
                </div>
                
                <div className="w-full p-4 bg-brand-surface rounded-lg">
                    <h2 className="font-bold text-brand-primary mb-2">Account</h2>
                    <div className="divide-y divide-brand-surface-light">
                        <div className="flex justify-between items-center py-2">
                            <h3 className="font-semibold text-white">Incognito Mode</h3>
                            <div onClick={onToggleIncognito} className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isIncognito ? 'bg-brand-primary' : 'bg-brand-surface-light'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isIncognito ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </div>
                         <button onClick={onOpenSafetyCenter} className="w-full text-left font-semibold text-white py-3">
                            Safety Center
                        </button>
                         <button onClick={onLogout} className="w-full text-left font-semibold text-brand-primary py-3">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="w-full p-4 bg-brand-surface rounded-lg">
                    <h2 className="font-bold text-brand-primary mb-2">My Bio</h2>
                    <p className="text-brand-text-dark text-sm">{userProfile.bio}</p>
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
            <div className="h-8"></div>
        </div>
    );
};

export default UserProfileScreen;