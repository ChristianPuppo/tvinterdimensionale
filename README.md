# Vintage TV Music Player

A retro-styled web application that plays YouTube music videos from your Spotify playlists, simulating a vintage TV experience.

## Features

- Vintage TV interface with CRT and VHS effects
- Spotify playlist integration
- Automatic YouTube video search and playback
- Channel switching with retro effects
- Recording timer display
- Keyboard controls (← → arrows)
- Fallback playlist support

## Setup

1. Clone the repository:
```bash
git clone https://github.com/christianpuppo/tvinterdimensionale.git
cd tvinterdimensionale
```

2. Configure API Keys:
   - Get your Spotify API credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Get your YouTube Data API key from [Google Cloud Console](https://console.cloud.google.com)
   - Update `config.js` with your API keys

3. Open `index.html` in a modern web browser

## Usage

1. Enter a public Spotify playlist URL
2. Click "Load Playlist"
3. Use "Channel +" and "Channel -" buttons or keyboard arrows to navigate
4. Enjoy the retro TV experience!

## Environment Variables

Create a `.env` file in the root directory with:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 