
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
import smtplib
from application.models import Album, User
import os
from dotenv import load_dotenv
load_dotenv()


def get_users():
    users=User.query.all()
    return users


def csv_details(user_id):
    albums = Album.query.filter_by(user_id=user_id).all()
    result = []
    for album in albums:
        result.append((album.id, album.name, album.release_date, album.genre_name, album.album_songs))
    return result


def send_email(to_address, subject, message, attachment_path=None):

    SMPTP_SERVER_HOST = 'smtp.gmail.com'
    SMPTP_SERVER_PORT = 587
    SENDER_ADDRESS = os.getenv('sender_email')
    SENDER_PASSWORD = os.getenv('email_app_password')
    msg = MIMEMultipart()
    msg['From'] = SENDER_ADDRESS
    msg['To']=to_address
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    if attachment_path:
        with open(attachment_path, "rb") as attachment:
            part = MIMEApplication(attachment.read(), Name=os.path.basename(attachment_path))
            part['Content-Disposition'] = f'attachment; filename="{os.path.basename(attachment_path)}"'
            msg.attach(part)

    try:
        s = smtplib.SMTP(host=SMPTP_SERVER_HOST,port=SMPTP_SERVER_PORT)
        s.starttls()
        s.login(SENDER_ADDRESS,SENDER_PASSWORD)
        s.send_message(msg)
        s.quit()
        return True
    except Exception as e:
        print(e)
        return False
    

