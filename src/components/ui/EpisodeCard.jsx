import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';

const EpisodeCard = ({ ep }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex flex-col md:flex-row gap-4 md:items-center bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 p-4 rounded-xl transition-colors cursor-pointer"
        >
            {/* Thumbnail */}
            <div className="relative shrink-0 w-full md:w-[180px] aspect-video rounded-lg overflow-hidden bg-black">
                <img
                    src={getImageUrl(ep.still_path, 'w300')}
                    alt={`Ep ${ep.episode_number}`}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                />
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-500 font-bold text-sm">#{ep.episode_number}</span>
                    <h4 className="font-semibold text-white truncate max-w-[200px] md:max-w-full">{ep.name}</h4>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ep.air_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ep.runtime} min</span>
                </div>
                {/* Description Logic: 
                    Mobile: Toggle expand on click (isExpanded)
                    Desktop: Hover reveals (group-hover) OR click (isExpanded)
                */}
                <p className={`text-slate-400 text-sm transition-all ${isExpanded
                        ? 'line-clamp-none'
                        : 'line-clamp-2 md:line-clamp-1 md:group-hover:line-clamp-none'
                    }`}>
                    {ep.overview || "No description available."}
                </p>
                {/* Mobile Hint */}
                <div className={`md:hidden text-[10px] text-blue-500/50 mt-1 ${isExpanded ? 'hidden' : 'block'}`}>
                    Tap to read more
                </div>
            </div>

            {/* Rating */}
            <div
                className={`shrink-0 text-right md:text-center min-w-[60px] ${ep.vote_average >= 8 ? 'text-green-400' : ep.vote_average >= 6.1 ? 'text-yellow-400' : 'text-red-400'
                    }`}
            >
                <div className="text-2xl font-bold">{ep.vote_average > 0 ? ep.vote_average.toFixed(1) : '-'}</div>
                <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Score</div>
            </div>
        </div>
    );
};

export default EpisodeCard;
