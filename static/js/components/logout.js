const logout=Vue.component("logout",{
	template :`

	<div></div>	
	`,
    data(){
        return {
            message:""
        }
    },
	created(){
		const token=localStorage.getItem('auth_token');
		fetch("http://127.0.0.1:5000/api/userlog",{
			method: "GET",
			  headers: {
				"Content-Type": "application/json",
				"Authentication-Token":token
			  },})
			  .then((response)=>response.json())
			  .then((data)=>{
				console.log("success")
			  })
	},
    mounted(){
			fetch("http://127.0.0.1:5000/logout",{
				method:"POST",
				headers:{
					'Content-Type':'application/json'
				}
			})
			.then(response=>{
				if(response.status===200){
					localStorage.removeItem('auth_token');
                    
                    this.$router.push('/');
				}
			})
		
    }
})


export default logout;

