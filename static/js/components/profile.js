const UserProfile = Vue.component("UserProfile", {
    template: `
    <div class="container">
        <h2>Edit Profile</h2>
        <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>
        <form @submit.prevent="updateProfile">
            <div class="mb-3">
                <label for="username" class="form-label">Username:</label>
                <input type="text" class="form-control" id="username" v-model="user.username" value="user.username" required>
                </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password (leave blank if you don't want to change it):</label>
                <input type="password" class="form-control" id="password" v-model="user.password">
            </div>
            <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
    </div>
    `,
    data() {
        return {
            user: {
                username: '',
                password: ''
            },
            message: "",
            isSuccess: false
        };
    },
    created() {
        this.fetchUserProfile();
    },
    methods: {
        async fetchUserProfile() {
            const token = localStorage.getItem('auth_token');
            const res=await fetch("/api/v2/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":  token
                },
            })
            const data =await res.json()
            if (res.ok){
                if (data.username) {
                    console.log('User profile:', data);
                    this.user.username = data.username;
                    // Email is not editable, so it's not included in the user object
                }
            }
            else{
                console.log('Error fetching user profile:', data);
                this.message = data.message || "Error fetching user profile";
                this.isSuccess = false;
            }
            
        },
        updateProfile() {
            const token = localStorage.getItem('auth_token');
            fetch("/api/v2/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":  token
                },
                body: JSON.stringify(this.user)
            })
            .then(response => {
                if (response.ok) {
                    this.message = "Profile updated successfully";
                    this.isSuccess = true;
                } else {
                    response.json().then(data => {
                        this.message = data.message || "Error updating profile";
                        this.isSuccess = false;
                    });
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                this.message = "Error updating profile";
                this.isSuccess = false;
            });
        }
    }
});

export default UserProfile;
