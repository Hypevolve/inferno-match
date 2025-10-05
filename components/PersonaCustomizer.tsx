
import React, { useState, useRef } from 'react';
import { Kink, KinkLevel, ProfilePrompt, AudioPrompt } from '../types';
import { KINK_OPTIONS, ROLE_OPTIONS, PROFILE_PROMPTS, KINK_EXPERIENCE_LEVELS } from '../constants';
import { MicIcon, PlayIcon, PauseIcon, XIcon } from './Icons';

interface PersonaCustomizerProps {
  kinks: Kink[];
  setKinks: React.Dispatch<React.SetStateAction<Kink[]>>;
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  textPrompts: ProfilePrompt[];
  setTextPrompts: React.Dispatch<React.SetStateAction<ProfilePrompt[]>>;
  audioPrompts: AudioPrompt[];
  setAudioPrompts: React.Dispatch<React.SetStateAction<AudioPrompt[]>>;
}

const PersonaCustomizer: React.FC<PersonaCustomizerProps> = ({ kinks, setKinks, roles, setRoles, textPrompts, setTextPrompts, audioPrompts, setAudioPrompts }) => {
  const [showKinkModal, setShowKinkModal] = useState(false);

  const handleKinkSelect = (kinkName: string) => {
    if (kinks.some(k => k.name === kinkName)) {
      setKinks(prev => prev.filter(k => k.name !== kinkName));
    } else if (kinks.length < 10) { // Limit number of kinks
      setKinks(prev => [...prev, { name: kinkName, level: 'Curious' }]);
    }
  };

  const handleKinkLevelChange = (kinkName: string, level: KinkLevel) => {
    setKinks(prev => prev.map(k => k.name === kinkName ? { ...k, level } : k));
  };

  const handleRoleToggle = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleTextPromptChange = (index: number, value: string, field: 'question' | 'answer') => {
      const newPrompts = [...textPrompts];
      newPrompts[index] = {...newPrompts[index], [field]: value};
      setTextPrompts(newPrompts);
  };
  
  const addTextPrompt = () => {
      if (textPrompts.length < 3) {
          const availableQuestions = PROFILE_PROMPTS.filter(p => !textPrompts.some(tp => tp.question === p));
          if(availableQuestions.length > 0) {
            setTextPrompts([...textPrompts, { question: availableQuestions[0], answer: '' }]);
          }
      }
  };

  const removeTextPrompt = (index: number) => {
      setTextPrompts(textPrompts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-brand-primary mb-2">My Roles</h2>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map(role => (
            <button
              type="button" key={role} onClick={() => handleRoleToggle(role)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 font-semibold ${roles.includes(role) ? 'bg-brand-gradient text-white shadow-md' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-brand-primary mb-2">My Kinks & Interests</h2>
        <div className="p-3 bg-brand-surface-light rounded-lg space-y-3">
            {kinks.map(kink => (
                <div key={kink.name} className="flex items-center justify-between bg-brand-surface p-2 rounded-md">
                    <span className="text-white font-semibold">{kink.name}</span>
                    <div className="flex items-center gap-1.5">
                        {KINK_EXPERIENCE_LEVELS.map(level => (
                            <button type="button" key={level} onClick={() => handleKinkLevelChange(kink.name, level)} className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${kink.level === level ? 'bg-brand-primary text-white' : 'bg-brand-surface-light text-brand-text-dark'}`}>
                                {level.charAt(0)}
                            </button>
                        ))}
                         <button type="button" onClick={() => handleKinkSelect(kink.name)} className="text-brand-text-dark hover:text-white ml-2">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
            {kinks.length < 10 && (
                <button type="button" onClick={() => setShowKinkModal(true)} className="w-full text-center py-2 bg-brand-surface text-brand-text-dark font-semibold rounded-md hover:bg-brand-primary hover:text-white transition-all">
                    + Add Kink
                </button>
            )}
        </div>
      </div>
      
      {showKinkModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-brand-surface rounded-lg p-4 max-w-md w-full max-h-[80vh] flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-4">Select Your Kinks</h3>
                  <div className="flex-grow overflow-y-auto space-y-1 pr-2">
                      {KINK_OPTIONS.map(kinkName => (
                          <button type="button" key={kinkName} onClick={() => handleKinkSelect(kinkName)} className={`w-full text-left p-3 rounded-md transition-all font-semibold ${kinks.some(k => k.name === kinkName) ? 'bg-brand-primary text-white' : 'bg-brand-surface-light text-brand-text-dark hover:bg-brand-surface'}`}>
                              {kinkName}
                          </button>
                      ))}
                  </div>
                  <button type="button" onClick={() => setShowKinkModal(false)} className="mt-4 w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg">
                      Done
                  </button>
              </div>
          </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-brand-primary mb-2">My Answers (Text)</h2>
        <div className="space-y-4">
          {textPrompts.map((prompt, index) => (
            <div key={index} className="bg-brand-surface-light p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <select value={prompt.question} onChange={e => handleTextPromptChange(index, e.target.value, 'question')} className="block w-full bg-brand-surface border-transparent rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-2 text-white">
                        {PROFILE_PROMPTS.filter(p => !textPrompts.some((tp, i) => i !== index && tp.question === p)).map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    <button type="button" onClick={() => removeTextPrompt(index)} className="ml-2 text-brand-text-dark hover:text-white">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
                <textarea value={prompt.answer} onChange={e => handleTextPromptChange(index, e.target.value, 'answer')} rows={3} placeholder="Your answer..." className="block w-full bg-brand-surface border-transparent rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-2 text-white placeholder-brand-text-dark" />
            </div>
          ))}
          {textPrompts.length < 3 && (
              <button type="button" onClick={addTextPrompt} className="w-full text-center py-2 bg-brand-surface text-brand-text-dark font-semibold rounded-md hover:bg-brand-primary hover:text-white transition-all">
                + Add Text Prompt
              </button>
          )}
        </div>
      </div>
      
       <div>
            <h2 className="text-lg font-semibold text-brand-primary mb-2">My Answers (Audio) - Coming Soon</h2>
            <div className="bg-brand-surface-light p-4 rounded-lg text-center">
                <p className="text-brand-text-dark">Record short audio answers to prompts to let your personality shine. This feature is currently under development.</p>
                <MicIcon className="w-10 h-10 mx-auto mt-3 text-brand-text-dark/50" />
            </div>
        </div>
    </div>
  );
};

export default PersonaCustomizer;
