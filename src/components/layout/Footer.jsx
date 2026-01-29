import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-slate-950 py-8 mt-auto">
            <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} AniPulse. Data provided by TMDB.</p>
            </div>
        </footer>
    );
};

export default Footer;
