const PlaylistDetails = Vue.component('playlist-details', {
    data() {
        return {
            songs: [],
            allSongs: [], 
            selectedSongs: [], 
            showAddSongModal: false, 
            removalMessage: '',
            additionMessage: '',

        };
    },
    async created() {
        const playlistId = this.$route.params.id;
        try {
            const response = await fetch(`/api/v2/playlists/${playlistId}/songs`);
            if (!response.ok) {
                throw new Error('Failed to fetch songs');
            }
            const data = await response.json();
            this.songs = data.songs;
        } catch (error) {
            console.error(error.message);
        }
        this.fetchAllSongs();

    },
    methods: {
        async fetchAllSongs() {
            try {
                const response = await fetch('/api/v2/songs');
                if (!response.ok) {
                    throw new Error('Failed to fetch songs');
                }
                const data = await response.json();
                this.allSongs = data;
            } catch (error) {
                console.log(error.message);
            }
        },
        async fetchPlaylistSongs() {
            const playlistId = this.$route.params.id;
            try {
                const response = await fetch(`/api/v2/playlists/${playlistId}/songs`);
                if (!response.ok) {
                    throw new Error('Failed to fetch songs');
                }
                const data = await response.json();
                this.songs = data.songs;
            } catch (error) {
                console.error(error.message);
            }
        },
        toggleAddSongModal() {
            this.showAddSongModal = !this.showAddSongModal;
        },
        handleSongSelection(songId) {
            const index = this.selectedSongs.indexOf(songId);
            if (index > -1) {
                this.selectedSongs.splice(index, 1); 
            } else {
                this.selectedSongs.push(songId); 
            }
            console.log(this.selectedSongs);
        },
        async submitSelectedSongs() {
            const playlistId = this.$route.params.id;
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ song_ids: this.selectedSongs }),
                };
                const response = await fetch(`/api/v2/playlists/${playlistId}/songs`, requestOptions);
                if (!response.ok) {
                    throw new Error('Failed to add songs to playlist');
                }
                this.additionMessage = 'Songs added to the playlist';
                setTimeout(() => {
                    this.additionMessage = '';
                }, 3000);
    
                this.toggleAddSongModal();
                await this.fetchPlaylistSongs(); 
            } catch (error) {
                console.error(error.message);
            }
        },
        async removeSong(songId) {
            const playlistId = this.$route.params.id;
            try {
                const response = await fetch(`/api/v2/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to remove song from playlist');
                }
                this.removalMessage = 'Song removed from the playlist';
                setTimeout(() => {
                    this.removalMessage = '';
                }, 3000); 
    
                await this.fetchPlaylistSongs(); 
            } catch (error) {
                console.error(error.message);
            }
        },
        viewSong(songId) {
            this.$router.push({ name: 'DetailSong', params: { songId: songId } });
        },
    },
    template: `
        <div class="container mt-3">
            <div class="row">
                <div class="col-md-8">
                    <div v-if="additionMessage" class="alert alert-success">{{ additionMessage }}</div>
                    <div v-if="removalMessage" class="alert alert-warning">{{ removalMessage }}</div>

                    <h2>Songs in Playlist</h2>
                    <table v-if="songs.length" class="table table-hover">
                        <thead>
                            <tr>
                                <th>Song Title</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="song in songs" :key="song.id">
                                <td>{{ song.title }}</td>
                                <td>
                                    <button class="btn btn-info btn-sm mr-2" @click="viewSong(song.id)">View Song</button>
                                    <button class="btn btn-danger btn-sm" @click="removeSong(song.id)">Remove</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="!songs.length">No songs found in this playlist.</div>
                    <button class="btn btn-primary" @click="toggleAddSongModal">Add Song</button>
                </div>

                <div class="col-md-4" v-if="showAddSongModal">
                    <div class="card p-3">
                        <h3>Select Songs to Add</h3>
                        <div v-for="song in allSongs" :key="song.id" class="form-check">
                            <input class="form-check-input" type="checkbox" :id="'song-' + song.id" :value="song.id" @change="handleSongSelection(song.id)">
                            <label class="form-check-label" :for="'song-' + song.id">{{ song.title }}</label>
                        </div>
                        <button class="btn btn-success mt-2" @click="submitSelectedSongs">Add Selected Songs</button>
                        <button class="btn btn-secondary mt-2" @click="toggleAddSongModal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `
});

export default PlaylistDetails;
