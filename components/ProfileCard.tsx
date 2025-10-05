
import React from 'react';
import { UserProfile, KinkLevel } from '../types';
import { VerifiedIcon, PlayIcon } from './Icons';

interface ProfileCardProps {
  profile: UserProfile;
}

const KinkLevelIndicator: React.FC<{ level: KinkLevel }> = ({ level }) => {
    const levelStyles = {
        'Curious': 'bg-green-500/80',
        'Intermediate': 'bg-yellow-500/80',
        'Experienced': 'bg-red-500/80',
    };
    return <span className={`w-2.5 h-2.5 rounded-full ${levelStyles[level]} border-2 border-black/20`} title={level}></span>;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const displayBio = profile.bio;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-brand-surface">
      {profile.videoUrl ? (
        <video 
            src={profile.videoUrl} 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
        />
      ) : (
        <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-6 text-white w-full max-h-[75%] overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold drop-shadow-lg">{profile.name}, {profile.age}</h2>
            {profile.isVerified && <VerifiedIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />}
        </div>
        <p className="text-gray-200 mt-2 text-sm drop-shadow-md">{displayBio}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {profile.lookingFor.map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-semibold bg-brand-primary/80 border border-brand-primary rounded-full backdrop-blur-sm">
              {tag}
            </span>
          ))}
          {profile.roles.map(role => (
             <span key={role} className="px-3 py-1 text-xs font-semibold bg-brand-secondary/80 border border-brand-secondary rounded-full backdrop-blur-sm">
              {role}
            </span>
          ))}
        </div>

        {profile.textPrompts.length > 0 && (
          <div className="mt-4 space-y-3">
            {profile.textPrompts.map((prompt, index) => (
              <div key={index} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <p className="text-xs font-semibold text-gray-300">{prompt.question}</p>
                <p className="text-sm font-medium italic mt-1">"{prompt.answer}"</p>
              </div>
            ))}
          </div>
        )}
        
         {profile.audioPrompts.length > 0 && (
          <div className="mt-4 space-y-3">
            {profile.audioPrompts.map((prompt, index) => (
              <div key={index} className="bg-white/10 p-3 rounded-lg backdrop-blur-sm flex items-center gap-3">
                <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-brand-primary/80 rounded-full text-white">
                    <PlayIcon className="h-5 w-5"/>
                </button>
                <div>
                    <p className="text-xs font-semibold text-gray-300">{prompt.question}</p>
                    <p className="text-sm font-medium italic mt-1">Audio Answer ({prompt.duration}s)</p>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className="flex flex-wrap gap-2 mt-4">
          {profile.kinks.slice(0, 10).map(kink => (
            <span key={kink.name} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
              <KinkLevelIndicator level={kink.level} />
              {kink.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
