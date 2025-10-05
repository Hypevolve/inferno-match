
import React, { useState, useEffect, useRef } from 'react';
import { BackIcon, CheckIcon } from './Icons';

interface VerificationScreenProps {
    onComplete: () => void;
    onBack: () => void;
}

type VerificationStep = 'start' | 'turnLeft' | 'turnRight' | 'smile' | 'done';

const steps: { [key in VerificationStep]: { instruction: string; duration: number } } = {
    start: { instruction: 'Get ready! Center your face in the frame.', duration: 3000 },
    turnLeft: { instruction: 'Slowly turn your head to the left.', duration: 3000 },
    turnRight: { instruction: 'Now, slowly turn your head to the right.', duration: 3000 },
    smile: { instruction: 'Great! Now give us a big smile.', duration: 2000 },
    done: { instruction: 'All done! Verifying...', duration: 2500 },
};

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState<VerificationStep>('start');
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Effect to start and stop camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                alert("Camera access is required for verification. Please enable it in your browser settings.");
                onBack();
            }
        };

        startCamera();

        // Cleanup function to stop the camera stream
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onBack]);

    useEffect(() => {
        const stepOrder: VerificationStep[] = ['start', 'turnLeft', 'turnRight', 'smile', 'done'];
        const currentStepIndex = stepOrder.indexOf(step);
        
        if (currentStepIndex === -1 || step === 'done') {
            if (step === 'done') {
                const timer = setTimeout(onComplete, steps.done.duration);
                return () => clearTimeout(timer);
            }
            return;
        }

        const currentStepInfo = steps[step];
        setProgress(0);
        const progressInterval = setInterval(() => {
            setProgress(p => p + (100 / (currentStepInfo.duration / 100)));
        }, 100);

        const stepTimeout = setTimeout(() => {
            clearInterval(progressInterval);
            setProgress(100);
            const nextStep = stepOrder[currentStepIndex + 1];
            if (nextStep) {
                setStep(nextStep);
            }
        }, currentStepInfo.duration);

        return () => {
            clearTimeout(stepTimeout);
            clearInterval(progressInterval);
        };
    }, [step, onComplete]);

    return (
        <div className="flex flex-col h-full bg-brand-bg text-white p-4">
            <header className="flex items-center justify-between mb-6 relative">
                <button onClick={onBack} className="p-2 absolute left-0 -ml-2">
                    <BackIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-center w-full">Profile Verification</h1>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="relative w-64 h-80 border-4 border-brand-primary rounded-2xl bg-black overflow-hidden mb-6">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover scale-x-[-1]" // Mirrored for user-facing camera
                    />
                    {/* Ellipse overlay */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 320" preserveAspectRatio="none">
                        <ellipse cx="128" cy="160" rx="100" ry="140" fill="none" stroke="white" strokeWidth="4" strokeDasharray="10 5" />
                    </svg>
                </div>
                
                <div className="w-full max-w-sm">
                    {step === 'done' ? (
                         <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-green-400">
                             <CheckIcon className="h-8 w-8" />
                             <p>Processing...</p>
                         </div>
                    ) : (
                        <>
                            <p className="text-xl font-semibold mb-4">{steps[step].instruction}</p>
                            <div className="w-full bg-brand-surface-light rounded-full h-2.5">
                                <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationScreen;
