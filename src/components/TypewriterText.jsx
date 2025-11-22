import { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 30, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);
        let index = 0;

        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <span>
            {displayedText}
            {!isComplete && (
                <span className="animate-pulse inline-block w-1 h-4 ml-1 bg-primary align-middle" />
            )}
        </span>
    );
};

export default TypewriterText;
