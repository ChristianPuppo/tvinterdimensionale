class VintageTVApp {
    constructor() {
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.recordingTime = 0;
        this.recordingInterval = null;
        this.playlistData = null;

        // DOM Elements
        this.channelInfo = document.querySelector('.channel-info');
        this.recTimer = document.querySelector('.rec-timer');
        this.playlistInput = document.getElementById('playlistUrl');
        this.loadButton = document.getElementById('loadPlaylist');
        this.prevButton = document.getElementById('prevChannel');
        this.nextButton = document.getElementById('nextChannel');
        this.glitchEffect = document.querySelector('.glitch-effect');

        // Bind event listeners
        this.loadButton.addEventListener('click', () => this.loadPlaylist());
        this.prevButton.addEventListener('click', () => this.prevTrack());
        this.nextButton.addEventListener('click', () => this.nextTrack());
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.addEventListener('videoEnded', () => this.nextTrack());
        document.addEventListener('videoError', () => this.handleVideoError());

        // Initialize
        this.initialize();
    }

    async initialize() {
        try {
            await spotifyHandler.initialize();
            await youtubeHandler.initializePlayer();
            this.startRecordingTimer();
            this.updateChannelInfo('CHANNEL 0 - INSERT PLAYLIST URL');
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateChannelInfo('ERROR - CHECK API KEYS');
        }
    }

    async loadPlaylist() {
        try {
            this.showGlitchEffect();
            const playlistUrl = this.playlistInput.value.trim();
            
            let playlistData;
            if (playlistUrl) {
                playlistData = await spotifyHandler.fetchPlaylist(playlistUrl);
            } else {
                playlistData = spotifyHandler.setFallbackPlaylist();
            }

            if (playlistData.playlist && playlistData.playlist.length > 0) {
                this.playlistData = playlistData;
                this.currentTrackIndex = 0;
                this.updateChannelInfo(`LOADING: ${playlistData.details.name}`);
                await this.playCurrentTrack();
            } else {
                this.updateChannelInfo('NO SIGNAL - PLAYLIST EMPTY');
            }
        } catch (error) {
            console.error('Failed to load playlist:', error);
            this.updateChannelInfo('ERROR - INVALID PLAYLIST URL');
        }
    }

    async playCurrentTrack() {
        try {
            const track = spotifyHandler.getTrack(this.currentTrackIndex);
            if (!track) return;

            this.showGlitchEffect();
            
            // Update channel info with track details
            const channelText = `CH${this.currentTrackIndex + 1} - ${track.title}`;
            this.updateChannelInfo(channelText);

            // Show album art if available (you might want to add an element for this)
            if (track.albumArt) {
                // You could add an img element and update its src here
                console.log('Album art:', track.albumArt);
            }

            const videoId = await youtubeHandler.searchVideo(track.title, track.artist);
            await youtubeHandler.loadAndPlayVideo(videoId);
            this.isPlaying = true;

            // Update document title
            document.title = `${track.title} - ${track.artist} | Vintage TV`;
        } catch (error) {
            console.error('Failed to play track:', error);
            this.updateChannelInfo('ERROR - PLAYBACK FAILED');
            setTimeout(() => this.nextTrack(), 3000);
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