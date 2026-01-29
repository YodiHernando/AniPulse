import React, { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getGenres, getDiscoverAnime, getTrendingAnime, getUpcomingAnime } from '../services/tmdb';
import AnimeCard from '../components/ui/AnimeCard';
import { Filter, X, Loader2, Sparkles, TrendingUp, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PageTransition from '../components/utils/PageTransition';

const Browse = () => {
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [activeTab, setActiveTab] = useState('newest'); // 'newest' | 'trending' | 'top_rated' | 'upcoming'

    useDocumentTitle('Browse Anime - AniPulse');

    const { data: genres, isLoading: isGenresLoading } = useQuery({
        queryKey: ['genres'],
        queryFn: getGenres,
        staleTime: Infinity,
        select: (data) => {
            const excludedIds = [10763, 10764, 10766, 10767, 37, 99];
            return data.filter(g => !excludedIds.includes(g.id));
        }
    });

    const {
        data: animeList,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isListLoading
    } = useInfiniteQuery({
        queryKey: ['browseAnime', activeTab, selectedGenre?.id],
        queryFn: ({ pageParam = 1 }) => {
            // If specific tabs and NO genre filter (some endpoints don't support mixing nicely, but we'll try our best)
            // Note: getTrendingAnime logic currently ignores genre filter in API call potentially, but we apply client side filter.
            // For simplicity, if a Genre is selected, we usually default back to Discover to ensure accurate filtering.

            if (activeTab === 'trending' && !selectedGenre) return getTrendingAnime(pageParam);
            if (activeTab === 'upcoming') return getUpcomingAnime(pageParam, selectedGenre?.id);

            let sortBy = 'popularity.desc';
            if (activeTab === 'newest') sortBy = 'first_air_date.desc';
            if (activeTab === 'top_rated') sortBy = 'vote_average.desc';
            if (activeTab === 'trending') sortBy = 'popularity.desc'; // Fallback if genre selected for Trending

            // Special case logic for "Upcoming + Genre" via discover could be complex, 
            // but let's stick to standard sorts for now or assume Discover handles it.
            // Valid sort_by values: popularity.desc, vote_average.desc, first_air_date.desc

            return getDiscoverAnime(pageParam, selectedGenre?.id, sortBy);
        },
        getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

    const tabs = [
        { id: 'newest', label: 'Newest', icon: Sparkles },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
        { id: 'top_rated', label: 'Top Rated', icon: Star },
        { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    ];

    return (
        <PageTransition className="container mx-auto px-4 py-8 min-h-screen">
            {/* Header & Controls */}
            <div className="flex flex-col gap-8 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Filter className="text-blue-500" /> Browse Anime
                    </h1>
                </div>

                {/* Main Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit backdrop-blur-sm">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Genre Filter (Collapsible or Horizontal Scroll) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Filter by Genre</h3>
                        {selectedGenre && (
                            <button
                                onClick={() => setSelectedGenre(null)}
                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                            >
                                <X className="w-3 h-3" /> Clear Filter
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isGenresLoading ? (
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-20 bg-slate-900 rounded-full animate-pulse" />)}
                            </div>
                        ) : (
                            genres?.map((genre) => (
                                <button
                                    key={genre.id}
                                    onClick={() => setSelectedGenre(selectedGenre?.id === genre.id ? null : genre)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedGenre?.id === genre.id
                                        ? 'bg-white text-black border-white shadow-lg'
                                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-blue-500/50 hover:text-blue-400'
                                        }`}
                                >
                                    {genre.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {isListLoading ? (
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="aspect-[2/3] bg-slate-800/50 rounded-xl animate-pulse" />
                            <div className="h-4 bg-slate-800/30 rounded w-3/4" />
                            <div className="h-3 bg-slate-800/30 rounded w-1/2" />
                        </div>
                    ))
                ) : (
                    animeList?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.results.map((anime, index) => (
                                <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index % 20} />
                            ))}
                        </React.Fragment>
                    ))
                )}
            </div>

            {/* Empty State */}
            {!isListLoading && animeList?.pages[0]?.results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Filter className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg">No anime found matching your criteria.</p>
                </div>
            )}

            {/* Load More */}
            {hasNextPage && (
                <div className="flex justify-center pt-16 pb-20">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 border border-white/5"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading more...
                            </>
                        ) : 'Load More Anime'}
                    </button>
                </div>
            )}
        </PageTransition>
    );
};

export default Browse;
