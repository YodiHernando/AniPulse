import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

export const getTopRatedAnime = async () => {
    // Top Rated All Time
    const response = await tmdb.get('/discover/tv', {
        params: {
            with_genres: 16,
            with_original_language: 'ja',
            sort_by: 'vote_average.desc',
            'vote_count.gte': 1000, // Higher threshold for "All Time"
            page: 1
        }
    });
    return response.data.results;
};

export const getThisSeasonAnime = async () => {
    // Get current date for filtering "This Season"
    // For simplicity and robustness, we'll use "on_the_air" which is "episodes airing in next 7 days" 
    // OR we can use discover with Air Date >= 3 months ago.
    // Let's use /tv/on_the_air for "Currently Airing" vibe.
    const response = await tmdb.get('/tv/on_the_air', {
        params: {
            with_original_language: 'ja',
            page: 1
        }
    });

    // Client-side filter to ensure it's anime (genre 16)
    return response.data.results.filter(item => item.genre_ids.includes(16));
};

export const getDiscoverAnime = async (page = 1, genreId = null) => {
    const params = {
        with_genres: 16, // Animation
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
        page: page,
        'vote_count.gte': 100
    };

    if (genreId) {
        params.with_genres = `16,${genreId}`;
    }

    const response = await tmdb.get('/discover/tv', { params });
    return response.data;
};

export const searchAnime = async (query) => {
    const response = await tmdb.get('/search/tv', {
        params: { query },
    });
    return response.data.results.filter(
        (item) => item.original_language === 'ja' && item.genre_ids.includes(16)
    );
};

export const getAnimeDetails = async (id) => {
    const response = await tmdb.get(`/tv/${id}`);
    return response.data;
};

export const getSeasonDetails = async (tvId, seasonNumber) => {
    const response = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
};

export const getAnimeVideos = async (id) => {
    const response = await tmdb.get(`/tv/${id}/videos`);
    return response.data.results;
};

export const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getGenres = async () => {
    const response = await tmdb.get('/genre/tv/list');
    return response.data.genres;
};
