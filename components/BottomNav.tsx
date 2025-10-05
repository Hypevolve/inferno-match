
import React from 'react';
import { Screen } from '../types';
import { FlameIcon, MatchesIcon, ProfileIcon, DiamondIcon, SparklesIcon } from './Icons';

interface BottomNavProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
    newLikesCount: number;
}

const NavItem: React.FC<{
    icon: React.ReactNode,
    label: string, 
    isActive: boolean, 
    onClick: () => void,
    badgeCount?: number
}> = ({ icon, label, isActive, onClick, badgeCount = 0 }) => (
    <button onClick={onClick} className="relative flex flex-col items-center justify-center w-1/5 transition-colors duration-200 gap-1 pt-2 pb-1 group">
        {badgeCount > 0 && (
            <span className="absolute top-1 right-1/2 translate-x-4 px-2 py-0.5 text-xs font-bold text-white bg-brand-primary rounded-full animate-pulse">
                {badgeCount}
            </span>
        )}
        <div className={`transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-text-dark group-hover:text-white'}`}>
            {icon}
        </div>
        <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-brand-text-light' : 'text-brand-text-dark'}`}>
            {label}
        </span>
        {isActive && <div className="h-1 w-8 bg-brand-primary rounded-full mt-1 transition-all"></div>}
    </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, newLikesCount }) => {
    return (
        <nav className="flex justify-around items-center bg-brand-surface border-t border-brand-surface-light">
           <NavItem 
                icon={<FlameIcon className="h-7 w-7" />}
                label="Discover"
                isActive={activeScreen === Screen.SWIPE}
                onClick={() => onNavigate(Screen.SWIPE)}
            />
            <NavItem 
                icon={<SparklesIcon className="h-7 w-7" />}
                label="Spotlight"
                isActive={activeScreen === Screen.SPOTLIGHT}
                onClick={() => onNavigate(Screen.SPOTLIGHT)}
            />
            <NavItem 
                icon={<DiamondIcon className="h-7 w-7" />}
                label="Likes"
                isActive={activeScreen === Screen.LIKES_YOU}
                onClick={() => onNavigate(Screen.LIKES_YOU)}
                badgeCount={newLikesCount}
            />
             <NavItem 
                icon={<MatchesIcon className="h-7 w-7" />}
                label="Matches"
                isActive={activeScreen === Screen.MATCHES}
                onClick={() => onNavigate(Screen.MATCHES)}
            />
             <NavItem 
                icon={<ProfileIcon className="h-7 w-7" />}
                label="Profile"
                isActive={activeScreen === Screen.PROFILE}
                onClick={() => onNavigate(Screen.PROFILE)}
            />
        </nav>
    )
};

export default BottomNav;
