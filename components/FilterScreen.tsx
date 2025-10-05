

import React, { useState } from 'react';
import { FilterSettings } from '../types.ts';
import { BackIcon } from './Icons.tsx';
import { LOOKING_FOR_OPTIONS, KINK_OPTIONS, ROLE_OPTIONS, RELATIONSHIP_TYPE_OPTIONS } from '../constants.ts';

interface FilterScreenProps {
    currentSettings: FilterSettings;
    onSave: (settings: FilterSettings) => void;
    onBack: () => void;
}

const DealbreakerToggle: React.FC<{ isDealbreaker: boolean, onToggle: () => void }> = ({ isDealbreaker, onToggle }) => (
    <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${isDealbreaker ? 'text-brand-primary' : 'text-brand-text-dark'}`}>Dealbreaker</span>
        <div onClick={onToggle} className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isDealbreaker ? 'bg-brand-primary' : 'bg-brand-surface'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDealbreaker ? 'translate-x-6' : ''}`}></div>
        </div>
    </div>
);

const FilterScreen: React.FC<FilterScreenProps> = ({ currentSettings, onSave, onBack }) => {
    const [settings, setSettings] = useState<FilterSettings>(currentSettings);

    const handleDealbreakerToggle = (filter: keyof FilterSettings['dealbreakers']) => {
        setSettings(prev => ({
            ...prev,
            dealbreakers: {
                ...prev.dealbreakers,
                [filter]: !prev.dealbreakers[filter]
            }
        }));
    };
    
    const handleTagToggle = (type: 'relationshipTypes' | 'lookingFor' | 'kinks' | 'roles', value: string) => {
        setSettings(prev => {
            const currentTags = prev[type];
            const newTags = currentTags.includes(value)
                ? currentTags.filter(tag => tag !== value)
                : [...currentTags, value];
            return { ...prev, [type]: newTags };
        });
    };
    
    const handleReset = () => {
        const defaultSettings: FilterSettings = {
            ageRange: { min: 18, max: 99 },
            distance: 250,
            heightRange: { min: 120, max: 250 },
            relationshipTypes: [],
            lookingFor: [],
            kinks: [],
            roles: [],
            verifiedOnly: false,
            dealbreakers: { distance: false, ageRange: false, heightRange: false, relationshipTypes: false },
        };
        setSettings(defaultSettings);
    };

    const heightDisplay = (cm: number) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}'${inches}"`;
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-brand-bg text-brand-text-light p-4">
            <header className="flex items-center justify-between mb-6 relative">
                <button onClick={onBack} className="p-2 absolute left-0 -ml-2"><BackIcon className="h-6 w-6" /></button>
                <h1 className="text-2xl font-bold text-center w-full">Filter Profiles</h1>
                <button onClick={handleReset} className="absolute right-0 text-sm font-semibold text-brand-text-dark hover:text-white">Reset</button>
            </header>
            
            <div className="overflow-y-auto space-y-6 flex-grow pr-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                <div className="bg-brand-surface p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-brand-primary">Distance</h2>
                        <span className="font-semibold">{settings.distance >= 250 ? 'Global' : `${settings.distance} km`}</span>
                    </div>
                    <input type="range" min="1" max="250" value={settings.distance} onChange={(e) => setSettings(prev => ({...prev, distance: parseInt(e.target.value)}))} className="w-full h-2 bg-brand-surface-light rounded-lg appearance-none cursor-pointer range-lg accent-brand-primary" />
                    <div className="flex justify-end mt-2">
                        <DealbreakerToggle isDealbreaker={settings.dealbreakers.distance} onToggle={() => handleDealbreakerToggle('distance')} />
                    </div>
                </div>

                <div className="bg-brand-surface p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-brand-primary">Age Range</h2>
                        <span className="font-semibold">{settings.ageRange.min} - {settings.ageRange.max}</span>
                    </div>
                    {/* A proper range slider would be better, but for simplicity: */}
                    <div className="flex items-center justify-between gap-4">
                        <input type="number" value={settings.ageRange.min} onChange={(e) => setSettings(s => ({...s, ageRange: {...s.ageRange, min: parseInt(e.target.value)}}))} className="w-full bg-brand-surface-light text-center p-2 rounded-md" min="18" max="99"/>
                        <span className="text-brand-text-dark">-</span>
                        <input type="number" value={settings.ageRange.max} onChange={(e) => setSettings(s => ({...s, ageRange: {...s.ageRange, max: parseInt(e.target.value)}}))} className="w-full bg-brand-surface-light text-center p-2 rounded-md" min="18" max="99"/>
                    </div>
                     <div className="flex justify-end mt-2">
                        <DealbreakerToggle isDealbreaker={settings.dealbreakers.ageRange} onToggle={() => handleDealbreakerToggle('ageRange')} />
                    </div>
                </div>

                <div className="bg-brand-surface p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-brand-primary">Height Range</h2>
                         <span className="font-semibold">{heightDisplay(settings.heightRange.min)} - {heightDisplay(settings.heightRange.max)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <input type="number" value={settings.heightRange.min} onChange={(e) => setSettings(s => ({...s, heightRange: {...s.heightRange, min: parseInt(e.target.value)}}))} className="w-full bg-brand-surface-light text-center p-2 rounded-md" min="120" max="250"/>
                        <span className="text-brand-text-dark">-</span>
                        <input type="number" value={settings.heightRange.max} onChange={(e) => setSettings(s => ({...s, heightRange: {...s.heightRange, max: parseInt(e.target.value)}}))} className="w-full bg-brand-surface-light text-center p-2 rounded-md" min="120" max="250"/>
                    </div>
                     <div className="flex justify-end mt-2">
                        <DealbreakerToggle isDealbreaker={settings.dealbreakers.heightRange} onToggle={() => handleDealbreakerToggle('heightRange')} />
                    </div>
                </div>
                 
                <div className="bg-brand-surface p-4 rounded-lg">
                     <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-brand-primary">Relationship Type</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {RELATIONSHIP_TYPE_OPTIONS.map(tag => (
                            <button key={tag} onClick={() => handleTagToggle('relationshipTypes', tag)} className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-semibold ${settings.relationshipTypes.includes(tag) ? 'bg-brand-gradient text-white shadow-md' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                     <div className="flex justify-end mt-2">
                        <DealbreakerToggle isDealbreaker={settings.dealbreakers.relationshipTypes} onToggle={() => handleDealbreakerToggle('relationshipTypes')} />
                    </div>
                </div>
                
                <div className="flex justify-between items-center bg-brand-surface p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-brand-primary">Verified Only</h2>
                    <div onClick={() => setSettings(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))} className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.verifiedOnly ? 'bg-brand-primary' : 'bg-brand-surface'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.verifiedOnly ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4">
                <button onClick={() => onSave(settings)} className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg">
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default FilterScreen;