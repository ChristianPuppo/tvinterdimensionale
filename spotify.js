class SpotifyHandler {
    constructor() {
        this.playlist = [];
        this.clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        this.redirectUri = 'https://tvinterdimensionale-5wnf1jt0p-christians-projects-524bbc11.vercel.app/callback.html';
    }

    getAuthUrl() {
        const scopes = ['playlist-read-private', 'playlist-read-collaborative'];
        
        return 'https://accounts.spotify.com/authorize' +
            '?client_id=' + encodeURIComponent(this.clientId) +
            '&redirect_uri=' + encodeURIComponent(this.redirectUri) +
            '&scope=' + encodeURIComponent(scopes.join(' ')) +
            '&response_type=code' +
            '&show_dialog=true';
    }

    isAuthenticated() {
        return !!localStorage.getItem('spotify_token');
    }

    async getAccessToken(code) {
        try {
            const clientSecret = 'b0d2e4c1d0c94e0d9c9e4b0d2e4c1d0c'; // Sostituisci con il tuo client secret
            const base64Credentials = btoa(`${this.clientId}:${clientSecret}`);
            
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${base64Credentials}`
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.redirectUri
                }).toString()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to get token: ${errorData.error}`);
            }

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('spotify_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }
                return data.access_token;
            }
            throw new Error('No access token in response');
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const clientSecret = 'b0d2e4c1d0c94e0d9c9e4b0d2e4c1d0c'; // Sostituisci con il tuo client secret
        const base64Credentials = btoa(`${this.clientId}:${clientSecret}`);

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${base64Credentials}`
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }).toString()
        });

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('spotify_token', data.access_token);
            return data.access_token;
        }
        throw new Error('Failed to refresh token');
    }

    async fetchPlaylist(playlistUrl) {
        try {
            // Extract playlist ID from URL
            const playlistId = playlistUrl.split('playlist/')[1].split('?')[0];
            let token = localStorage.getItem('spotify_token');
            
            if (!token) {
                throw new Error('Not authenticated');
            }

            let response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                // Token expired, try to refresh
                try {
                    token = await this.refreshToken();
                    response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (refreshError) {
                    // If refresh fails, redirect to login
                    localStorage.removeItem('spotify_token');
                    localStorage.removeItem('spotify_refresh_token');
                    window.location.href = this.getAuthUrl();
                    return;
                }
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