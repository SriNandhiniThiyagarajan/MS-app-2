const user_dashboard = Vue.component("MusicDashboard", {
    template: `
    <div class="container mt-4">
    <main>
        <form @submit.prevent="applyFilter" class="mb-3">
            <div class="form-row align-items-center">
                <div class="col-auto">
                    <select v-model="filterType" name="filter_type" id="filter_type" class="form-control mb-2">
                        <option value="">Select Filter</option>
                        <option value="title">Title</option>
                        <option value="rating">Rating</option>
                        <option value="artist">Artist</option>
                    </select>
                </div>
                <div class="col-auto">
                    <input type="text" v-model="filterValue" name="filter_value" class="form-control mb-2" placeholder="Enter value for filter">
                </div>
                <div class="col-auto">
                    <button type="submit" class="btn btn-primary mb-2">Filter</button>
                </div>
            </div>
        </form>
        <button @click="clearFilters" class="btn btn-secondary mb-4">Clear Filters</button>

        <section v-if="filteredSongs.length > 0">
            <h2>Filtered Songs</h2>
            <div class="row">
                <div class="col-sm-6 col-md-4" v-for="song in filteredSongs" :key="song.id">
                    <div class="card song-card mb-3">
                        <img src="static/images/music_thumbnail.png" :alt="song.title + ' Thumbnail'" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">{{ song.title }}</h5>
                            <button class="btn btn-outline-primary btn-sm" @click="goToSongDetail(song.id)">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <div v-if="filterApplied && filteredSongs.length === 0" class="alert alert-info">No songs found.</div><br>

        <section>
            <h2>All Songs</h2>
            <div class="row">
                <div class="col-sm-6 col-md-4" v-for="song in allSongs" :key="song.id">
                    <div class="card song-card mb-3">
                        <img src="static/images/music_thumbnail.png" :alt="song.title + ' Thumbnail'" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">{{ song.title }}</h5>
                            <button class="btn btn-outline-primary btn-sm" @click="goToSongDetail(song.id)">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>
    `,
    data() {
        return {
            allSongs: [],
            genres: [],
            albums: [],
            filterType: '',
            filterValue: '',
            filteredSongs: [],
            filterApplied: false 
        };
    },
    created() {
        this.fetchData();
    },
    methods: {
        goToSongDetail(songId) {
            this.$router.push({ name: 'DetailSong', params: { songId: songId } });
        },
        fetchData() {
            // Fetch all songs
            fetch('/api/v2/songs')
                .then(response => response.json())
                .then(data => this.allSongs = data)
                .catch(error => console.error('Error fetching songs:', error));
        
        },
        applyFilter() {

            let query = '';
            if (!this.filterType && !this.filterValue) {
                console.log("Please enter some values in the filters!");
                return;
            }
            
            this.filterApplied = true;
        
            fetch('/api/v2/songs/filter',{method:"POST", headers:{"Content-Type": "application/json"}, 
            body: JSON.stringify(
                {filter_type: this.filterType,
                    filter_value: this.filterValue}
            )})
                .then(response => response.json())
                .then(data => this.filteredSongs = data.songs)
                .catch(error => console.error('Error applying filter:', error.message));
        },
        
        clearFilters() {
            this.filterType = '';
            this.filterValue = '';
            this.filteredSongs = [];
            this.filterApplied = false;

        }
    }
});

export default user_dashboard;
