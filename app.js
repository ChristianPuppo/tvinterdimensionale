class VintageTVApp {
    constructor() {
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.recordingTime = 0;
        this.recordingInterval = null;

        // DOM Elements
        this.channelInfo = document.querySelector('.channel-info');
        this.recTimer = document.querySelector('.rec-timer');
        this.playlistInput = document.getElementById('playlistUrl');
        this.loadButton = document.getElementById('loadPlaylist');
        this.prevButton = document.getElementById('prevChannel');
        this.nextButton = document.getElementById('nextChannel');
        this.glitchEffect = document.querySelector('.glitch-effect');
        this.spotifyLoginButton = document.getElementById('spotifyLogin');
        this.authSection = document.getElementById('auth-section');
        this.playlistSection = document.getElementById('playlist-section');

        // Bind event listeners
        this.loadButton.addEventListener('click', () => this.loadPlaylist());
        this.prevButton.addEventListener('click', () => this.prevTrack());
        this.nextButton.addEventListener('click', () => this.nextTrack());
        this.spotifyLoginButton.addEventListener('click', () => this.handleSpotifyLogin());
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.addEventListener('videoEnded', () => this.nextTrack());
        document.addEventListener('videoError', () => this.handleVideoError());

        // Initialize
        this.initialize();
    }

    async initialize() {
        try {
            await youtubeHandler.initializePlayer();
            this.startRecordingTimer();
            
            // Check Spotify authentication
            if (spotifyHandler.isAuthenticated()) {
                this.showPlaylistControls();
            } else {
                this.showLoginButton();
            }
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateChannelInfo('ERROR - CHECK API KEYS');
        }
    }

    async handleSpotifyLogin() {
        try {
            const authUrl = await spotifyHandler.getAuthUrl();
            window.location.href = authUrl;
        } catch (error) {
            console.error('Failed to get auth URL:', error);
            this.updateChannelInfo('ERROR - AUTH FAILED');
        }
    }

    showLoginButton() {
        this.authSection.style.display = 'flex';
        this.playlistSection.style.display = 'none';
        this.updateChannelInfo('NO SIGNAL - LOGIN REQUIRED');
    }

    showPlaylistControls() {
        this.authSection.style.display = 'none';
        this.playlistSection.style.display = 'flex';
        this.updateChannelInfo('READY - ENTER PLAYLIST URL');
    }

    async loadPlaylist() {
        try {
            if (!spotifyHandler.isAuthenticated()) {
                await this.handleSpotifyLogin();
                return;
            }

            this.showGlitchEffect();
            const playlistUrl = this.playlistInput.value.trim();
            
            let playlist;
            if (playlistUrl) {
                playlist = await spotifyHandler.fetchPlaylist(playlistUrl);
            } else {
                playlist = spotifyHandler.setFallbackPlaylist();
            }

            if (playlist && playlist.length > 0) {
                this.currentTrackIndex = 0;
                await this.playCurrentTrack();
            } else {
                this.updateChannelInfo('NO SIGNAL - PLAYLIST EMPTY');
            }
        } catch (error) {
            console.error('Failed to load playlist:', error);
            if (error.message === 'Not authenticated') {
                await this.handleSpotifyLogin();
            } else {
                this.updateChannelInfo('ERROR - INVALID PLAYLIST URL');
            }
        }
    }

    async playCurrentTrack() {
        try {
            const track = spotifyHandler.getTrack(this.currentTrackIndex);
            if (!track) return;

            this.showGlitchEffect();
            this.updateChannelInfo(`CHANNEL ${this.currentTrackIndex + 1} - ${track.title}`);

            const videoId = await youtubeHandler.searchVideo(track.title, track.artist);
            await youtubeHandler.loadAndPlayVideo(videoId);
            this.isPlaying = true;
        } catch (error) {
            console.error('Failed to play track:', error);
            this.updateChannelInfo('ERROR - PLAYBACK FAILED');
        }
    }

    async prevTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            await this.playCurrentTrack();
        }
    }

    async nextTrack() {
        if (this.currentTrackIndex < spotifyHandler.getPlaylistLength() - 1) {
            this.currentTrackIndex++;
            await this.playCurrentTrack();
        } else {
            this.currentTrackIndex = 0;
            await this.playCurrentTrack();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'ArrowLeft') {
            this.prevTrack();
        } else if (event.key === 'ArrowRight') {
            this.nextTrack();
        }
    }

    handleVideoError() {
        this.updateChannelInfo('ERROR - VIDEO UNAVAILABLE');
        setTimeout(() => this.nextTrack(), 3000);
    }

    showGlitchEffect() {
        this.glitchEffect.classList.add('active');
        setTimeout(() => {
            this.glitchEffect.classList.remove('active');
        }, 300);
    }

    updateChannelInfo(text) {
        this.channelInfo.textContent = text;
    }

    startRecordingTimer() {
        this.recordingTime = 0;
        this.recordingInterval = setInterval(() => {
            this.recordingTime++;
            const hours = Math.floor(this.recordingTime / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((this.recordingTime % 3600) / 60).toString().padStart(2, '0');
            const seconds = (this.recordingTime % 60).toString().padStart(2, '0');
            this.recTimer.textContent = `${hours}:${minutes}:${seconds}`;
        }, 1000);
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VintageTVApp();
}); 