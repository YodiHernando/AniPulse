import React, { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getTopRatedAnime, getDiscoverAnime } from '../services/tmdb';
import { ChevronDown, Loader2, Search, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PageTransition from '../components/utils/PageTransition';
import HeroCarousel from '../components/layout/HeroCarousel';
import { motion } from 'framer-motion';
import AnimeCard from '../components/ui/AnimeCard';
import { Skeleton } from '../components/ui/Skeleton';

const Home = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { history } = useHistory();
    useDocumentTitle('AniPulse - Home');

    const { data: topRated, isLoading: isTopRatedLoading } = useQuery({
        queryKey: ['topRatedAnime'],
        queryFn: getTopRatedAnime,
    });

    const {
        data: discoverData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isDiscoverLoading
    } = useInfiniteQuery({
        queryKey: ['discoverAnime'],
        queryFn: ({ pageParam = 1 }) => getDiscoverAnime(pageParam),
        getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleScrollToTrending = () => {
        const element = document.getElementById('trending-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <PageTransition className="flex flex-col items-center gap-12 text-center pb-20">

            {/* Hero / Search Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 max-w-2xl w-full px-4 pt-20 min-h-[50vh] flex flex-col justify-center"
            >
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                    Ani<span className="text-blue-500">Pulse</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light">
                    Track the heartbeat of anime quality.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-lg mx-auto w-full group pt-8">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none pt-8">
                        <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-full border border-white/10 bg-slate-900/80 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xl backdrop-blur-md"
                        placeholder="Search anime..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>

                {history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="pt-8"
                    >
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs uppercase tracking-widest mb-4">
                            <Clock className="w-3 h-3" /> Recently Viewed
                        </div>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {history.slice(0, 5).map(item => (
                                <Link key={item.id} to={`/tv/${item.id}`} className="group relative w-12 md:w-16 opacity-60 hover:opacity-100 transition-opacity">
                                    <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} alt={item.name} className="w-full rounded-md shadow-lg border border-white/10" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div className="pt-12 animate-bounce">
                    <button onClick={handleScrollToTrending} className="text-slate-600 hover:text-white transition-colors">
                        <ChevronDown className="w-8 h-8" />
                    </button>
                </div>
            </motion.div>

            {/* Top Rated Section - Hero Carousel */}
            {/* Top Rated Section - Hero Carousel */}
            <div id="trending-section" className="w-full container max-w-7xl mx-auto px-4 pt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <span className="w-1 h-8 bg-blue-500 rounded-full block"></span> Top Rated All Time
                    </h2>
                </div>

                {isTopRatedLoading ? (
                    <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden relative">
                        <Skeleton className="w-full h-full absolute inset-0 bg-slate-800" />
                        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-4xl space-y-4">
                            <Skeleton className="h-4 w-32 bg-slate-700" />
                            <Skeleton className="h-12 w-3/4 bg-slate-700" />
                            <Skeleton className="h-20 w-full max-w-2xl bg-slate-700" />
                            <div className="flex gap-4 pt-4">
                                <Skeleton className="h-12 w-32 rounded-full bg-slate-700" />
                                <Skeleton className="h-12 w-32 rounded-full bg-slate-700" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <HeroCarousel slides={topRated || []} />
                )}
            </div>



            {/* Discover / All Anime Section */}
            <div className="w-full space-y-8 container max-w-7xl mx-auto px-4 pt-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <span className="w-1 h-8 bg-blue-500 rounded-full block"></span> All Anime
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
                    {isDiscoverLoading ? (
                        [...Array(20)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-1/4" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        discoverData?.pages.map((page, i) => (
                            <React.Fragment key={i}>
                                {page.results.map((anime, index) => (
                                    <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index % 20} />
                                ))}
                            </React.Fragment>
                        ))
                    )}
                </div>

                <div className="pt-8 flex justify-center">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage || !hasNextPage}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                            </>
                        ) : hasNextPage ? 'Load More Anime' : 'End of list'}
                    </button>
                </div>
            </div>

        </PageTransition >
    );
};

export default Home;
