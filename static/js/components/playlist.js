const playlist = Vue.component('playlist', {
  data() {
    return {
      playlists: [],
      showPlaylistForm: false,
      playlistForm: {
        name: ''
      },
      isUpdateMode: false,
      activePlaylistId: null,
      notificationMessage: '',
      songs: [],
      showSongsTable: false,
    };
  },
   created() {
      this.fetchPlaylists();
    },
   methods: {
     async fetchPlaylists() {
       try {
        const requestOptions = {
          headers: {
            'Authorization': localStorage.getItem('auth_token') 
          }
        };
        const response = await fetch('/api/v2/playlists/user', requestOptions);
         const data = await response.json();
         this.playlists = data.playlists;
       } catch (error) {
         console.error(error);
       }
     },
      async viewPlaylist(id) {
        this.$router.push({ name: 'PlaylistDetails', params: { id: id } });
      },
     async updatePlaylist(id) {
      const playlist = this.playlists.find((p) => p.id === id);
      this.playlistForm.name = playlist.name;
      this.activePlaylistId = id;
      this.isUpdateMode = true;
      this.showPlaylistForm = true;
    },
    async deletePlaylist(id) {
      const isConfirmed = confirm('Are you sure you want to delete this playlist?');
      if (!isConfirmed) {
        return; 
      }
    
      try {
        const requestOptions = {
          method: 'DELETE',
          headers: {
            'Authorization': localStorage.getItem('auth_token') 
          }
        };
        const response = await fetch(`/api/v2/playlists/${id}`, requestOptions);
        if (!response.ok) {
          throw new Error('Failed to delete playlist');
        }
        await this.fetchPlaylists();
        this.notificationMessage = 'Playlist deleted successfully.';
        setTimeout(() => this.notificationMessage = '', 3000); 
      } catch (error) {
        console.error('Error deleting playlist:', error.message);
        this.notificationMessage = 'Error deleting playlist.';
        setTimeout(() => this.notificationMessage = '', 3000);
      }
    },
    
    createPlaylist() {
      this.resetForm();
      this.showPlaylistForm = true;
    },
    async submitPlaylistForm() {
      const url = this.isUpdateMode ? `/api/v2/playlists/${this.activePlaylistId}` : '/api/v2/playlists';
      const method = this.isUpdateMode ? 'PUT' : 'POST';

      try {
        const requestOptions = {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          'Authorization': localStorage.getItem('auth_token') ,
          body: JSON.stringify(this.playlistForm),
        };
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
          throw new Error(`Failed to ${this.isUpdateMode ? 'update' : 'create'} playlist`);
        }
        this.resetForm(); 
        await this.fetchPlaylists(); 

        this.notificationMessage = `Playlist ${this.isUpdateMode ? 'updated' : 'created'} successfully.`;
        setTimeout(() => this.notificationMessage = '', 3000); 
      } catch (error) {
        console.error(error.message);
        this.notificationMessage = `Error ${this.isUpdateMode ? 'updating' : 'creating'} playlist.`;
        setTimeout(() => this.notificationMessage = '', 3000);
      }
    },
    resetForm() {
      this.showPlaylistForm = false;
      this.isUpdateMode = false;
      this.activePlaylistId = null;
      this.playlistForm = { name: '' };
    },
  },
   template: `
      <div class="container mt-4">
        <div v-if="notificationMessage" class="alert alert-info">{{ notificationMessage }}</div>

        <table v-if="playlists.length" class="table table-bordered table-hover">
            <thead class="thead-dark">
                <tr>
                    <th>Playlist Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="playlist in playlists" :key="playlist.id">
                    <td>{{ playlist.name }}</td>
                    <td>
                        <button class="btn btn-primary btn-sm mr-2" @click="viewPlaylist(playlist.id)">View</button>
                        <button class="btn btn-secondary btn-sm mr-2" @click="updatePlaylist(playlist.id)">Update</button>
                        <button class="btn btn-danger btn-sm" @click="deletePlaylist(playlist.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="!playlists.length">No playlists found.</div>

        <button class="btn btn-success mt-3" @click="showPlaylistForm = true">Create New Playlist</button>

        <div v-if="showPlaylistForm" class="mt-3">
            <form @submit.prevent="submitPlaylistForm">
                <input type="text" class="form-control mb-2" v-model="playlistForm.name" placeholder="Playlist Name">
                <button type="submit" class="btn btn-primary">Submit</button>
                <button class="btn btn-secondary" @click="showPlaylistForm = false">Cancel</button>
            </form>
        </div>
      </div>

     
  </div>
   `
 });
 
 export default playlist;
 

