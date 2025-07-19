const config = {
    // Replace with your Spotify API credentials
    spotify: {
        clientId: 'YOUR_SPOTIFY_CLIENT_ID',
        clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET'
    },
    // Replace with your YouTube Data API key
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
    // Add more songs as needed
]; 