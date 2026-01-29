import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-slate-950 py-8 mt-auto">
            <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} <span className="font-bold tracking-tight"><span className="text-slate-200">Ani</span><span className="text-blue-500">Pulse</span></span>. All rights reserved.</p>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                    <span>Made by <span className="text-blue-400 font-bold hover:text-blue-300 transition-colors cursor-default">Yodai</span></span>
                    <span className="text-slate-700">|</span>
                    <span>Data by TMDB</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
