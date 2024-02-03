from celery import Celery
from celery.schedules import crontab
import celery_config as celery_config
# from application import app as flask_app
from app import app as flask_app
import csv, os
from celery.schedules import crontab
from utils import csv_details, get_users, send_email



app = Celery()
app.conf.update(
        broker_url=celery_config.CELERY_BROKER_URL,
        result_backend=celery_config.CELERY_RESULT_BACKEND
    )

app.conf.timezone = "Asia/Kolkata"
app.conf.broker_connection_retry_on_startup=True


@app.task
def create_csv(user_id):
    filename = f'user_{user_id}_report.csv'
    filepath = os.path.join('path/to/save/directory', filename) 
    with flask_app.app_context():
        result = csv_details(user_id)
    with open(filepath, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["ID", "Name", "Release Date", "Genre Name", "Album Songs"])

        for row in result:
            writer.writerow(row)  
    return filepath

@app.task
def monthly_report():
    with flask_app.app_context():
        users = get_users()
        for user in users:
            testfile = create_csv(user.id)
            send_email(
                user.email,
                "Your Monthly Music Digest - Aurora Daisy",
                "Hello, here's your personalized music report for this month!",
                testfile
            )
    return "Monthly Reports Sent Successfully"

@app.task
def daily_reminder():
    with flask_app.app_context():
        users = get_users() 
    for user in users:
        send_email(
            user.email,
            "Elevate Your Music Experience with Aurora Daisy Premium",
            "Unlock premium features like offline listening, ad-free experience, and more!"
        )
    return "Daily Reminders Sent Successfully"


app.conf.beat_schedule = {
    'send-monthly-report': {
        'task': 'tasks.monthly_report',
        # 'schedule': crontab(day_of_month=1, hour=0, minute=0),
        'schedule': 30.0   
    },

    'send-daily-reminder': {
        'task': 'tasks.daily_reminder',
        # 'schedule': crontab(hour=12,minute=00),  
        'schedule': 30.0    
         
    },
}




