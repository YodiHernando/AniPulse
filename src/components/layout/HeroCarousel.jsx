import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../services/tmdb';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Calendar, Info, ChevronRight, Play, ChevronLeft } from 'lucide-react';

const HeroCarousel = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const items = slides.slice(0, 10); // Ensure Top 10
    const timerRef = React.useRef(null);

    const resetTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 10000);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        resetTimer();
    };
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        resetTimer();
    };
    const goToSlide = (index) => {
        setCurrentIndex(index);
        resetTimer();
    };

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 10000); // 10 seconds auto-play

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(timerRef.current);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [items.length]); // Note: relying on closure for nextSlide/prevSlide might be stale if not careful, 
    // but since they use functional state updates, it's safe for index changes.
    // However, resetTimer isn't called here. Ideally we wrap next/prev in useCallback or just call raw setIndex.
    // Let's keep it simple and safe:

    // We need to re-attach listener if nextSlide/prevSlide change, OR use ref for handlers.
    // Simpler approach: define key handler logic inside effect or use a separate effect.
    // Let's just add the listener in a separate effect that depends on the functions if needed, 
    // but the functions are re-created every render.
    // Optimization: wrap nextSlide/prevSlide in useCallback, but let's just put the logic in the effect for simplicity.


    const handleDragEnd = (event, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -50 || velocity < -500) {
            nextSlide();
        } else if (offset > 50 || velocity > 500) {
            prevSlide();
        }
    };

    if (!items.length) return null;

    const currentAnime = items[currentIndex];

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-2xl shadow-2xl group border border-white/5 bg-slate-900 touch-pan-y">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentAnime.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                    {/* Backdrop Image */}
                    <div className="absolute inset-0">
                        <img
                            src={getImageUrl(currentAnime.backdrop_path, 'original')}
                            alt={currentAnime.name}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
                    </div>

                    {/* Content Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 max-w-4xl space-y-4 md:space-y-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3"
                        >
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/20">
                                #{currentIndex + 1} Top Rated
                            </span>
                            <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                <Star className="w-4 h-4 fill-current" /> {currentAnime.vote_average.toFixed(1)}
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg font-outfit"
                        >
                            {currentAnime.name}
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-300 text-sm md:text-base line-clamp-3 md:line-clamp-2 max-w-2xl leading-relaxed"
                        >
                            {currentAnime.overview}
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4"
                        >
                            <Link
                                to={`/tv/${currentAnime.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-3 bg-white text-slate-950 font-bold text-sm md:text-base rounded-full hover:bg-slate-200 transition-all transform hover:scale-105 shadow-xl shadow-white/10"
                            >
                                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Watch Now
                            </Link>
                            <Link
                                to={`/tv/${currentAnime.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-white/10 text-white font-semibold text-sm md:text-base rounded-full hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"
                            >
                                <Info className="w-4 h-4 md:w-5 md:h-5" /> Details
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex items-center gap-2 z-20">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentIndex ? 'w-8 h-2 bg-blue-500' : 'w-2 h-2 bg-white/30 hover:bg-white'
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Click Areas (Gradient) */}
            <div
                onClick={prevSlide}
                className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/50 to-transparent z-10 cursor-pointer hidden md:flex items-center justify-start pl-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
                <ChevronLeft className="w-10 h-10 text-white/50 hover:text-white transition-colors" />
            </div>
            <div
                onClick={nextSlide}
                className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/50 to-transparent z-10 cursor-pointer hidden md:flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
                <ChevronRight className="w-10 h-10 text-white/50 hover:text-white transition-colors" />
            </div>
        </div>
    );
};

export default HeroCarousel;
