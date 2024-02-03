from flask_restful import Api, Resource, reqparse,fields,marshal_with,marshal
from flask import Flask, request,url_for,jsonify,abort
from flask_login import LoginManager, UserMixin, login_user, logout_user
from werkzeug.security import check_password_hash,generate_password_hash
from .models import *
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from flask_security import current_user,login_required, roles_required,auth_required,verify_password,roles_accepted
from .sec import datastore
from .marshals import *
import hashlib
import os
from .parsers import *
from flask import current_app as app
from mutagen.mp3 import MP3



# ==========================Api for role ==========================================================================


class RoleListResource(Resource):

   # @roles_required('admin')
    #@auth_required('token')
    def get(self):
        roles = Role.query.all()
        return marshal(roles, role_fields), 200
    
    #@auth_required('token')
   # @roles_required('admin')
    def post(self):
        args = role_parser.parse_args()
        new_role = Role(name=args['name'], description=args['description'])
        db.session.add(new_role)
        db.session.commit()
        return {'message': 'Role created', 'role_id': new_role.id}, 201
    

class RoleResource(Resource):
    #@auth_required('token')
    def get(self, role_id):
        role = Role.query.get(role_id)
        if role:
            return marshal(role, role_fields), 200
        return {'message': 'Role not found'}, 404

    #@auth_required('token')
   # @roles_required('admin')
    def put(self, role_id):
        args = role_parser.parse_args()

        role = Role.query.get(role_id)
        if role:
            role.name = args['name']
            role.description = args['description']
            db.session.commit()
            return marshal(role, role_fields), 200
        return {'message': 'Role not found'}, 404
    
    #@auth_required('token')
   # @roles_required('admin')
    def patch(self, role_id):
        args = role_parser_patch.parse_args()

        role = Role.query.get(role_id)
        if role:
            if args['name']:
                role.name = args['name']
            if args['description']:
                role.description = args['description']
            db.session.commit()
            return marshal(role, role_fields), 200
        return {'message': 'Role not found'}, 404

    #@auth_required('token')
   # @roles_required('admin')
    def delete(self, role_id):
        role = Role.query.get(role_id)
        if role:
            db.session.delete(role)
            db.session.commit()
            return {'message': 'Role deleted'}, 200
        return {'message': 'Role not found'}, 404








# ==========================Api for Users ==========================================================================


class UserListResource(Resource):
    #@auth_required('token')
    #@roles_accepted('admin')
    def get(self):
            users = User.query.all()
            return jsonify([marshal(user, user_fields) for user in users])

class UserProfileResource(Resource):
    #@auth_required('token')
    def get(self):
        print("current_user",current_user)
        if current_user is None:
            return {'message': 'User not found.'}, 404

        user_data = {
            'username': current_user.username,
            'email': current_user.email
        }
        return user_data, 200

    #@auth_required('token')
    def put(self):
        data = request.get_json()
        new_username = data.get('username')
        new_password = data.get('password')

        if new_username and app.security.datastore.find_user(username=new_username):
            return {'message': 'Username already exists.'}, 400

        if new_username:
            current_user.username = new_username

        if new_password:
            new_password = new_password.encode('utf-8')
            current_user.password = hashli.sha256(new_password).hexdigest()

        db.session.commit()
        return {'message': 'Profile updated successfully'}, 200


    
class UserRegistrationResource(Resource):

    def post(self):
        args = user_parser.parse_args()
        username = args['username']
        email = args['email']

        if app.security.datastore.find_user(email=email):
            return {'message': 'Email already exists.'}, 400

        if app.security.datastore.find_user(username=username):
            return {'message': 'Username already exists.'}, 400

        password = args['password'].encode('utf-8')
        password = hashlib.sha256(password).hexdigest()

        new_user = app.security.datastore.create_user(username=username, email=email, password=password)

        user_role = Role.query.filter_by(name='user').first()
        if user_role:
            new_user.roles.append(user_role)

        db.session.commit()
        return {'message': 'User created'}, 201


