from flask_restful import fields

role_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String
}

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'active': fields.Boolean,
    'is_blacklisted': fields.Boolean,
    'lastlogin': fields.DateTime,
    'roles': fields.List(fields.String),
    'albums': fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'release_date': fields.String,
        'genre_id': fields.Integer,
        'user_id': fields.Integer
    })),
    'songs': fields.List(fields.Nested({
        'id': fields.Integer,
        'title': fields.String,
        'artist': fields.String,
        'duration': fields.Float,
        'lyrics': fields.String,
        'date_added': fields.DateTime,
        'filename': fields.String,
        'album_id': fields.Integer,
        'user_id': fields.Integer,
        'average_rating': fields.Float
    }))
}

song_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'artist': fields.String,
    'duration': fields.String,
    'lyrics': fields.String,
    'date_added': fields.DateTime,
    'filename': fields.String,
    'album_id': fields.Integer,
    'user_id': fields.Integer,
    'average_rating': fields.Float
}

genre_fields = {
    'id': fields.Integer,
    'name': fields.String
}

album_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'release_date': fields.String,
    'genre_id': fields.Integer,
    'user_id': fields.Integer
}



rating_fields = {
    'id': fields.Integer,
    'rating': fields.Integer,
    'song_id': fields.Integer,
    'user_id': fields.Integer
}

playlist_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'user_id': fields.Integer
}
