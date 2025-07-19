class SpotifyHandler {
    constructor() {
        this.accessToken = null;
        this.playlist = [];
        this.playlistDetails = null;
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
            
            // First, get playlist details
            const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            this.playlistDetails = await playlistResponse.json();
            
            // Then get all tracks with pagination
            let tracks = [];
            let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
            
            while (nextUrl) {
                const response = await fetch(nextUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });

                const data = await response.json();
                tracks = tracks.concat(data.items);
                nextUrl = data.next;
            }
            
            this.playlist = tracks.map(item => ({
                title: item.track.name,
                artist: item.track.artists[0].name,
                album: item.track.album.name,
                duration: item.track.duration_ms,
                albumArt: item.track.album.images[0]?.url,
                spotifyUrl: item.track.external_urls.spotify,
                previewUrl: item.track.preview_url
            }));

            return {
                playlist: this.playlist,
                details: {
                    name: this.playlistDetails.name,
                    description: this.playlistDetails.description,
                    owner: this.playlistDetails.owner.display_name,
                    followers: this.playlistDetails.followers.total,
                    imageUrl: this.playlistDetails.images[0]?.url,
                    tracksTotal: this.playlistDetails.tracks.total
                }
            };
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

    getPlaylistDetails() {
        return this.playlistDetails;
    }

    setFallbackPlaylist() {
        this.playlist = fallbackPlaylist;
        return {
            playlist: this.playlist,
            details: {
                name: "Fallback Playlist",
                description: "Default playlist when no Spotify playlist is provided",
                owner: "System",
                followers: 0,
                imageUrl: null,
                tracksTotal: fallbackPlaylist.length
            }
        };
    }
}

const spotifyHandler = new SpotifyHandler(); 