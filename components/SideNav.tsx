
import React from 'react';
import { Screen } from '../types';
import { FlameIcon, MatchesIcon, ProfileIcon, DiamondIcon, SparklesIcon } from './Icons';

interface SideNavProps {
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
    <button onClick={onClick} className="relative flex flex-col items-center justify-center w-full transition-colors duration-200 gap-2 p-4 group">
        {badgeCount > 0 && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold text-white bg-brand-primary rounded-full animate-pulse">
                {badgeCount}
            </span>
        )}
        <div className={`transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-text-dark group-hover:text-white'}`}>
            {icon}
        </div>
        <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-text-dark'}`}>
            {label}
        </span>
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-primary rounded-r-full transition-all"></div>}
    </button>
);

const SideNav: React.FC<SideNavProps> = ({ activeScreen, onNavigate, newLikesCount }) => {
    return (
        <nav className="hidden md:flex flex-col justify-center items-center bg-brand-surface w-24 border-r border-brand-surface-light shrink-0 space-y-4">
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
                isActive={activeScreen === Screen.MATCHES || activeScreen === Screen.CHAT}
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

export default SideNav;
