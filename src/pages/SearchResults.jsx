import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMedia, getImageUrl } from '../services/tmdb';
import { Loader2 } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import PageTransition from '../components/utils/PageTransition';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'tv'; // Default to 'tv' if missing

    useDocumentTitle(query ? `Search: ${query} - AniPulse` : 'Search - AniPulse');

    const { data: results, isLoading } = useQuery({
        queryKey: ['searchMedia', query, type],
        queryFn: () => searchMedia(query, type),
        enabled: !!query,
    });

    if (!query) return <div className="text-center mt-20">Please enter a search term.</div>;

    return (
        <PageTransition className="space-y-8 animate-in fade-in duration-500 container mx-auto px-4 py-8 pt-32 min-h-screen">
            <h2 className="text-2xl font-bold">
                Results for "<span className="text-blue-400">{query}</span>" <span className="text-slate-500 text-base font-normal">in {type === 'movie' ? 'Movies' : 'Series'}</span>
            </h2>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : results?.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">No results found matching your query.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {results?.map((item) => (
                        <Link
                            to={`/${type}/${item.id}`} // Dynamic link based on search type
                            key={item.id}
                            className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300"
                        >
                            <div className="aspect-[2/3] overflow-hidden">
                                <img
                                    src={getImageUrl(item.poster_path, 'w342')}
                                    alt={item.name || item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                                <h3 className="font-semibold text-white truncate">{item.name || item.title}</h3>
                                <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                                    <span>{(item.first_air_date || item.release_date)?.split('-')[0] || 'N/A'}</span>
                                    <span className="text-yellow-500 font-bold">★ {item.vote_average?.toFixed(1)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </PageTransition>
    );
};

export default SearchResults;
