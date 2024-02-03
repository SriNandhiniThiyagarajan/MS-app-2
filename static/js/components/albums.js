const albums = Vue.component('albums', {
  data() {
    return {
      albums: [],
      isLoading: false,
      error: null,
      showAlbumForm: false,
      genres: [],
      albumForm: {
        id: null,
        name: '',
        genre_id: null,
      },
      showSongForm: false,
      currentAlbumId: null,
      songForm: {
        title: '',
        artist: '',
        lyrics: '',
        file: null
      },
    };
  },
  async created() {
    await this.fetchAlbums();
    await this.fetchGenres();
  },
  methods: {
    createNewAlbum() {
      this.albumForm = { id: null, name: '', genre_id: null };
      this.showAlbumForm = true;
    },
    async fetchGenres() {
      try {
        const response = await fetch('/api/v2/genres', {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('auth_token')
          }
        });
        if (!response.ok) throw new Error('Failed to fetch genres');
        this.genres = await response.json();
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    },
    async fetchAlbums() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await fetch('/api/v2/user_albums', {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('auth_token')
          }
        });
        if (!response.ok) throw new Error('Failed to fetch albums');
        this.albums = await response.json();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteAlbum(albumId) {
      try {
        const response = await fetch(`/api/v2/albums/${albumId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': localStorage.getItem('auth_token'),
          }
        });

        if (!response.ok) throw new Error('Failed to delete album');
        this.albums = this.albums.filter(album => album.id !== albumId);
      } catch (error) {
        console.error('Error deleting album:', error);
      }
    },
    openSongForm(albumId) {
      this.currentAlbumId = albumId;
      this.songForm = { title: '', artist: '', lyrics: '', file: null };
      this.showSongForm = true;
    },
    async addSongToAlbum() {
      let formData = new FormData();
      formData.append('title', this.songForm.title);
      formData.append('artist', this.songForm.artist);
      formData.append('lyrics', this.songForm.lyrics);
      formData.append('file', this.songForm.file);
      try {
        const response = await fetch(`/api/v2/albums/${this.currentAlbumId}/songs`, {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('auth_token'),
          },
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload song');

        this.showSongForm = false;
      } catch (error) {
        console.error('Error uploading song:', error);
      }
    },
    handleFileChange(event) {
      this.songForm.file = event.target.files[0];
    },
    updateAlbum(albumId) {
      const album = this.albums.find(a => a.id === albumId);
      if (album) {
        this.albumForm = { ...album };
        this.showAlbumForm = true;
      } else {
        console.error('Album not found');
      }
    },


    openAlbumForm(album = null) {
      if (album) {
        this.albumForm = { ...album };
      } else {
        this.albumForm = { id: null, name: '', genre_id: null };
      }
      this.showAlbumForm = true;
    },
    async submitAlbumForm() {
  
     
      try {
        
  
        const response = await fetch(
          this.albumForm.id? `/api/v2/albums/${this.albumForm.id}` : '/api/v2/albums' , 
          {
          method: this.albumForm.id? 'PUT' : 'POST',
          headers: {
            'Authorization': localStorage.getItem('auth_token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({...this.albumForm})
        });

        if (!response.ok) throw new Error('Failed to submit album');

        await this.fetchAlbums();
        this.showAlbumForm = false;
      } catch (error) {
        console.error('Error submitting album:', error);
      }
    },

    closeAlbumForm() {
      this.showAlbumForm = false;
    },
    navigateToSongs(albumId) {
      this.$router.push({ name: 'songs', params: { albumId: albumId } });
    },
  },

  template: `
  <div class="container">
  <h1>My Albums</h1>
  <button class="btn btn-primary mb-3" @click="createNewAlbum">Add New Album</button>

  <div class="row">
    <div class="col-lg-9">
      <div v-if="isLoading">Loading...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <table v-if="albums.length" class="table table-responsive">
        <thead>
          <tr>
            <th>Album Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="album in albums" :key="album.id">
            <td @click="navigateToSongs(album.id)">{{ album.name }}</td>
            <td>
              <button class="btn btn-info btn-sm mr-2" @click="updateAlbum(album.id)">Update</button>
              <button class="btn btn-danger btn-sm mr-2" @click="deleteAlbum(album.id)">Delete</button>
              <button class="btn btn-secondary btn-sm" @click="openSongForm(album.id)">Add Song</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!albums.length">No albums found.</div>
    </div>

    <div class="col-lg-3">
      <div v-if="showAlbumForm" class="mb-4">
        <h4>Add/Edit Album</h4>
        <form @submit.prevent="submitAlbumForm">
          <input type="text" class="form-control mb-2" v-model="albumForm.name" placeholder="Album Name">
          <select class="form-control mb-2" v-model="albumForm.genre_id">
            <option disabled value="">Select a Genre</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
          </select>
          <button type="submit" class="btn btn-success btn-block">Submit</button>
          <button class="btn btn-secondary btn-block" @click="closeAlbumForm">Cancel</button>
        </form>
      </div>

      <div v-if="showSongForm">
        <h4>Add Song</h4>
        <form @submit.prevent="addSongToAlbum">
          <input type="text" class="form-control mb-2" v-model="songForm.title" placeholder="Song Title">
          <input type="text" class="form-control mb-2" v-model="songForm.artist" placeholder="Artist">
          <textarea class="form-control mb-2" v-model="songForm.lyrics" placeholder="Lyrics"></textarea>
          <input type="file" class="form-control mb-2" @change="handleFileChange">
          <button type="submit" class="btn btn-success btn-block">Upload Song</button>
          <button class="btn btn-secondary btn-block" @click="showSongForm = false">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</div>
    `
  });

export default albums;
