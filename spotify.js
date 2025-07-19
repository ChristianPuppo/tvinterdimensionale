class SpotifyHandler {
    constructor() {
        this.accessToken = null;
        this.playlist = [];
    }

    async initialize() {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(config.spotify.clientId + ':' + config.spotify.clientSecret)
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            this.accessToken = data.access_token;
        } catch (error) {
            console.error('Failed to initialize Spotify:', error);
            throw error;
        }
    }

    async fetchPlaylist(playlistUrl) {
        try {
            // Extract playlist ID from URL
            const playlistId = playlistUrl.split('playlist/')[1].split('?')[0];
            
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

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