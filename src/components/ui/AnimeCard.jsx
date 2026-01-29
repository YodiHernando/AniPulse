import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, getAnimeVideos } from '../../services/tmdb';
import { Star, Plus, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import TrailerModal from './TrailerModal';

const AnimeCard = ({ anime, index = 0 }) => {

    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shouldFetchVideo, setShouldFetchVideo] = useState(false);

    // Fetch video data only when needed (user clicks trailer)
    const { data: videos } = useQuery({
        queryKey: ['anime_video', anime.id],
        queryFn: () => getAnimeVideos(anime.id),
        enabled: shouldFetchVideo,
        staleTime: 1000 * 60 * 60
    });

    const trailer = videos?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos?.find(v => v.site === 'YouTube');

    const handleTrailerClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShouldFetchVideo(true);
        setIsModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative w-full h-full flex flex-col gap-2"
        >
            {/* Poster Image Container */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-slate-900 shadow-lg group-hover:shadow-blue-500/20 group-hover:border-blue-500/30 transition-all duration-300">
                <Link to={`/tv/${anime.id}`}>
                    <img
                        src={getImageUrl(anime.poster_path, 'w342')}
                        alt={anime.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                </Link>

                {/* Overlay Actions (Visible on Hover/Focus) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                    <Link to={`/tv/${anime.id}`} className="absolute inset-0 z-0" aria-label="View Details" />

                    <div className="z-10 flex flex-col gap-2 w-full">
                        <button
                            onClick={handleTrailerClick}
                            className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-2 rounded-full hover:bg-slate-200 transition-colors text-xs uppercase tracking-wide cursor-pointer relative z-20"
                        >
                            <Play className="w-3 h-3 fill-current" /> Trailer
                        </button>
                        <button className="flex items-center justify-center gap-2 w-full bg-white/20 text-white font-bold py-2 rounded-full hover:bg-white/30 transition-colors text-xs uppercase tracking-wide backdrop-blur-md relative z-20">
                            <Plus className="w-4 h-4" /> Watchlist
                        </button>
                    </div>
                </div>

                {/* Top Right Add Button */}
                <button className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-blue-600 transition-colors backdrop-blur-md z-20">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <TrailerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                videoKey={trailer?.key}
            />

            {/* Info Section */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-start justify-between gap-2">
                    <Link to={`/tv/${anime.id}`} className="font-semibold text-white text-base leading-tight hover:text-blue-400 transition-colors line-clamp-1" title={anime.name}>
                        {anime.name}
                    </Link>
                    <div className="flex items-center gap-1 bg-slate-800/80 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className={anime.vote_average >= 7 ? 'text-white' : 'text-slate-400'}>
                            {anime.vote_average.toFixed(1)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{anime.first_air_date ? anime.first_air_date.split('-')[0] : 'TBA'}</span>
                    <span>•</span>
                    <span className="truncate">TV Series</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AnimeCard;
