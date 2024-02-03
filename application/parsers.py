from flask_restful import Api, Resource, reqparse,fields,marshal_with,marshal



def email_type(value):
    if "@" not in value and "." not in value:
        raise ValueError("Invalid email address")
    return value


role_parser = reqparse.RequestParser()
role_parser.add_argument('name', type=str, required=True, help="Name cannot be blank")
role_parser.add_argument('description', type=str, required=True, help="Description cannot be blank")

role_parser_patch = reqparse.RequestParser()
role_parser_patch.add_argument('name', type=str)
role_parser_patch.add_argument('description', type=str)

user_parser = reqparse.RequestParser()
user_parser.add_argument('username', type=str, required=True, help="Username cannot be blank")
user_parser.add_argument('email', type=email_type, required=True, help="Email cannot be blank")
user_parser.add_argument('password', type=str, required=True, help="Password cannot be blank")
user_parser.add_argument('is_blacklisted', type=bool, default=False)


user_parser_patch = reqparse.RequestParser()
user_parser_patch.add_argument('username', type=str)
user_parser_patch.add_argument('email', type=email_type)
user_parser_patch.add_argument('password', type=str)
user_parser_patch.add_argument('is_blacklisted', type=bool)

login_parser = reqparse.RequestParser()
login_parser.add_argument('username', type=str, required=True, help="Username cannot be blank")
login_parser.add_argument('password', type=str, required=True, help="Password cannot be blank")


filter_parser = reqparse.RequestParser()
filter_parser.add_argument('filter_type', choices=['title', 'rating', 'artist'], help="Invalid filter type")
filter_parser.add_argument('filter_value', help="Filter value required")

album_parser = reqparse.RequestParser()
album_parser.add_argument('name', type=str, required=True, help="Name cannot be blank")
album_parser.add_argument('release_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d').date())
album_parser.add_argument('genre_id', type=int, help="Genre ID cannot be blank")
album_parser.add_argument('user_id', type=int, help="User ID cannot be blank")
album_parser.add_argument('id', type=int, help="Album ID cannot be blank")



song_parser = reqparse.RequestParser()
song_parser.add_argument('title', type=str,required=True, help="Title cannot be blank")
song_parser.add_argument('artist', type=str ,required=True, help="Artist cannot be blank")
song_parser.add_argument('lyrics', type=str ,required=True, help="Lyrics cannot be blank")
