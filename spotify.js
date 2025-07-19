class SpotifyHandler {
    constructor() {
        this.playlist = [];
        this.clientId = '7a82dcab533b4f3c8d440bb23f82c6b6';
        this.redirectUri = 'https://tvinterdimensionale-5wnf1jt0p-christians-projects-524bbc11.vercel.app/callback.html';
        console.log('SpotifyHandler initialized with:', {
            clientId: this.clientId,
            redirectUri: this.redirectUri
        });
    }

    getAuthUrl() {
        const scopes = ['playlist-read-private', 'playlist-read-collaborative'];
        const authUrl = 'https://accounts.spotify.com/authorize' +
            '?client_id=' + encodeURIComponent(this.clientId) +
            '&redirect_uri=' + encodeURIComponent(this.redirectUri) +
            '&scope=' + encodeURIComponent(scopes.join(' ')) +
            '&response_type=code' +
            '&show_dialog=true';
        
        console.log('Generated auth URL:', authUrl);
        return authUrl;
    }

    isAuthenticated() {
        const token = localStorage.getItem('spotify_token');
        console.log('Checking authentication:', { isAuthenticated: !!token });
        return !!token;
    }

    async getAccessToken(code) {
        console.log('Getting access token for code:', code);
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.redirectUri,
                    client_id: this.clientId
                }).toString()
            });

            console.log('Token response status:', response.status);
            const data = await response.json();
            console.log('Token response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get token');
            }

            if (data.access_token) {
                localStorage.setItem('spotify_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }
                console.log('Successfully stored tokens');
                return data.access_token;
            }
            throw new Error('No access token in response');
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    }

    async refreshToken() {
        console.log('Attempting to refresh token');
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.clientId
            }).toString()
        });

        const data = await response.json();
        console.log('Refresh token response:', data);

        if (data.access_token) {
            localStorage.setItem('spotify_token', data.access_token);
            return data.access_token;
        }
        throw new Error('Failed to refresh token');
    }

    async fetchPlaylist(playlistUrl) {
        try {
            console.log('Fetching playlist:', playlistUrl);
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

            console.log('Playlist response status:', response.status);

            if (response.status === 401) {
                console.log('Token expired, attempting refresh');
                try {
                    token = await this.refreshToken();
                    response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (refreshError) {
                    console.error('Refresh failed:', refreshError);
                    localStorage.removeItem('spotify_token');
                    localStorage.removeItem('spotify_refresh_token');
                    window.location.href = this.getAuthUrl();
                    return;
                }
            }

            const data = await response.json();
            console.log('Playlist data received:', data);
            
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

// Create the handler instance and expose it globally for debugging
const spotifyHandler = new SpotifyHandler();
window.spotifyHandler = spotifyHandler; // For debugging in console 