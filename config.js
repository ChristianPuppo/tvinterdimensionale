const config = {
    // Spotify API credentials
    spotify: {
        // Client ID from Spotify Developer Dashboard
        clientId: '7a82dcab533b4f3c8d440bb23f82c6b6'
        // Client Secret (for future authorization code flow implementation):
        // 9cf7d438efd74c3a8ec1875dc47c22b4
    },
    // YouTube Data API key (to be configured)
    youtube: {
        apiKey: 'YOUR_YOUTUBE_API_KEY'
    }
};

// Playlist fallback in case user doesn't want to use Spotify
const fallbackPlaylist = [
    {
        title: "Example Song 1",
        artist: "Artist 1"
    },
    {
        title: "Example Song 2",
        artist: "Artist 2"
    }
]; 