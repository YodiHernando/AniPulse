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

// --- Generic Media Fetchers (Anime: TV & Movie) ---

export const getTrendingMedia = async (type = 'tv', page = 1) => {
    // HYBRID STRATEGY:
    // 1. Movies: Global /trending movies rarely have Anime. Deep fetching is inefficient and results in low count.
    //    We use /discover with popularity.desc. This guarantees 20 items per page.
    if (type === 'movie') {
        const params = {
            with_genres: 16,
            with_original_language: 'ja',
            sort_by: 'popularity.desc',
            page: page,
            include_adult: false
        };
        const response = await tmdb.get(`/discover/${type}`, { params });
        return response.data;
    }

    // 2. TV Series: Global /discover favors long-running shows (Legacy).
    //    User wants "Trending Now". So we use the real /trending endpoint + Deep Fetch.
    const pagesToFetch = 10;
    const startPage = (page - 1) * pagesToFetch + 1;

    // Generate promises for parallel fetching
    const requests = Array.from({ length: pagesToFetch }, (_, i) =>
        tmdb.get(`/trending/${type}/week`, {
            params: {
                with_original_language: 'ja',
                page: startPage + i
            }
        })
    );

    const responses = await Promise.all(requests);
    const allResults = responses.flatMap(r => r.data.results);

    // Filter for Anime (Genre 16) + Japanese
    const animeResults = allResults.filter(item =>
        item.genre_ids?.includes(16) &&
        item.original_language === 'ja'
    );

    // Deduplicate by ID
    const unique = [...new Map(animeResults.map(item => [item.id, item])).values()];

    return {
        page: page,
        results: unique.slice(0, 20),
        total_pages: 100, // Cap at 100 deep-pages to be safe
        total_results: 2000
    };
};



export const getUpcomingMedia = async (type = 'tv', page = 1, genreId = null) => {
    const today = new Date().toISOString().split('T')[0];

    const params = {
        with_genres: 16,
        with_original_language: 'ja',
        // Movies use 'release_date', TV uses 'first_air_date'
        sort_by: type === 'movie' ? 'release_date.asc' : 'first_air_date.asc',
        page: page
    };

    // Date filter key depends on type
    if (type === 'movie') {
        params['primary_release_date.gte'] = today;
        params['release_date.gte'] = today;
    } else {
        params['first_air_date.gte'] = today;
    }

    if (genreId) {
        params.with_genres = `16,${genreId}`;
    }

    const response = await tmdb.get(`/discover/${type}`, { params });
    return response.data;
};

export const getAiringTodayMedia = async (type = 'tv') => {
    // 'airing_today' is TV specific. Movies use 'now_playing' but that logic is slightly different.
    const endpoint = type === 'movie' ? '/movie/now_playing' : '/tv/airing_today';

    const response = await tmdb.get(endpoint, {
        params: {
            with_original_language: 'ja',
            page: 1
        }
    });
    return response.data.results.filter(item => item.genre_ids?.includes(16));
};

export const getDiscoverMedia = async (type = 'tv', page = 1, genreId = null, sortBy = 'popularity.desc') => {
    // Remap sort keys for Movies if needed
    let safeSortBy = sortBy;
    if (type === 'movie') {
        if (sortBy === 'first_air_date.desc') safeSortBy = 'primary_release_date.desc';
        if (sortBy === 'first_air_date.asc') safeSortBy = 'primary_release_date.asc';
    }

    const params = {
        with_genres: 16, // Animation
        with_original_language: 'ja',
        sort_by: safeSortBy,
        page: page,
        'vote_count.gte': 50
    };

    if (genreId) {
        params.with_genres = `16,${genreId}`;
    }

    // Newest Filter Logic (exclude upcoming)
    if (safeSortBy === 'first_air_date.desc' || safeSortBy === 'primary_release_date.desc') {
        const today = new Date().toISOString().split('T')[0];
        params['vote_count.gte'] = 0;

        if (type === 'movie') {
            params['primary_release_date.lte'] = today;
        } else {
            params['first_air_date.lte'] = today;
        }
    }

    const response = await tmdb.get(`/discover/${type}`, { params });
    return response.data;
};

export const searchMedia = async (query, type = 'tv') => {
    // Search endpoint for generic type
    const response = await tmdb.get(`/search/${type}`, {
        params: { query },
    });

    // Filter for Anime (Genre 16) + Japanese
    return response.data.results.filter(
        (item) => item.original_language === 'ja' && item.genre_ids?.includes(16)
    );
};

// Legacy support
export const searchAnime = (query) => searchMedia(query, 'tv');

export const getMediaDetails = async (id, type = 'tv') => {
    // Generic detail fetcher
    const response = await tmdb.get(`/${type}/${id}`);
    return response.data;
};

// Legacy support (redirect to generic)
export const getAnimeDetails = (id) => getMediaDetails(id, 'tv');

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

export const getGenres = async (type = 'tv') => {
    const response = await tmdb.get(`/genre/${type}/list`);
    return response.data.genres;
};
