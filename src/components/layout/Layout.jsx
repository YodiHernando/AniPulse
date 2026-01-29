import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
