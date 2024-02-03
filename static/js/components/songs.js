const song = Vue.component('song', {
  data() {
    return {
      songs: [],
      isLoading: false,
      error: null,
      selectedAlbumId: null,
      showUpdateSongForm: false,
      successMessage :"",
      ratingSuccessMessage: '',
      updateSongForm: {
        id: null,
        title: '',
        artist: '',
        lyrics: ''
      },
      showViewSongForm: false,
      viewSongDetails: {
        id: null,
        title: '',
        artist: '',
        duration: '',
        lyrics: '',
        date_added: '',
        filename: '',
      },
      audio: new Audio(),
    };
  },
  async created() {
    const albumId = this.$route.params.albumId;
    this.selectedAlbumId = albumId;
    if (this.selectedAlbumId) {
      await this.fetchSongs();
    }
  },
  methods: {
    async fetchSongs() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/v2/songs/album/${this.selectedAlbumId}`);
        if (!response.ok) {
           throw new Error('Failed to fetch songs');
        } 
        const data = await response.json();
        this.songs = data.songs;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    showUpdateForm(song) {
      this.updateSongForm.id = song.id;
      this.updateSongForm.title = song.title;
      this.updateSongForm.artist = song.artist;
      this.updateSongForm.lyrics = song.lyrics;
      this.showUpdateSongForm = true;
    },
    async updateSong() {
      if (!this.updateSongForm.id) {
        console.error('No song ID provided for update');
        return;
      }
      
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: this.updateSongForm.title,
          artist: this.updateSongForm.artist,
          lyrics: this.updateSongForm.lyrics
        })
      };

      try {
        const response = await fetch(`/api/v2/songs/${this.updateSongForm.id}`, requestOptions);
        if (!response.ok) throw new Error('Failed to update song');
        await this.fetchSongs();
        this.showUpdateSongForm = false; 
      } catch (err) {
        console.error('Error updating song:', err);
      }
    },
    async viewSong(songId) {
      this.$router.push({ name: 'DetailSong', params: { songId: songId } });
    },

    async deleteSong(songId) {
      if (!confirm('Are you sure you want to delete this song?')) {
        return;
      }

      this.isLoading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/v2/songs/${songId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete song');

        this.successMessage = 'Song deleted successfully from the album';
        await this.fetchSongs(); 
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
  template: `
  <div class="container mt-3">
  <div class="row">
      <!-- Songs list and actions column -->
      <div class="col-md-8">
          <h1>Songs in Album</h1>
          <div v-if="isLoading" class="alert alert-info">Loading...</div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

          <table v-if="songs.length" class="table table-striped">
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
                          <button class="btn btn-primary btn-sm mr-2" @click="viewSong(song.id)">View</button>
                          <button class="btn btn-secondary btn-sm mr-2" @click="showUpdateForm(song)">Update</button>
                          <button class="btn btn-danger btn-sm" @click="deleteSong(song.id)">Delete</button>
                      </td>
                  </tr>
              </tbody>
          </table>
          <div v-if="!songs.length">No songs found.</div>
      </div>

      <!-- Update song form column -->
      <div class="col-md-4" v-if="showUpdateSongForm">
          <div class="card p-3">
              <h2>Update Song</h2>
              <form @submit.prevent="updateSong">
                  <div class="form-group">
                      <label for="title">Title:</label>
                      <input type="text" id="title" class="form-control" v-model="updateSongForm.title">
                  </div>
                  <div class="form-group">
                      <label for="artist">Artist:</label>
                      <input type="text" id="artist" class="form-control" v-model="updateSongForm.artist">
                  </div>
                  <div class="form-group">
                      <label for="lyrics">Lyrics:</label>
                      <textarea id="lyrics" class="form-control" v-model="updateSongForm.lyrics"></textarea>
                  </div>
                  <button type="submit" class="btn btn-success mr-2">Update Song</button>
                  <button type="button" class="btn btn-secondary" @click="showUpdateSongForm = false">Cancel</button>
              </form>
          </div>
      </div>
  </div>
</div>
  `
});

export default song;
