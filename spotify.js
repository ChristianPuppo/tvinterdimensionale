class SpotifyHandler {
    constructor() {
        this.playlist = [];
    }

    getAuthUrl() {
        const clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        const redirectUri = 'https://tvinterdimensionale-5wnf1jt0p-christians-projects-524bbc11.vercel.app/callback.html';
        const scopes = ['playlist-read-private', 'playlist-read-collaborative'];
        
        return 'https://accounts.spotify.com/authorize' +
            '?client_id=' + encodeURIComponent(clientId) +
            '&redirect_uri=' + encodeURIComponent(redirectUri) +
            '&scope=' + encodeURIComponent(scopes.join(' ')) +
            '&response_type=code' +
            '&show_dialog=true';
    }

    isAuthenticated() {
        return !!localStorage.getItem('spotify_token');
    }

    async getAccessToken(code) {
        const clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        const redirectUri = 'https://tvinterdimensionale-5wnf1jt0p-christians-projects-524bbc11.vercel.app/callback.html';
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
            }),
        });

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('spotify_token', data.access_token);
            return data.access_token;
        }
        throw new Error('Failed to get access token');
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