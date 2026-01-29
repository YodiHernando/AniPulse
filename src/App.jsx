import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import AnimeDetail from './pages/AnimeDetail';
import Browse from './pages/Browse';

import ScrollToTop from './components/utils/ScrollToTop';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0, // Fetch fresh data
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <ScrollToTop />
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/tv/:id" element={<AnimeDetail />} />
                        <Route path="/browse" element={<Browse />} />
                    </Routes>
                </Layout>
                <SpeedInsights />
            </Router>
        </QueryClientProvider>
    );
}

export default App;
