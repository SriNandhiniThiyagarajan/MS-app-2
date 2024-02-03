const DetailSong = Vue.component('DetailSong', {
    data() {
        return {
            error: '', 
            ratingSuccessMessage: '',
            viewSongDetails: {
                id: null,
                title: '',
                artist: '',
                duration: '',
                lyrics: '',
                date_added: '',
                filename: '',
                average_rating: '', 
            },
            audio: new Audio(),
        };
    },
    methods : {
        playSong() {
            if (this.viewSongDetails.filename) {
                this.audio.src = `/static/audios/${this.viewSongDetails.filename}`;
                this.audio.play().catch(e => {
                    console.error('Error playing the song:', e);
                    this.error = 'Error playing the song';
                });
            }
        },
        stopSong() {
            this.audio.pause();
            this.audio.currentTime = 0;
        },
        async rateSong(rating) {
            if (!this.viewSongDetails.id || !rating) {
                console.error('No song ID or rating provided');
                return;
            }
      
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: rating })
            };
      
            try {
                const response = await fetch(`/api/v2/rate/songs/${this.viewSongDetails.id}`, requestOptions);
                if (!response.ok) throw new Error('Failed to submit rating');
      
                this.ratingSuccessMessage = 'Rating submitted successfully';
                setTimeout(() => this.ratingSuccessMessage = '', 3000);
                await this.fetchSongDetails(); 
            } catch (err) {
                this.error = err.message;
            }
        },
        async fetchSongDetails() {
            try {
                const songId = this.$route.params.songId;
                const response = await fetch(`/api/v2/songs/${songId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch song details');
                }
                this.viewSongDetails = await response.json();
            } catch (error) {
                console.error('Error:', error.message);
                this.error = error.message;
            }
        }
    },
    async created() {
        await this.fetchSongDetails();
    },
    template : `
        <div class="container mt-3">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="ratingSuccessMessage" class="alert alert-success">{{ ratingSuccessMessage }}</div>

            <h2>Song Details</h2>
            <p><strong>Title:</strong> {{ viewSongDetails.title }}</p>
            <p><strong>Artist:</strong> {{ viewSongDetails.artist }}</p>
            <p><strong>Duration:</strong> {{ viewSongDetails.duration }} min</p>
            <p><strong>Lyrics:</strong> {{ viewSongDetails.lyrics }}</p>
            <p><strong>Average Rating:</strong> {{ viewSongDetails.average_rating }}</p>

            <button type="button" class="btn btn-primary mr-2" @click="playSong">Play Song</button>
            <button type="button" class="btn btn-secondary" @click="stopSong">Stop Song</button>

            <div class="mt-4">
                <label for="rating" class="form-label">Rate this Song:</label>
                <select id="rating" class="form-select" @change="rateSong($event.target.value)">
                    <option value="">Select a rating</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>
        </div>`
});

export default DetailSong;
