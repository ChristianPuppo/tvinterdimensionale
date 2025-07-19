class SpotifyHandler {
    constructor() {
        this.playlist = [];
        this.clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        this.redirectUri = 'https://tvinterdimensionale-5wnf1jt0p-christians-projects-524bbc11.vercel.app/callback.html';
    }

    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'token',
            redirect_uri: this.redirectUri,
            scope: 'playlist-read-private playlist-read-collaborative',
            show_dialog: true
        });

        return `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    isAuthenticated() {
        return !!localStorage.getItem('spotify_token');
    }

    async fetchPlaylist(playlistUrl) {
        try {
            console.log('Fetching playlist:', playlistUrl);
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
                // Token expired, redirect to login
                localStorage.removeItem('spotify_token');
                window.location.href = this.getAuthUrl();
                return;
            }

            const data = await response.json();
            console.log('Playlist data received');
            
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