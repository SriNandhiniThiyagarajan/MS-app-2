const mu = Vue.component('manage_users', {
    template: `
            <div style="padding: 20px;">
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
            <h2>User Management</h2>
            <table class="table table-striped table-hover">
                <thead class="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Active</th>
                        <th>Roles</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.active }}</td>
                        <td>{{ user.roles && user.roles.length ? user.roles.join(', ') : 'No roles' }}</td>
                        <td>
                            <button v-if="!user.is_blacklisted" @click="blacklistUser(user)" class="btn btn-warning">Blacklist</button>
                            <button v-else @click="whitelistUser(user)" class="btn btn-success">Whitelist</button>
                        </td>
                    </tr>
                </tbody>
            </table><br>

            <!-- New table for songs -->
            <div>
                <h2>Song Management</h2>
                <table class="table table-bordered table-hover">
                    <thead class="thead-light">
                        <tr>
                            <th>Title</th>
                            <th>Artist</th>
                            <th>User ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="song in songs" :key="song.id">
                            <td>{{ song.title }}</td>
                            <td>{{ song.artist }}</td>
                            <td>{{ song.user_id }}</td>
                            <td>
                                <button @click="viewSong(song.id)" class="btn btn-primary">View</button>
                                <button @click="flagSong(song)" class="btn btn-danger">Flag</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            users: [],
            successMessage: '',
            songs: [],
        };
    },
    methods: {
        async fetchSongs() {
            try {
                const response = await fetch('/api/v2/songs');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.songs = data;
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        },
        viewSong(songId) {
            this.$router.push({ name: 'DetailSong', params: { songId } });
        },
        async flagSong(song) {
            try {
                const response = await fetch(`/api/v2/flag_song/${song.id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.showSuccessMessage(`Song ${song.title} flagged successfully`);
                this.fetchSongs();
            } catch (error) {
                console.error('Error flagging song:', error);
            }
        },
        async fetchUsers() {
            try {
                const response = await fetch('/api/v2/users');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data); 
                this.users = data;
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        },
        async blacklistUser(user) {
            try {
                const response = await fetch(`/api/v2/admin/blacklist_user/${user.id}`, { method: 'PUT' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                user.is_blacklisted = true;
                this.showSuccessMessage('User successfully blacklisted');
            } catch (error) {
                console.error('Error blacklisting user:', error);
            }
        },
        async whitelistUser(user) {
            try {
                const response = await fetch(`/api/v2/admin/whitelist_user/${user.id}`, { method: 'PUT' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                user.is_blacklisted = false;
                this.showSuccessMessage('User successfully whitelisted');
            } catch (error) {
                console.error('Error whitelisting user:', error);
            }
        },
        showSuccessMessage(message) {
            this.successMessage = message;
            setTimeout(() => {
                this.successMessage = '';
            }, 3000); 
        }
    },
    created() {
        this.fetchUsers();
        this.fetchSongs(); 
    }
});

export default mu;
