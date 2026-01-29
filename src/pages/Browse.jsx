import React, { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getGenres, getDiscoverAnime } from '../services/tmdb';
import AnimeCard from '../components/ui/AnimeCard';
import { Filter, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PageTransition from '../components/utils/PageTransition';

const Browse = () => {
    const [selectedGenre, setSelectedGenre] = useState(null);
    useDocumentTitle('Browse Anime - AniPulse');

    const { data: genres, isLoading: isGenresLoading } = useQuery({
        queryKey: ['genres'],
        queryFn: getGenres,
        staleTime: Infinity,
        select: (data) => {
            const excludedIds = [10763, 10764, 10766, 10767, 37, 99]; // News, Reality, Soap, Talk, Western, Documentary
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
        queryKey: ['browseAnime', selectedGenre?.id],
        queryFn: ({ pageParam = 1 }) => getDiscoverAnime(pageParam, selectedGenre?.id),
        getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

    return (
        <PageTransition className="container mx-auto px-4 py-8 min-h-screen">
            <div className="border-b border-white/10 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
                    <Filter className="text-blue-500" /> Browse Anime
                </h1>

                {/* Genre Chips */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedGenre(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedGenre
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-900 border border-white/10 text-slate-400 hover:border-blue-500/50 hover:text-white'
                            }`}
                    >
                        All Genres
                    </button>
                    {isGenresLoading ? (
                        <span className="text-slate-500 text-sm py-1.5">Loading tags...</span>
                    ) : (
                        genres?.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedGenre?.id === genre.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-slate-900 border border-white/10 text-slate-400 hover:border-blue-500/50 hover:text-white'
                                    }`}
                            >
                                {genre.name}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                    {selectedGenre ? `${selectedGenre.name} Anime` : 'Discover Anime'}
                </h2>
                {selectedGenre && (
                    <button
                        onClick={() => setSelectedGenre(null)}
                        className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        <X className="w-4 h-4" /> Clear Filter
                    </button>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {isListLoading ? (
                    [...Array(10)].map((_, i) => <div key={i} className="aspect-[2/3] bg-slate-800/50 rounded-xl animate-pulse" />)
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

            {/* Load More */}
            <div className="flex justify-center pt-12 pb-20">
                <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage || !hasNextPage}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isFetchingNextPage ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </>
                    ) : hasNextPage ? 'Load More Anime' : 'End of List'}
                </button>
            </div>
        </PageTransition>
    );
};

export default Browse;
