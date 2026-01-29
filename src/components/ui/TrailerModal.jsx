import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TrailerModal = ({ videoKey, isOpen, onClose }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
                onClick={onClose}
            >
                {/* Close Button - Fixed position relative to viewport */}
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 z-[10000] p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10"
                >
                    <X className="w-8 h-8" />
                </button>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    {videoKey ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
                            title="Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2">
                            <span>Video not available</span>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default TrailerModal;