class UserResource(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if user:
            return marshal(user, user_fields), 200
        return {'message': 'User not found'}, 404
    
    def put(self, user_id):
        args = user_parser.parse_args()
        user = User.query.get(user_id)
        if user:
            user.username = args['username']
            user.email = args['email']
            user.password = args['password']
            user.is_blacklisted = args['is_blacklisted']
            db.session.commit()
            return marshal(user, user_fields), 200
        return {'message': 'User not found'}, 404
    
    def patch(self, user_id):
        args = user_parser_patch.parse_args()
        user = User.query.get(user_id)
        if user:
            if args['username']:
                user.username = args['username']
            if args['email']:
                user.email = args['email']
            if args['password']:
                password=args['password'].encode('utf-8')
                password=hashlib.sha256(password).hexdigest()
            if args['is_blacklisted']:
                user.is_blacklisted = args['is_blacklisted']
            db.session.commit()
            return marshal(user, user_fields), 200
        return {'message': 'User not found'}, 404
    
    def delete(self, user_id):
        user = User.query.get(user_id)
        if user:
            # instead of deleting the user, we will just set the active flag to False
            user.active = False
            # this will prevent the user from logging in again
            db.session.commit()
            return {'message': 'User deleted'}, 200
        return {'message': 'User not found'}, 404


class UserRole(Resource):
    #@auth_required('token')
    def get(self):
        return marshal(current_user, user_fields), 200
    

    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('role', type=str, required=True, help="Role cannot be blank")
        parser.add_argument('user_id', type=int, required=True, help="User ID cannot be blank")
        args = parser.parse_args()
        name=args['role']
        user_id=args['user_id']
        role = Role.query.filter_by(name=args['role']).first()
        user=User.query.get(user_id)
        if not role:
            return {'message': 'Role not found'}, 404
        if not user:
            return {'message': 'User not found'}, 404
        
        user_role=Rolesusers.query.filter_by(user_id=user_id,role_id=role.id).first()
        print("user_role",user_role)    
        if user_role:
            db.session.delete(user_role)
        db.session.commit()
        db.session.refresh(user)
        return marshal(user, user_fields), 200


class Register_as_creator(Resource):
    #@auth_required('token')
    def post(self):
        print("in register as creator")
        user_role=Rolesusers.query.filter_by(user_id=current_user.id,role_id=3).first()
        if user_role:
            return {'message': 'You are already registered as a creator'}, 400
        else:
            user_role=Rolesusers.query.filter_by(user_id=current_user.id,role_id=2).first()
            if user_role:
                user_role.role_id=3
                db.session.commit()
            else:
                return {'message': 'You are an admin.'}, 400
            db.session.commit()
            return {"message": "You are now registered as a creator "}, 200

class UserLogin(Resource):
    def post(self):
        args = login_parser.parse_args()
        user = User.query.filter_by(username=args['username']).first()
        password=args['password'].encode('utf-8')
        password=hashlib.sha256(password).hexdigest()
        if user and verify_password(password, user.password):
            token = user.get_auth_token()
            login_user(user)
            return {'message': 'Logged in successfully', 'auth_token': token}, 200
        else:
            return {'message': 'Invalid username or password'}, 401



#---------------------------User log --------------------------------
class UserLog(Resource):
    #@auth_required('token')
    def get(self): 
        try:
            id = current_user.id
            time = datetime.now()
       
            log = User.query.filter_by(id=id).first()
        except:
            return {"message": "User not logged in"}, 404
        if log:
            log.lastlogin = time
            logout_user()
        
            db.session.commit()
            return {"message": "User log recorded or updated successfully"}, 200
        else:
            return {"message": "User not found"}, 404


# ------------------------------------------------------admin--------------------------------------------------------------------------

# -------------------------------Genre----------------------

class GenreResource(Resource):
    # #@auth_required('token')
    def get(self, genre_id=None):
        if genre_id:
            genre = Genre.query.get_or_404(genre_id)
            return marshal(genre, genre_fields)
        genres = Genre.query.all()
        return [marshal(genre, genre_fields) for genre in genres]

    # #@auth_required('token')
    # @roles_required('admin')
    def put(self, genre_id):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Genre name cannot be blank")
        args = parser.parse_args()

        genre = Genre.query.get_or_404(genre_id)
        genre.name = args['name']
        db.session.commit()
        return {'message': 'Genre updated successfully'}, 200
    
    #@auth_required('token')
   # @roles_required('admin')
    def delete(self, genre_id):
        genre = Genre.query.get_or_404(genre_id)
        db.session.delete(genre)
        db.session.commit()
        return {'message': 'Genre deleted successfully'}, 200

class GenreListResource(Resource):
    
    #@auth_required('token')
    def get(self):
        genres = Genre.query.all()
        return [marshal(genre, genre_fields) for genre in genres], 200
    
    # #@auth_required('token')
    # @roles_required('admin')
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Genre name cannot be blank")
        args = parser.parse_args()

        existing_genre = Genre.query.filter_by(name=args['name']).first()
        if not existing_genre:
            new_genre = Genre(name=args['name'])
            db.session.add(new_genre)
            db.session.commit()
            return {'message': 'Genre added successfully!'}, 201
        else:
            return {'message': 'Genre already exists.'}, 409


# --------------------------user management-----------------------

class BlacklistUserResource(Resource):
    #@auth_required('token')
   # @roles_required('admin')
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return {'is_blacklisted': user.is_blacklisted}, 200
    
    #@auth_required('token')
   # @roles_required('admin')
    def put(self, user_id):
            user = User.query.get_or_404(user_id)
            user.is_blacklisted = True
            db.session.commit()
            return {'message': f'User {user.username} has been blacklisted.'}, 200

class WhitelistUserResource(Resource):
    #@auth_required('token')
   # @roles_required('admin')
    def put(self, user_id):
            user = User.query.get_or_404(user_id)
            user.is_blacklisted = False
            db.session.commit()
            return {'message': f'User {user.username} has been whitelisted.'}, 200


class FlagSongResource(Resource):
    #@auth_required('token')
   # @roles_required('admin')
    def delete(self, song_id):
        song = Song.query.get_or_404(song_id)
        db.session.delete(song)
        db.session.commit()
        return {'message': 'Song deleted successfully'}, 200

# --------------------------------------------songs----------------------------------------------------------

class SongFilter(Resource):
    def post(self):
        
        data = filter_parser.parse_args()
        filter_type = data["filter_type"]
        filter_value = data["filter_value"]

        if not filter_value:
            return {'message': f"No {filter_type} specified for filtering."}, 400

        query = Song.query
        if filter_type == 'title':
            query = query.filter(Song.title.ilike(f"%{filter_value}%"))
        elif filter_type == 'rating':
            try:
                rating_value = float(filter_value)
                query = query.join(Ratings).group_by(Song.id).having(db.func.avg(Ratings.rating) == rating_value)
            except ValueError:
                return {'message': 'Invalid rating value.'}, 400
        elif filter_type == 'artist':
            query = query.filter(Song.artist.ilike(f"%{filter_value}%"))

        songs = query.all()

        songs_data = []
        for song in songs:
            average_rating = song.average_rating
            song_data = {
                "title": song.title,
                "artist": song.artist,
                "average_rating": average_rating,
            }
            songs_data.append(song_data)

        return {'songs': songs_data}, 200


class SongsByGenre(Resource):
    def get(self, genre_id):
        genre = Genre.query.get_or_404(genre_id)
        songs = Song.query.join(Album).filter(Album.genre_id == genre.id).all()

        for song in songs:
            song.average_rating = song.average_rating() if callable(song.average_rating) else song.average_rating

        songs_data = marshal(songs, song_fields)
        return {
            'genre': marshal(genre, genre_fields),
            'songs': songs_data
        }


class SongsByAlbum(Resource):
    def get(self, album_id):
        album = Album.query.get_or_404(album_id)
        songs = Song.query.filter_by(album_id=album.id).all()

        songs_data = marshal(songs, song_fields)
        album_data = marshal(album, album_fields)
        return {
            'album': album_data,
            'songs': songs_data
        }, 200


class AlbumResource(Resource):
    #@auth_required('token')
    # @roles_accepted(['admin','creator'])
    def get(self, album_id):
        album = Album.query.get(album_id)
        if album:
            return marshal(album, album_fields), 200
        else:
            return {'message': 'Album not found'}, 404

    #@auth_required('token')
    # @roles_accepted(['admin','creator'])
    def delete(self, album_id):
        album = Album.query.get(album_id)
        if album:
            db.session.delete(album)
            db.session.commit()
            return {'message': 'Album deleted'}, 200
        return {'message': 'Album not found'}, 404

    #@auth_required('token')
    # @roles_required('creator')
    def put(self, album_id):
        album_put_parser = reqparse.RequestParser()
        album_put_parser.add_argument('name', type=str, required=True, help="Name cannot be blank")
        album_put_parser.add_argument('release_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d').date())
        album_put_parser.add_argument('genre_id', type=int, help="Genre ID cannot be blank")
        album_put_parser.add_argument('user_id', type=int, help="User ID cannot be blank")
        album_put_parser.add_argument('id', type=int, help="Album ID cannot be blank")
        args = album_put_parser.parse_args()


        album = Album.query.get(album_id)
        if album:
            album.name = args['name']
            album.release_date = args['release_date'] if args['release_date'] else album.release_date
            album.genre_id = args['genre_id']
            db.session.commit()
            return {'message': 'Album updated'}, 200
        return {'message': 'Album not found'}, 404

