import React, { useState } from 'react';

interface AgeGateProps {
  onVerified: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerified }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg shadow-2xl p-8 max-w-sm w-full text-center border border-brand-surface-light">
        <h1 className="text-2xl font-bold mb-2 text-brand-primary">Warning</h1>
        <p className="text-brand-text-light mb-6">
          This application contains explicit adult content (NSFW) and is intended for individuals 18 years of age or older. By entering, you confirm you are of legal age in your jurisdiction and consent to viewing sexually explicit material.
        </p>
        <div className="flex items-center justify-center mb-6">
          <input
            id="age-confirm"
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="w-5 h-5 text-brand-primary bg-brand-surface-light border-brand-surface rounded focus:ring-brand-primary focus:ring-2"
          />
          <label htmlFor="age-confirm" className="ml-3 text-sm font-medium text-brand-text-light">
            I am 18 or older and agree to the terms.
          </label>
        </div>
        <button
          onClick={onVerified}
          disabled={!isChecked}
          className="w-full bg-brand-gradient text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default AgeGate;