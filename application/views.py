from flask import  request, jsonify,send_file, current_app
from flask import render_template
from flask import current_app as app
from application.models import *
from flask_security import auth_required,hash_password,roles_required
from flask_login import current_user, login_required
from datetime import datetime
# from application import tasks
# from weasyprint import HTML



@app.route('/')
def home():
    return render_template('home.html')

@app.route('/check_creator_status', methods=['GET'])
@login_required
def check_creator_status():
    user_role = Rolesusers.query.filter_by(user_id=current_user.id, role_id=3).first()
    is_blacklisted = current_user.is_blacklisted  

    if user_role:
        return jsonify({
            'isCreator': True,
            'isBlacklisted': is_blacklisted,
            'message': 'User is a creator'
        }), 200
    else:
        return jsonify({
            'isCreator': False,
            'isBlacklisted': is_blacklisted,
            'message': 'User is not a creator'
        }), 200

@app.route('/get_creator_data', methods=['GET'])
@login_required
def get_creator_data():

    is_creator = Rolesusers.query.filter_by(user_id=current_user.id, role_id=3).first() is not None
    if not is_creator:
        return jsonify({'message': 'Access denied'}), 403

    album_count = Album.query.filter_by(user_id=current_user.id).count()
    song_count = Song.query.filter_by(user_id=current_user.id).count()

    return jsonify({'albumCount': album_count, 'songCount': song_count}), 200

@app.route('/api/admin_dashboard', methods=['GET'])
# @login_required
def api_admin_dashboard():
    normal_user_count = User.query.count() 
    creator_count = db.session.query(User).join(Rolesusers).filter(Rolesusers.role_id == 3).count()
    track_count = Song.query.count()
    genre_count = Genre.query.count()
    album_count = Album.query.count()
    
    return jsonify({
        'normal_user_count': normal_user_count,
        'creator_count': creator_count,
        'track_count': track_count,
        'genre_count': genre_count,
        'album_count': album_count
    }), 200


@app.route('/api/creator', methods=['GET'])
def api_creator():
    try:
        album_count = Album.query.filter_by(user_id=current_user.id).count()
        song_count = Song.query.filter_by(user_id=current_user.id).count()
        return jsonify({'album_count': album_count, 'song_count': song_count}), 200
    except Exception as e:
        print(e) 
        return jsonify({'error': 'Internal Server Error'}), 500
