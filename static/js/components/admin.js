const admin = Vue.component('admin', {
    data() {
      return {
        normalUserCount: 0,
        creatorCount: 0,
        trackCount: 0,
        genreCount: 0,
        albumCount: 0,
        newGenreName: '',
        flashMessages: []
      };
    },
    methods: {
      async fetchCounts() {
        this.clearFlashMessages();
        try {
          const response = await fetch('http://localhost:5000/api/admin_dashboard');
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          const data = await response.json();
          this.normalUserCount = data.normal_user_count;
          this.creatorCount = data.creator_count;
          this.trackCount = data.track_count;
          this.genreCount = data.genre_count;
          this.albumCount = data.album_count;
        } catch (error) {
          console.error(error);
          this.flashMessages.push('Error fetching data: ' + error.message);
        }
      },
      async addGenre() {
        this.clearFlashMessages();
        try {
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.newGenreName })
          };
    
          const response = await fetch('http://localhost:5000/api/v2/add_genre', requestOptions);
          const responseData = await response.json();
          if (!response.ok) {
            throw new Error(responseData.message);
          }
          this.flashMessages.push(responseData.message);
          setTimeout(() => {
            this.flashMessages = [];
          }, 3000);
    
          this.newGenreName = '';
          await this.fetchCounts();
        } catch (error) {
          console.error(error);
          this.flashMessages.push(error.message);
          setTimeout(() => {
            this.flashMessages = [];
          }, 3000);
        }
      },
      clearFlashMessages() {
        this.flashMessages = [];
      }
    },
    created() {
      this.fetchCounts();
    },
    template: `
      <div style="margin: 20px;">
        <div>
          <h1 style="margin-bottom: 20px;">Admin Dashboard</h1>
          <ul class="list-group">
            <li class="list-group-item">Number of Normal Users: {{ normalUserCount }}</li>
            <li class="list-group-item">Number of Creators: {{ creatorCount }}</li>
            <li class="list-group-item">Number of Tracks: {{ trackCount }}</li>
            <li class="list-group-item">Number of Genres: {{ genreCount }}</li>
            <li class="list-group-item">Number of Albums: {{ albumCount }}</li>
          </ul>

          <h2 style="margin-top: 20px;">Add New Genre</h2>
          <div v-if="flashMessages.length" class="flash-messages">
            <div v-for="(message, index) in flashMessages" :key="index" class="alert alert-info">
              {{ message }}
            </div>
          </div>
          <form @submit.prevent="addGenre">
            <div class="form-group">
              <label for="genre-name">Genre Name:</label>
              <input type="text" class="form-control" id="genre-name" v-model="newGenreName" required>
            </div><br>
            <button type="submit" class="btn btn-primary">Add Genre</button>
          </form>
        </div>
      </div>`
  });
  
  export default admin;
  