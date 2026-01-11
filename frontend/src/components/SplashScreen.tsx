import React, { useState } from 'react';
import SplitText from './SplitText';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [textVisible, setTextVisible] = useState(true);

    const handleAnimationComplete = () => {
        // Wait a brief moment after text animation finishes before hiding splash
        setTimeout(() => {
            setTextVisible(false);
            setTimeout(onComplete, 500); // Allow for fade out transition
        }, 500);
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500 ${!textVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="text-center">
                <SplitText
                    text="EDUHUB"
                    className="text-6xl md:text-9xl font-bold text-white tracking-widest text-center"
                    delay={50}
                    duration={1.5} // Slower duration for dramatic effect
                    ease="circ.out"
                    onLetterAnimationComplete={handleAnimationComplete}
                />
                <p className="mt-4 text-blue-500 text-lg md:text-xl font-light tracking-[0.5em] animate-pulse">
                    LEARNING SIMPLIFIED
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
