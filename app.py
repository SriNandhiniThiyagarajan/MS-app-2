from flask import Flask, redirect,render_template, request
from flask_security import SQLAlchemySessionUserDatastore, Security, login_user, logout_user
from flask_security import current_user, auth_required, login_required, roles_required, roles_accepted,hash_password,verify_password
from application.models import *
from config import DevelopmentConfig
from application.api import *
from application.urls import *
# from application.sec import datastore
from flask_cors import CORS
from utils import send_email
from worker import celery_init_app
from flask import jsonify, send_file
from celery.result import AsyncResult
   


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    app.config['UPLOAD_FOLDER'] = 'static/audios'
    db.init_app(app)
    api.init_app(app)
    CORS(app)
    user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role) 
    app.security = Security(app, user_datastore)
    with app.app_context():
        db.create_all()

        if(db.session.query(Role).count()==0):
            app.security.datastore.create_role(name="admin",description="admin")
            db.session.commit()
            # admin_create_user()

    with app.app_context():
        import application.views
    from flask import  jsonify
    from flask_security.decorators import _get_unauthorized_response
    
    return app

app=create_app()
celery_app = celery_init_app(app)

# app.config['SECURITY_UNAUTHORIZED_VIEW'] = 'unauthorized'
# # the above line is used to redirect to custom error page when user is not authorized
# app.config['SECURITY_POST_LOGIN_VIEW'] = custom_login_route

# custom_error_route = 'unauthorized'
custom_error_route = 'unauthorized'
custom_login_route = 'unauthorized'

@app.route('/unauthorized')
def unauthorized():
    return {'message':'You are not authorized to access this page'},403


@app.errorhandler(404)
def page_not_found(e):

    return render_template('404.html'), 404

@app.errorhandler(403)
def not_authorized(e):
    return render_template('403.html'), 403

# to handle unauthorized access
@app.errorhandler(401)
def unauthorized_access(e):
    return render_template('401.html'), 401

#if we dont pass token in header
@app.errorhandler(400)
def bad_request(e):
    return render_template('400.html'), 400



# # This handles unauthorized access for regular web requests
# @app.security.unauthorized_handler
# def unauthz_handler():
#     # Check if the request is an API request
#     #to check if no token is passed in header

#     if request.headers.get('Accept') == 'application/json':
#         # API request, handle unauthorized access for API separately
#         return {'error': 'Unauthorized'}
#     else:
#         # Regular web request, redirect to a different page
#         return {'error': 'Unauthorized'}


@app.route('/download-csv')
def export_csv():
    current_user_id = current_user.id
    from tasks import create_csv
    task = create_csv.apply_async(args=[current_user_id])
    print("current_user_id", current_user_id)
    return jsonify({"task_id": task.id}), 200



@app.route('/get-csv/<task_id>')
def get_csv(task_id):
    from tasks import create_csv
    task = create_csv.AsyncResult(task_id)
    if task.state == 'PENDING':
        return jsonify({"task_state": task.state}), 200
    elif task.state == 'SUCCESS':
        return send_file(f'test.csv', as_attachment=True)
    else:
        return jsonify({"task_state":task.state}), 200


if __name__ == '__main__':
    app.run(debug=True)