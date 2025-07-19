class SpotifyHandler {
    constructor() {
        this.playlist = [];
        this.clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        this.redirectUri = window.location.origin + '/callback.html';
    }

    getAuthUrl() {
        console.log('Generating auth URL with:', {
            clientId: this.clientId,
            redirectUri: this.redirectUri
        });

        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'token',
            redirect_uri: this.redirectUri,
            scope: 'playlist-read-private playlist-read-collaborative',
            show_dialog: true
        });

        const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
        console.log('Generated auth URL:', authUrl);
        return authUrl;
    }

    isAuthenticated() {
        const hasToken = !!localStorage.getItem('spotify_token');
        console.log('Checking authentication:', { hasToken });
        return hasToken;
    }

    async fetchPlaylist(playlistUrl) {
        try {
            console.log('Fetching playlist:', playlistUrl);
            const playlistId = playlistUrl.split('playlist/')[1].split('?')[0];
            const token = localStorage.getItem('spotify_token');
            
            if (!token) {
                throw new Error('Not authenticated');
            }

            console.log('Making request with token:', token.substring(0, 10) + '...');

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);

            if (response.status === 401) {
                // Token expired, redirect to login
                console.log('Token expired, redirecting to login');
                localStorage.removeItem('spotify_token');
                window.location.href = this.getAuthUrl();
                return;
            }

            const data = await response.json();
            console.log('Playlist data received:', {
                trackCount: data.items?.length || 0
            });
            
            this.playlist = data.items.map(item => ({
                title: item.track.name,
                artist: item.track.artists[0].name
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
window.spotifyHandler = spotifyHandler; 