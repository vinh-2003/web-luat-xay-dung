import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(to_email: str, subject: str, html_content: str):
    """
    Send an email using SMTP credentials from settings.
    """
    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email

    part1 = MIMEText(html_content, 'html')
    msg.attach(part1)

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        server.close()
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False