class AlbumListResource(Resource):
    #@auth_required('token')
    # @roles_accepted(['admin','creator'])
    def get(self):
        albums = Album.query.all()
        return [marshal(album, album_fields) for album in albums], 200

    #@auth_required('token')
    # @roles_required('creator')
    def post(self):
        args = album_parser.parse_args()
        existing_album = Album.query.filter_by(name=args['name']).first()
        if existing_album:
            abort(400, description="An album with this name already exists.")

        new_album = Album(
            name=args['name'],
            release_date=args['release_date'] if args['release_date'] else date.today(),
            genre_id=args['genre_id'],
            user_id=current_user.id,
        )

        db.session.add(new_album)
        db.session.commit()
        return {'message': 'Album created'}, 201

    # def put(self):
    #     print("i am here")
    #     x = album_parser.parse_args()
    #     print("i am here after parser ")

    #     album_id = args["id"]
    #     print("i am here after parser  id ")
    
    #     album = Album.query.get(album_id)
        
    #     album.name = args['name'] if args['name'] else album.name
    #     album.release_date = args['release_date'] if args['release_date'] else album.release_date
    #     album.genre_id = args['genre_id'] if args['genre_id'] else album.genre_id

    #     try:
    #         db.session.commit()
    #         return {'message': 'Album created'}, 201
    #     except:
    #         return {"mesasge" : "Album not found"}, 404


