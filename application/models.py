from flask_sqlalchemy import SQLAlchemy
from datetime import datetime,date
from flask_security import UserMixin,RoleMixin

db=SQLAlchemy()

class Rolesusers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer, db.ForeignKey('role.id')) 

    def __repr__(self):
        return f'<User {self.user_id} Role {self.role_id}>'

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128)) 
    is_blacklisted = db.Column(db.Boolean, default=False)
    albums = db.relationship('Album', backref='user', lazy=True)
    songs = db.relationship('Song', backref='user', lazy=True)

    active = db.Column(db.Boolean())
    authenticated = db.Column(db.Boolean())
    lastlogin = db.Column(db.DateTime, default=datetime.utcnow)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False) 
    roles = db.relationship('Role', secondary=Rolesusers.__table__, backref=db.backref('users', lazy='dynamic'))
    
    def __repr__(self):
        return f'<User {self.username}>'
    @property
    def is_authorised(self):
        return self.authenticated
    
    @property
    def get_roles(self):
        return [role.name for role in self.roles]


class Role(db.Model, RoleMixin):
    __tablename__="role"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

    def __repr__(self):
        return f'{self.name}'
class Genre(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    albums = db.relationship('Album', backref='genre', lazy='dynamic')

class Album(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    release_date = db.Column(db.Date,default=date.today)
    genre_id = db.Column(db.Integer, db.ForeignKey('genre.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    songs = db.relationship('Song', backref='album', lazy='dynamic')

    @property
    def genre_name(self):
        return self.genre.name if self.genre else None
        
    @property
    def album_songs(self):
        count = 0
        for song in self.songs:
            count += 1
        return count    


class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, unique=True)
    artist = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Float)
    lyrics = db.Column(db.Text)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    filename = db.Column(db.String(255), nullable=False)
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ratings = db.relationship('Ratings', backref='song', lazy=True, cascade="all, delete-orphan")

    @property
    def average_rating(self):
        if self.ratings:
            return sum(rating.rating for rating in self.ratings) / len(self.ratings) if self.ratings else 0

    def __repr__(self):
        return f'<Song {self.title}>'


class Ratings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Float, nullable=False, default=0)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) 

    def __repr__(self):
        return f'<Rating {self.rating} for Song ID {self.song_id}>'


class Playlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False,unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    songs = db.relationship('Song', secondary='playlist_song',
                            backref=db.backref('playlists', lazy='dynamic'))

class PlaylistSong(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlist.id'), nullable=False)
