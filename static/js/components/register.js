const register = Vue.component('register',{
    template: `
    <div class="custom-form-container">
    <form @submit.prevent="register" class="card-body">
        <h2 class="text-center mb-4">Register</h2>
        <div class="form-group mb-3">
            <label for="username">Username</label>
            <input type="text" id="username" v-model="username" class="form-control" placeholder="Enter your username" required>
        </div>
        <div class="form-group mb-3">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" class="form-control" placeholder="Enter your email" required>
        </div>
        <div class="form-group mb-4">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" class="form-control" placeholder="Enter your password" required>
        </div>
        <button type="submit" class="btn btn-primary custom-button">Register</button>
        <p v-if="errorMessage" class="mt-3 text-danger">{{ errorMessage }}</p>
        <p class="mt-3">Already a user? <a href="#" @click="goToLogin">Login here</a></p>
    </form>
</div>
    `,
    data() {
      return {
        username: '',
        email: '',
        password: '',
        errorMessage: ''
      };
    },
    methods: {
      goToLogin() {
        this.$router.push('/login');
      },
      register() {
        const data = {
          username: this.username,
          email: this.email,
          password: this.password
        };
  
        fetch('http://127.0.0.1:5000/api/v2/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then(response => {
          if (response.ok) {
            this.$router.push('/login');
          } else {
            return response.json();
          }
        })
        .then(data => {
          if (data && data.message) {
            this.errorMessage = data.message;
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    },

});

export default register;