class AlbumsByUserResource(Resource):
    #@auth_required('token')
    # @roles_required('creator')
    def get(self):
        albums = Album.query.filter_by(user_id=current_user.id).all()
        return [marshal(album, album_fields) for album in albums], 200


# -------------------ratings---------------------
class RateSongResource(Resource):
    # @login_required
    def post(self, song_id):
        parser = reqparse.RequestParser()
        parser.add_argument('rating', type=float, required=True, help="Rating cannot be blank")
        args = parser.parse_args()

        try:
            rating_value = args['rating']
            if 0 < rating_value <= 5:
                existing_rating = Ratings.query.filter_by(song_id=song_id, user_id=current_user.id).first()

                if existing_rating:
                    existing_rating.rating = rating_value
                else:
                    new_rating = Ratings(rating=rating_value, song_id=song_id, user_id=current_user.id)
                    db.session.add(new_rating)

                db.session.commit()
                return {'message': 'Rating submitted successfully!'}, 200
            else:
                return {'message': 'Invalid rating. Please rate between 1 and 5.'}, 400
        except ValueError:
            return {'message': 'Invalid input for rating.'}, 400


class SongResource(Resource):
    def get(self, song_id):
        song = Song.query.get(song_id)
        if song:
            return marshal(song, song_fields), 200
        else:
            return {'message': 'Song not found'}, 404

    def put(self, song_id):
        song = Song.query.get(song_id)
        song_put_parser = reqparse.RequestParser()
        song_put_parser.add_argument('title', type=str,required=True, help="Title cannot be blank")
        song_put_parser.add_argument('artist', type=str ,required=True, help="Artist cannot be blank")
        song_put_parser.add_argument('lyrics', type=str ,required=True, help="Lyrics cannot be blank")
        if song:
            args = song_parser.parse_args()

            if args['title'] is not None:
                song.title = args['title']
            if args['artist'] is not None:
                song.artist = args['artist']
            if args['lyrics'] is not None:
                song.lyrics = args['lyrics']
            db.session.commit()
            return {'song': marshal(song, song_fields) }, 200
        return {'message': 'Song not found'}, 404

    def delete(self, song_id):
        song = Song.query.get(song_id)
        if song:
            db.session.delete(song)
            db.session.commit()
            return {'message': 'Song deleted'}, 200
        return {'message': 'Song not found'}, 404

class SongListResource(Resource):
    def get(self):
        songs = Song.query.all()
        return [marshal(song, song_fields) for song in songs], 200


