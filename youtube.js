class YouTubeHandler {
    constructor() {
        this.player = null;
        this.currentVideoId = null;
    }

    async searchVideo(title, artist) {
        try {
            const query = encodeURIComponent(`${title} ${artist} official music video`);
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${config.youtube.apiKey}`
            );
            
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                return data.items[0].id.videoId;
            }
            throw new Error('No video found');
        } catch (error) {
            console.error('Failed to search video:', error);
            throw error;
        }
    }

    initializePlayer() {
        return new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                this.createPlayer();
                resolve();
            } else {
                window.onYouTubeIframeAPIReady = () => {
                    this.createPlayer();
                    resolve();
                };
            }
        });
    }

    createPlayer() {
        this.player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: '',
            playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0
            },
            events: {
                onReady: this.onPlayerReady.bind(this),
                onStateChange: this.onPlayerStateChange.bind(this),
                onError: this.onPlayerError.bind(this)
            }
        });
    }

    onPlayerReady(event) {
        // Player is ready
        console.log('YouTube player is ready');
    }

    onPlayerStateChange(event) {
        // Handle player state changes
        if (event.data === YT.PlayerState.ENDED) {
            // Video ended, notify the main app
            document.dispatchEvent(new CustomEvent('videoEnded'));
        }
    }

    onPlayerError(event) {
        console.error('YouTube player error:', event);
        // Notify the main app about the error
        document.dispatchEvent(new CustomEvent('videoError'));
    }

    async loadAndPlayVideo(videoId) {
        if (!this.player) {
            await this.initializePlayer();
        }

        this.currentVideoId = videoId;
        this.player.loadVideoById(videoId);
    }

    pauseVideo() {
        if (this.player) {
            this.player.pauseVideo();
        }
    }

    resumeVideo() {
        if (this.player) {
            this.player.playVideo();
        }
    }
}

const youtubeHandler = new YouTubeHandler(); 