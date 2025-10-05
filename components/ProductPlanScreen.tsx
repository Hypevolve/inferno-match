

import React from 'react';
import { BackIcon, DiamondIcon, CheckIcon } from './Icons.tsx';
import { Screen } from '../types.ts';

interface ProductPlanScreenProps {
    onBack: () => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center gap-3">
        <CheckIcon className="h-5 w-5 text-brand-primary flex-shrink-0" />
        <span className="text-brand-text-light">{children}</span>
    </li>
);

const ProductPlanScreen: React.FC<ProductPlanScreenProps> = ({ onBack }) => {
    return (
        <div className="flex-grow flex flex-col h-full bg-brand-bg text-brand-text-light p-4 overflow-y-auto">
            <header className="flex items-center justify-between mb-6 relative">
                <button onClick={onBack} className="p-2 absolute left-0 -ml-2">
                    <BackIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-center w-full flex items-center justify-center gap-2">
                    <DiamondIcon className="h-6 w-6 text-brand-accent"/>
                    Inferno Premium
                </h1>
            </header>

            <div className="text-center mb-8">
                <p className="text-brand-text-dark">Unlock your full potential and get the most out of Inferno.</p>
            </div>

            <div className="space-y-6">
                {/* Gold Plan */}
                <div className="bg-brand-surface border-2 border-brand-accent rounded-xl p-6 shadow-2xl">
                    <h2 className="text-2xl font-bold text-brand-accent mb-2">Inferno GOLD</h2>
                    <p className="text-4xl font-extrabold text-white mb-4">$14.99<span className="text-lg font-medium text-brand-text-dark">/month</span></p>
                    <ul className="space-y-3 mb-6 text-left">
                        <FeatureItem>See everyone who Likes You</FeatureItem>
                        <FeatureItem>Unlimited Likes</FeatureItem>
                        <FeatureItem>Unlimited Rewinds</FeatureItem>
                        <FeatureItem>5 Super Likes per week</FeatureItem>
                        <FeatureItem>1 Boost per month</FeatureItem>
                    </ul>
                    <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105">
                        Choose Gold
                    </button>
                </div>
                
                {/* Platinum Plan */}
                <div className="bg-brand-surface border border-brand-surface-light rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-brand-primary mb-2">Inferno PLATINUM</h2>
                    <p className="text-4xl font-extrabold text-white mb-4">$29.99<span className="text-lg font-medium text-brand-text-dark">/month</span></p>
                    <ul className="space-y-3 mb-6 text-left">
                        <li className="font-bold text-white">Everything in Gold, plus:</li>
                        <FeatureItem>Incognito Mode</FeatureItem>
                        <FeatureItem>Message before matching</FeatureItem>
                        <FeatureItem>Priority Likes (you're seen first)</FeatureItem>
                        <FeatureItem>See who has read your messages</FeatureItem>
                    </ul>
                     <button className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105">
                        Choose Platinum
                    </button>
                </div>
            </div>
             <div className="text-center mt-6">
                <p className="text-xs text-brand-text-dark">Recurring billing. Cancel anytime.</p>
            </div>
        </div>
    );
};

export default ProductPlanScreen;