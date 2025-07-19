const config = {
    // Replace with your Spotify API credentials
    spotify: {
        clientId: '7a82dcab533b4f3c8d440bb23f82c6b6'
    },
    // Replace with your YouTube Data API key
    youtube: {
        apiKey: 'YOUR_YOUTUBE_API_KEY' // Configureremo questo dopo
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