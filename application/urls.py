from flask_restful import Api
from .api import RateSongResource,UserProfileResource,UserRegistrationResource,AlbumSong,Register_as_creator,AlbumsByUserResource,UserPlayListResource, RoleResource, RoleListResource, UserListResource, UserResource, UserRole, UserLogin, UserLog, SongFilter, SongsByGenre, SongsByAlbum, GenreResource, BlacklistUserResource, WhitelistUserResource, FlagSongResource, AlbumListResource, SongListResource, PlaylistSongResource, PlaylistResource, PlaylistListResource, SongResource, GenreResource, GenreListResource, AlbumListResource, AlbumResource

api = Api(prefix='/api/v2')

#User
api.add_resource(RoleResource, '/roles/<int:role_id>')
api.add_resource(RoleListResource, '/roles')
api.add_resource(UserListResource, '/users')
api.add_resource(UserResource,'/users/<int:user_id>')
api.add_resource(UserRole, '/user_role')
api.add_resource(UserLogin, '/login')
api.add_resource(UserLog, '/logout')
api.add_resource(UserRegistrationResource, '/register')
api.add_resource(Register_as_creator, '/register_as_creator')
api.add_resource(UserProfileResource, '/profile')


# songs
api.add_resource(SongFilter, '/songs/filter')
api.add_resource(SongsByGenre, '/songs/genre/<int:genre_id>')
api.add_resource(SongsByAlbum, '/songs/album/<int:album_id>')
api.add_resource(SongResource, '/songs/<int:song_id>')
api.add_resource(SongListResource, '/songs')
api.add_resource(AlbumSong,'/albums/<int:album_id>/songs')
api.add_resource(RateSongResource,'/rate/songs/<int:song_id>')


#  admin
api.add_resource(GenreResource, '/genres', '/genres/<int:genre_id>')
api.add_resource(GenreListResource, '/add_genre')
api.add_resource(BlacklistUserResource, '/admin/blacklist_user/<int:user_id>')
api.add_resource(WhitelistUserResource, '/admin/whitelist_user/<int:user_id>')
api.add_resource(FlagSongResource, '/flag_song/<int:song_id>')


# albums
api.add_resource(AlbumResource, '/albums/<int:album_id>')
api.add_resource(AlbumListResource, '/albums')
api.add_resource(AlbumsByUserResource, '/user_albums')


# PLAYLIST
api.add_resource(PlaylistSongResource, '/playlists/<int:playlist_id>/songs', '/playlists/<int:playlist_id>/songs/<int:song_id>')
api.add_resource(PlaylistResource, '/playlists/<int:playlist_id>')
api.add_resource(PlaylistListResource, '/playlists')
api.add_resource(UserPlayListResource, '/playlists/user')