def get_audio_duration(file_path):
    audio = MP3(file_path)
    duration_seconds = audio.info.length  
    duration_minutes = duration_seconds // 60 
    remaining_seconds = duration_seconds % 60
    duration_minutes += remaining_seconds / 100
    return duration_minutes


class AlbumSong(Resource):
    # @auth_required('token')
    # @roles_required('creator')
    def post(self, album_id):
        title = request.form.get('title')
        artist = request.form.get('artist')
        lyrics = request.form.get('lyrics')

        album = Album.query.get_or_404(album_id)
        album_user_id = album.user_id

        existing_song = Song.query.filter_by(title=title, album_id=album_id).first()
        if existing_song:
            return {'message': 'A song with this title already exists in the album'}, 400

        if 'file' not in request.files:
            return {'message': 'No file part'}, 400

        file = request.files['file']
        if file.filename == '':
            return {'message': 'No selected file'}, 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        duration_minutes = float(get_audio_duration(file_path))
        duration_minutes = round(duration_minutes, 3)

        song = Song(
            title=title, 
            artist=artist, 
            duration=duration_minutes, 
            lyrics=lyrics, 
            album_id=album_id, 
            user_id=album_user_id,
            filename=filename
        )

        db.session.add(song)
        db.session.commit()

        return {'message': 'Song uploaded successfully', 'song': marshal(song, song_fields)}, 201


# ==============================================Playlist===========================================================================

class PlaylistResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help="Name cannot be blank")

    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def get(self, playlist_id):
        playlist = Playlist.query.get(playlist_id)
        if playlist:
            return {'name': playlist.name}, 200
        return {'message': 'Playlist not found'}, 404

    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def put(self, playlist_id):
        data = PlaylistResource.parser.parse_args()
        playlist = Playlist.query.get(playlist_id)

        if playlist:
            playlist.name = data['name']
            db.session.commit()
            return {'message': 'Playlist updated successfully'}, 200
        return {'message': 'Playlist not found'}, 404

    # @auth_required('token')
    # @roles_required('user')
    # @roles_accepted(['user','creator'])
    def delete(self, playlist_id):
        playlist = Playlist.query.get(playlist_id)
        if playlist:
            db.session.delete(playlist)
            db.session.commit()
            return {'message': 'Playlist deleted'}, 200
        return {'message': 'Playlist not found'}, 404


class PlaylistListResource(Resource):
    
    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def get(self):
        playlists = Playlist.query.all()
        return {'playlists': [{'id': playlist.id, 'name': playlist.name} for playlist in playlists]}
    
    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def post(self):
        data = PlaylistResource.parser.parse_args()
        new_playlist = Playlist(name=data['name'], user_id=current_user.id)
        db.session.add(new_playlist)
        db.session.commit()
        return {'message': 'New playlist created', 'playlist_id': new_playlist.id}, 201



# ==============================================playlistsong===========================================================================

class PlaylistSongResource(Resource):
    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def get(self, playlist_id):
        playlist = Playlist.query.get(playlist_id)

        if not playlist:
            return {'message': 'Playlist not found'}, 404
            
        songs = playlist.songs
        print(songs)
        return {'songs': [marshal(song, song_fields) for song in songs]}, 200

    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def post(self, playlist_id):
        parser = reqparse.RequestParser()
        parser.add_argument('song_ids', type=int, action='append', required=True, help="Song IDs cannot be blank")
        data = parser.parse_args()
        song_ids = data['song_ids']

        if not Playlist.query.get(playlist_id):
            return {'message': 'Playlist not found'}, 404

        for song_id in song_ids:
            if not Song.query.get(song_id):
                return {'message': f'Song with ID {song_id} not found'}, 401

            new_playlist_song = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
            db.session.add(new_playlist_song)

        db.session.commit()
        return {'message': 'Songs added to playlist'}, 201
    
    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def delete(self, playlist_id, song_id):
        playlist_song = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
        if playlist_song:
            db.session.delete(playlist_song)
            db.session.commit()
            return {'message': 'Song removed from playlist'}, 200
        return {'message': 'Song not found in the specified playlist'}, 404
    

class UserPlayListResource(Resource):
    # @auth_required('token')
    # @roles_accepted(['user','creator'])
    def get(self):
        user_id = current_user.id
        playlists = Playlist.query.filter_by(user_id=user_id).all()
        print(playlists)
        return {'playlists': [{'id': playlist.id, 'name': playlist.name} for playlist in playlists]}, 200
