
import React, { useState } from 'react';
import { FilterSettings } from '../types';
import { BackIcon } from './Icons';
import { LOOKING_FOR_OPTIONS, KINK_OPTIONS, ROLE_OPTIONS } from '../constants';

interface FilterScreenProps {
    currentSettings: FilterSettings;
    onSave: (settings: FilterSettings) => void;
    onBack: () => void;
}

const FilterScreen: React.FC<FilterScreenProps> = ({ currentSettings, onSave, onBack }) => {
    const [settings, setSettings] = useState<FilterSettings>(currentSettings);

    const handleAgeChange = (type: 'min' | 'max', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;
        
        const newAgeRange = { ...settings.ageRange, [type]: numValue };
        if (newAgeRange.min > newAgeRange.max) {
            if (type === 'min') newAgeRange.max = newAgeRange.min;
            else newAgeRange.min = newAgeRange.max;
        }
        setSettings(prev => ({ ...prev, ageRange: newAgeRange }));
    };

    const handleTagToggle = (type: 'lookingFor' | 'kinks' | 'roles', value: string) => {
        setSettings(prev => {
            const currentTags = prev[type];
            const newTags = currentTags.includes(value)
                ? currentTags.filter(tag => tag !== value)
                : [...currentTags, value];
            return { ...prev, [type]: newTags };
        });
    };
    
    const handleReset = () => {
        const defaultSettings = {
            ageRange: { min: 18, max: 99 },
            lookingFor: [],
            kinks: [],
            roles: [],
            verifiedOnly: false,
        };
        setSettings(defaultSettings);
        onSave(defaultSettings);
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-brand-bg text-brand-text-light p-4">
            <header className="flex items-center justify-between mb-6 relative">
                <button onClick={onBack} className="p-2 absolute left-0 -ml-2">
                    <BackIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-center w-full">Filter Profiles</h1>
                <button onClick={handleReset} className="absolute right-0 text-sm font-semibold text-brand-text-dark hover:text-white">
                    Reset
                </button>
            </header>
            
            <div className="overflow-y-auto space-y-6 flex-grow pr-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                 <div>
                    <h2 className="text-lg font-semibold text-brand-primary mb-3">Age Range</h2>
                    <div className="flex items-center justify-between gap-4">
                        <input type="number" value={settings.ageRange.min} onChange={(e) => handleAgeChange('min', e.target.value)} className="w-full bg-brand-surface-light text-center p-2 rounded-md" min="18" max="99"/>
                         <span className="text-brand-text-dark">-</span>
                         <input type="number" value={settings.ageRange.max} onChange={(e) => handleAgeChange('max', e.target.value)} className="w-full bg-brand-surface-light text-center p-2 rounded-md" min="18" max="99"/>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-brand-surface p-3 rounded-lg">
                    <h2 className="text-lg font-semibold text-brand-primary">Verified Only</h2>
                    <div onClick={() => setSettings(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))} className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${settings.verifiedOnly ? 'bg-brand-primary' : 'bg-brand-surface-light'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.verifiedOnly ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>
               
                <div>
                    <h2 className="text-lg font-semibold text-brand-primary mb-3">Looking For</h2>
                    <div className="flex flex-wrap gap-2">
                        {LOOKING_FOR_OPTIONS.map(tag => (
                            <button key={tag} onClick={() => handleTagToggle('lookingFor', tag)} className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-semibold ${settings.lookingFor.includes(tag) ? 'bg-brand-gradient text-white shadow-md' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                
                 <div>
                    <h2 className="text-lg font-semibold text-brand-primary mb-3">Roles</h2>
                    <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map(role => (
                            <button key={role} onClick={() => handleTagToggle('roles', role)} className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-semibold ${settings.roles.includes(role) ? 'bg-brand-gradient text-white shadow-md' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
                
                 <div>
                    <h2 className="text-lg font-semibold text-brand-primary mb-3">Kinks & Interests</h2>
                    <div className="flex flex-wrap gap-2">
                        {KINK_OPTIONS.slice(0, 10).map(kink => (
                            <button key={kink} onClick={() => handleTagToggle('kinks', kink)} className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-semibold ${settings.kinks.includes(kink) ? 'bg-brand-gradient text-white shadow-md' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
                                {kink}
                            </button>
                        ))}
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
