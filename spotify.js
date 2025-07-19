class SpotifyHandler {
    constructor() {
        this.accessToken = null;
        this.playlist = [];
        this.checkAuthenticationOnLoad();
    }

    checkAuthenticationOnLoad() {
        // Controlla se abbiamo già un token valido
        const token = localStorage.getItem('spotify_token');
        const expiration = localStorage.getItem('spotify_token_expiration');
        
        if (token && expiration && Date.now() < parseInt(expiration)) {
            this.accessToken = token;
            return true;
        }
        return false;
    }

    async initialize() {
        if (this.checkAuthenticationOnLoad()) {
            return;
        }

        // Parametri per l'autenticazione OAuth
        const clientId = config.spotify.clientId;
        const redirectUri = encodeURIComponent(window.location.origin + '/callback');
        const scope = encodeURIComponent('playlist-read-private playlist-read-collaborative');

        // Genera uno state casuale per sicurezza
        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('spotify_auth_state', state);

        // Costruisci l'URL di autorizzazione
        const authUrl = 'https://accounts.spotify.com/authorize' +
            '?client_id=' + clientId +
            '&response_type=token' +
            '&redirect_uri=' + redirectUri +
            '&state=' + state +
            '&scope=' + scope;

        // Redirect all'autorizzazione Spotify
        window.location.href = authUrl;
    }

    async fetchPlaylist(playlistUrl) {
        try {
            if (!this.accessToken) {
                throw new Error('Not authenticated');
            }

            // Estrai l'ID della playlist dall'URL
            const playlistId = playlistUrl.split('playlist/')[1].split('?')[0];
            
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token scaduto, rimuovi e richiedi nuova autenticazione
                    localStorage.removeItem('spotify_token');
                    localStorage.removeItem('spotify_token_expiration');
                    await this.initialize();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            this.playlist = data.items
                .filter(item => item.track) // Filtra eventuali tracce nulle
                .map(item => ({
                    title: item.track.name,
                    artist: item.track.artists[0].name,
                    duration: item.track.duration_ms
                }));

            return this.playlist;
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
            throw error;
        }
    }

    getTrack(index) {
        if (index < 0 || index >= this.playlist.length) {
            return null;
        }
        return this.playlist[index];
    }

    getPlaylistLength() {
        return this.playlist.length;
    }

    setFallbackPlaylist() {
        this.playlist = fallbackPlaylist;
        return this.playlist;
    }
}

const spotifyHandler = new SpotifyHandler(); 