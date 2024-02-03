const creatorDashboard = Vue.component('creator-dashboard', {
    data() {
        return {
          isCreator: false,
          isBlacklisted: false, 
          albumCount: 0,
          songCount: 0,
          isWaiting: false
        };
    },
    created() {
      this.checkCreatorStatus();      
    },
    methods: {
      async checkCreatorStatus() {
        try {
            const response = await fetch('/check_creator_status');
            const data = await response.json();
            this.isCreator = data.isCreator;
            this.isBlacklisted = data.isBlacklisted;
            this.fetchCreatorData(); 
        } catch (error) {
            console.error('Error checking creator status:', error);
            this.isCreator = false;
            this.isBlacklisted = false;
        }
    },
    async fetchCreatorData() {
        console.log('fetchCreatorData called');
        if (!this.isCreator || this.isBlacklisted) {
            console.log('Exiting fetchCreatorData: isCreator or isBlacklisted is false');
            return;
        }
        console.log('isCreator:', this.isCreator, 'isBlacklisted:', this.isBlacklisted);
        try {
            const response = await fetch('/api/creator');
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            console.log(data);
            this.albumCount = data.album_count; 
            this.songCount = data.song_count;
        } catch (error) {
            console.error('Error fetching creator data:', error);
        }
    },
      async registerAsCreator() {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.error('No auth token found');
            return {'message' : 'please login'}; 
          }
      
          const response = await fetch('/api/v2/register_as_creator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization':  token, 
            }
          });
      
          const data = await response.json();
          if (response.ok && data.message) {
            this.isCreator = true;
            this.fetchCreatorData();
          } else {
            console.error('Error registering as creator:', data);
          }
        } catch (error) {
          console.error('Error registering as creator:', error);
        }
      },
      async downloadResource() {
        this.isWaiting = true
        const res = await fetch('/download-csv')
        const data = await res.json()
        console.log(data)
        if (res.ok) {
          const taskId = data['task_id']
          const intv = setInterval(async () => {
            const csv_res = await fetch(`/get-csv/${taskId}`)
            if (csv_res.ok) {
              this.isWaiting = false
              clearInterval(intv)
              window.location.href = `/get-csv/${taskId}`
            }
          }, 1000)
        }
      }
    },
    template: `
    <div class="container mt-4">
    <div v-if="isBlacklisted" class="alert alert-warning" role="alert">
        <h1>Account Blocked</h1>
        <p>Your creator account is blocked. Please contact the admin.</p>
    </div>

    <div v-else-if="isCreator" class="card p-4">
        <h1>Creator Dashboard</h1>
        <p class="lead">Total Albums: {{ albumCount }}</p>
        <p class="lead">Total Songs: {{ songCount }}</p>
        <router-link to="/albums" class="btn btn-primary mr-2">Manage Albums</router-link><br>
        <button @click="downloadResource" class="btn btn-secondary">Download</button>
    </div>

    <div v-else class="jumbotron">
        <h1>Become a Creator</h1>
        <p>To create albums and songs, please register as a creator.</p>
        <button @click="registerAsCreator" class="btn btn-success">Register as Creator</button>
    </div>
</div>
    `
  });
  
  export default creatorDashboard;
  