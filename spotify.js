class SpotifyHandler {
    constructor() {
        this.playlist = [];
    }

    getAuthUrl() {
        const clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        const redirectUri = 'https://tvinterdimensionale.vercel.app/callback';
        const scopes = ['playlist-read-private', 'playlist-read-collaborative'];
        
        return 'https://accounts.spotify.com/authorize' +
            '?client_id=' + clientId +
            '&response_type=token' +
            '&redirect_uri=' + encodeURIComponent(redirectUri) +
            '&scope=' + encodeURIComponent(scopes.join(' '));
    }

    isAuthenticated() {
        return !!localStorage.getItem('spotify_token');
    }

    async fetchPlaylist(playlistUrl) {
        try {
            // Extract playlist ID from URL
            const playlistId = playlistUrl.split('playlist/')[1].split('?')[0];
            const token = localStorage.getItem('spotify_token');
            
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                // Token expired
                localStorage.removeItem('spotify_token');
                window.location.href = this.getAuthUrl();
                return;
            }

            const data = await response.json();
            
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