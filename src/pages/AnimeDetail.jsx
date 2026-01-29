import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAnimeDetails, getSeasonDetails, getImageUrl } from '../services/tmdb';
import { Loader2, Calendar, Star, Clock } from 'lucide-react';
import PulseChart from '../components/charts/PulseChart';
import { useHistory } from '../hooks/useHistory';

const AnimeDetail = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedSeason, setSelectedSeason] = useState(1);
    const { addToHistory } = useHistory();


    // Sync state with URL param ?season=X
    useEffect(() => {
        const seasonParam = searchParams.get('season');
        if (seasonParam) {
            setSelectedSeason(parseInt(seasonParam));
        }
    }, [searchParams]);

    const { data: anime, isLoading: isAnimeLoading } = useQuery({
        queryKey: ['anime', id],
        queryFn: () => getAnimeDetails(id),
    });

    // Save to history when loaded
    useEffect(() => {
        if (anime) {
            addToHistory(anime);
        }
    }, [anime]);



    const { data: seasonData, isLoading: isSeasonLoading } = useQuery({
        queryKey: ['season', id, selectedSeason],
        queryFn: () => getSeasonDetails(id, selectedSeason),
        enabled: !!anime, // Wait for anime details first
    });

    const handleSeasonChange = (e) => {
        const newSeason = e.target.value;
        setSelectedSeason(newSeason);
        setSearchParams({ season: newSeason });
    };

    if (isAnimeLoading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>;
    }

    if (!anime) {
        return <div className="h-screen flex items-center justify-center text-slate-500">Anime not found or failed to load.</div>;
    }

    // Calculate The Big Three Stats
    const episodes = seasonData?.episodes || [];
    const validEpisodes = episodes.filter(ep => ep.vote_average > 0);

    const bestEpisode = validEpisodes.length > 0
        ? validEpisodes.reduce((prev, current) => (prev.vote_average > current.vote_average) ? prev : current)
        : null;

    const worstEpisode = validEpisodes.length > 0
        ? validEpisodes.reduce((prev, current) => (prev.vote_average < current.vote_average) ? prev : current)
        : null;

    const averageScore = validEpisodes.length > 0
        ? (validEpisodes.reduce((sum, ep) => sum + ep.vote_average, 0) / validEpisodes.length).toFixed(1)
        : 'N/A';

    return (
        <div className="pb-20 pt-20 md:pt-24">
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="relative md:h-[50vh] w-full rounded-2xl overflow-hidden mb-12 border border-white/5 bg-slate-900">
                <div className="absolute inset-0">
                    {anime.backdrop_path && (
                        <img
                            src={getImageUrl(anime.backdrop_path, 'original')}
                            alt="Backdrop"
                            className="w-full h-full object-cover opacity-30 md:opacity-40 blur-sm"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative md:absolute md:bottom-0 md:left-0 w-full p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end z-10">
                    {anime.poster_path ? (
                        <img
                            src={getImageUrl(anime.poster_path, 'w342')}
                            alt={anime.name}
                            className="w-[180px] md:w-[220px] rounded-xl shadow-2xl border-4 border-slate-950 shrink-0" // Floating effect
                        />
                    ) : (
                        <div className="w-[180px] md:w-[220px] aspect-[2/3] bg-slate-800 rounded-xl border-4 border-slate-950 flex items-center justify-center text-slate-500 text-xs shrink-0">
                            No Poster
                        </div>
                    )}
                    <div className="space-y-4 max-w-3xl text-center md:text-left pt-4 md:pt-0">
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{anime.name}</h1>
                        <p className="text-slate-300 text-sm/relaxed line-clamp-4 md:line-clamp-none max-w-2xl">
                            {anime.overview}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {anime.genres?.map(g => (
                                <span key={g.id} className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-medium text-white border border-white/10">
                                    {g.name}
                                </span>
                            ))}
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-medium text-white border border-blue-500 shadow-lg shadow-blue-500/20">
                                {anime.status || 'Unknown Status'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control & Stats Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-2">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-400">Season:</label>
                    <select
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                        disabled={!anime.seasons || anime.seasons.length === 0}
                        className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                        {anime.seasons?.map(season => (
                            // Filter out Season 0 (Specials) if preferred, but usually good to keep
                            season.season_number > 0 && (
                                <option key={season.id} value={season.season_number}>
                                    Season {season.season_number} ({season.episode_count} eps)
                                </option>
                            )
                        )) || <option>No Seasons</option>}
                    </select>
                </div>

                {/* The Big Three Stats */}
                {validEpisodes.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-slate-500 mb-1">Best Ep</div>
                            <div className="text-green-400 font-bold text-lg">{bestEpisode?.vote_average?.toFixed(1) || '-'}</div>
                            <div className="text-[10px] text-slate-600 truncate max-w-[80px] mx-auto">#{bestEpisode?.episode_number || '-'}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-slate-500 mb-1">Worst Ep</div>
                            <div className="text-red-400 font-bold text-lg">{worstEpisode?.vote_average?.toFixed(1) || '-'}</div>
                            <div className="text-[10px] text-slate-600 truncate max-w-[80px] mx-auto">#{worstEpisode?.episode_number || '-'}</div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-slate-500 mb-1">Average</div>
                            <div className="text-blue-400 font-bold text-lg">{averageScore}</div>
                            <div className="text-[10px] text-slate-600">Season {selectedSeason}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pulse Chart */}
            {isSeasonLoading ? (
                <div className="h-[400px] bg-slate-900/30 rounded-2xl animate-pulse" />
            ) : validEpisodes.length > 1 ? (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PulseChart data={episodes} />
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500 bg-slate-900/30 rounded-2xl mb-12">
                    Not enough rating data for this season chart.
                </div>
            )}

            {/* Episode List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    Episodes <span className="text-slate-500 text-sm font-normal">({episodes?.length})</span>
                </h3>
                {episodes?.map((ep) => (
                    <div key={ep.id} className="group flex flex-col md:flex-row gap-4 md:items-center bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 p-4 rounded-xl transition-colors">
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
                            <p className="text-slate-400 text-sm line-clamp-2 md:line-clamp-1 group-hover:line-clamp-none transition-all">
                                {ep.overview || "No description available."}
                            </p>
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
                ))}
            </div>
        </div>
    );
};

export default AnimeDetail;
