import { useState, useEffect } from 'react';

const MAX_HISTORY_ITEMS = 10;
const HISTORY_KEY = 'peakanime_history';

export const useHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const addToHistory = (anime) => {
        setHistory((prev) => {
            // Remove existing entry for same anime
            const filtered = prev.filter((item) => item.id !== anime.id);
            // Add new one to top
            const newItem = {
                id: anime.id,
                name: anime.name,
                poster_path: anime.poster_path,
                vote_average: anime.vote_average,
                timestamp: Date.now(),
            };

            const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    return { history, addToHistory };
};
