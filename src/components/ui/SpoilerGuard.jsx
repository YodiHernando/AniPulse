import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SpoilerGuard = ({ children, blurAmount = 'blur-sm', clickable = true, className = '' }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    if (!children) return null;

    const toggle = (e) => {
        if (clickable) {
            e.preventDefault();
            e.stopPropagation();
            setIsRevealed(!isRevealed);
        }
    };

    return (
        <div
            onClick={clickable ? toggle : undefined}
            className={`relative group ${clickable ? 'cursor-pointer' : ''} ${className}`}
        >
            <div className={`transition-all duration-500 ease-in-out ${isRevealed ? 'filter-none opacity-100' : `${blurAmount} opacity-80 select-none grayscale`}`}>
                {children}
            </div>

            {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md">
                        <Eye className="w-3 h-3" /> Reveal Spoiler
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpoilerGuard;
