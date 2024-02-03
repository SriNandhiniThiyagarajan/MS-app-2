const login = Vue.component("login", {
    template: `
        <div class="custom-form-container">
            <form @submit.prevent="login" class="card-body">
                <h2 class="text-center mb-4">Login</h2>
                <div v-if="showMessage" class="alert alert-danger">{{ message }}</div>
                <div class="form-group mb-3">
                    <label for="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        v-model="username"
                        class="form-control"
                        placeholder="Enter your username"
                        required
                    />
                </div>
                <div class="form-group mb-4">
                    <label for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        v-model="password"
                        class="form-control"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button type="submit" class="btn btn-primary custom-button">Login</button>
                <p class="mt-3">Not a user? <a href="#" @click="goToregister">Register here</a></p>
            </form>
        </div>
    `,

    data() {
        return {
            username: "",
            password: "",
            showMessage: false,
            message: "",
        };
    },

    methods: {
        goToregister() {
            this.$router.push('/register');
        },
        login() {
            const payload = {
                username: this.username,
                password: this.password
            };
    
            fetch("http://127.0.0.1:5000/api/v2/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Invalid Username/Password");
                }
            })
            .then(data => {
                if (data && data.auth_token) {  
                    localStorage.setItem('auth_token', data.auth_token);
                    this.$router.push('/');
                }
            })
            .catch(error => {
                this.showMessage = true; 
                this.message = error.message; 
                console.error("Login error:", error);
            });
        }
    }
});

export default login;
