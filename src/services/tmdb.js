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

export const getTrendingAnime = async (page = 1) => {
    // Trending endpoint returns mixed content (TV shows + Anime).
    // To fill a page with 20 *Anime* items, we might need to fetch multiple pages from the API
    // because page 1 might only have 5 anime and 15 western shows.

    // However, for simplicity and speed in this specific function, we will return what we get 
    // but we can try to fetch a bit more aggressively if needed.
    // Let's stick to the /trending endpoint because it gives the TRUE "hot right now" list.

    // We'll fetch 5 pages concurrently to DRASTICALLY increase the chance of getting enough anime items
    // Since 'page' argument here is the "UI Page", we map it to API pages.
    // UI Page 1 -> API Page 1, 2, 3, 4, 5

    const startPage = (page - 1) * 5 + 1;
    const [res1, res2, res3, res4, res5] = await Promise.all([
        tmdb.get(`/trending/tv/week`, { params: { with_original_language: 'ja', page: startPage } }),
        tmdb.get(`/trending/tv/week`, { params: { with_original_language: 'ja', page: startPage + 1 } }),
        tmdb.get(`/trending/tv/week`, { params: { with_original_language: 'ja', page: startPage + 2 } }),
        tmdb.get(`/trending/tv/week`, { params: { with_original_language: 'ja', page: startPage + 3 } }),
        tmdb.get(`/trending/tv/week`, { params: { with_original_language: 'ja', page: startPage + 4 } })
    ]);

    const allResults = [
        ...res1.data.results,
        ...res2.data.results,
        ...res3.data.results,
        ...res4.data.results,
        ...res5.data.results
    ];

    // Strict client-side filter for anime
    const animeResults = allResults.filter(item =>
        item.genre_ids?.includes(16) &&
        item.original_language === 'ja'
    );

    // Remove duplicates just in case
    const uniqueAnime = [...new Map(animeResults.map(item => [item.id, item])).values()];

    // Cut to exactly 20 items to look clean in the grid
    const exactResults = uniqueAnime.slice(0, 20);

    return {
        // Mocking the pagination structure to keep infinite scroll working
        page: page,
        results: exactResults,
        total_pages: 1000,
        total_results: 10000
    };
};

export const getUpcomingAnime = async (page = 1, genreId = null) => {
    // TMDB doesn't have a direct "upcoming TV" like movies, so we use discover with future dates
    const today = new Date().toISOString().split('T')[0];

    const params = {
        with_genres: 16,
        with_original_language: 'ja',
        sort_by: 'first_air_date.asc', // Soonest first
        'first_air_date.gte': today,
        page: page
    };

    if (genreId) {
        params.with_genres = `16,${genreId}`;
    }

    const response = await tmdb.get('/discover/tv', { params });
    return response.data;
};

export const getAiringTodayAnime = async () => {
    const response = await tmdb.get('/tv/airing_today', {
        params: {
            with_original_language: 'ja',
            page: 1
        }
    });
    return response.data.results.filter(item => item.genre_ids?.includes(16));
};

export const getDiscoverAnime = async (page = 1, genreId = null, sortBy = 'popularity.desc') => {
    const params = {
        with_genres: 16, // Animation
        with_original_language: 'ja',
        sort_by: sortBy,
        page: page,
        'vote_count.gte': 50 // Lower threshold to allow new shows to appear
    };

    if (genreId) {
        params.with_genres = `16,${genreId}`;
    }

    // Special handling for Newest to ensure we get actual new shows
    if (sortBy === 'first_air_date.desc') {
        const today = new Date().toISOString().split('T')[0];
        // Optionally restrict to released shows to avoid far-future placeholders, 
        // but 'first_air_date.desc' usually works okay.
        // We might want to filter out things with NO votes if needed, but 'newest' implies fresh.
        params['vote_count.gte'] = 0;
        params['first_air_date.lte'] = today; // Exclude future shows (Upcoming)
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
