import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef(null);

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (listRef.current && !listRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTrendingClick = (e) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold font-outfit tracking-tight">
                        <span className="text-white">Ani</span>
                        <span className="text-blue-500">Pulse</span>
                    </span>
                </Link>

                <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <button onClick={handleTrendingClick} className="hover:text-white transition-colors cursor-pointer">Top Rated</button>
                        <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
                    </div>

                    {/* Search Bar Toggle */}
                    <div ref={listRef} className="relative flex items-center">
                        <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full md:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-4 pr-10 text-white focus:outline-none focus:border-blue-500 text-xs md:text-sm"
                                    autoFocus={isSearchOpen}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </form>
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`p-2 hover:bg-white/10 rounded-full transition-colors ${isSearchOpen ? 'text-white bg-white/10 ml-2' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
