

import React, { useState } from 'react';
import { BackIcon } from './Icons.tsx';
import { getSafetyArticleContent } from '../services/geminiService.ts';

interface SafetyCenterScreenProps {
    onBack: () => void;
}

const safetyTopics = [
    "Understanding Consent",
    "Negotiating a Scene",
    "Aftercare 101",
    "Community Guidelines",
    "Online Safety Tips",
];

const Article: React.FC<{ title: string }> = ({ title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchContent = async () => {
        if (content) return; // Already fetched
        setIsLoading(true);
        setError('');
        try {
            const articleContent = await getSafetyArticleContent(title);
            setContent(articleContent);
        } catch (e) {
            console.error("Failed to load article:", e);
            setError('Failed to load content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen && !content) {
            fetchContent();
        }
    };

    return (
        <div className="bg-brand-surface rounded-lg">
            <button onClick={handleToggle} className="w-full flex justify-between items-center p-4 text-left">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <svg className={`w-6 h-6 text-brand-text-dark transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-brand-surface-light">
                    {isLoading && <p className="text-brand-text-dark">Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {content && (
                        <div className="text-brand-text-dark space-y-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}></div>
                    )}
                </div>
            )}
        </div>
    );
};


const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full bg-brand-bg text-white p-4">
            <header className="flex items-center justify-between mb-6 relative">
                <button onClick={onBack} className="p-2 absolute left-0 -ml-2">
                    <BackIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-center w-full">Safety Center</h1>
            </header>

            <p className="text-brand-text-dark text-center mb-6">
                Your safety is our priority. Explore these resources to ensure a safe and consensual experience on Inferno.
            </p>

            <div className="flex-grow overflow-y-auto space-y-4">
                {safetyTopics.map(topic => (
                    <Article key={topic} title={topic} />
                ))}
            </div>
        </div>
    );
};

export default SafetyCenterScreen;