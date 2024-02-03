const home = Vue.component("home", {
    template: `
        <div class="home-container vh-100 d-flex align-items-center justify-content-center bg-light">
            <div class="text-center">
                <h1 class="display-3 fw-bold" style="color: #5D1049;">Aurora Daisy</h1>
                <p class="lead mt-3" style="color: #6C757D;">Explore the world of Aurora Daisy</p>
                <div class="mt-4">
                    <button class="btn btn-lg" style="background-color: #4E9F3D; color: white;" @click="goToLogin">Login</button>
                    <button class="btn btn-lg" style="background-color: #D8A47F; color: white;" @click="goToRegister">Register</button>
                </div>
            </div>
        </div>
    `,
    methods: {
        goToLogin() {
            this.$router.push('/login');
        },
        goToRegister() {
            this.$router.push('/register');
        }
    }
});

export default home;
