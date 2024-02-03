import home from "./components/home.js";
import login from "./components/login.js";
import logout from "./components/logout.js";
import register from "./components/register.js";
import UserProfile from "./components/profile.js";
import user_dashboard from "./components/userdashboard.js";
import creatorDashboard from "./components/creator_dashboard.js";
import albums from "./components/albums.js";
import songs from "./components/songs.js";
import playlist from "./components/playlist.js";
import PlaylistDetails from "./components/playlist_details.js";
import DetailSong from "./components/DetailSong.js";
import admin from "./components/admin.js";
import mu from "./components/manage_user.js";
import Pagenotfound from "./components/Pagenotfound.js";

const routes = [
    { path: '/',component:home ,name :'home' },
    { path: '/login', component: login, name: 'login' },
    { path: '/logout', component: logout, name: 'logout' },
    { path: '/register', component: register, name: 'register' },
    {path: '/profile', component: UserProfile, name :'profile'},
    { path: '/dashboard', component: user_dashboard, name :'dashboard'} ,
    {path : '/creator',component:creatorDashboard,name:'creatorDashboard'} ,
    {path : '/albums',component:albums,name:'albums'} ,
    {path:'/songs' ,component:songs,name:'songs'} ,
    {path:'/playlist',component:playlist,name:'playlist'} ,
    { path: '/playlist/:id',name: 'PlaylistDetails', component: PlaylistDetails},
    {path: '/detail-song/:songId',name: 'DetailSong',component: DetailSong},
    {path : '/admin',component:admin,name:'admin'} ,
    {path : '/manage-users',component:mu,name:'manage-users'} ,
    {path:"*",name:"Pagenotfound",component:Pagenotfound},
];

const router = new VueRouter({
    routes
});

export default router;