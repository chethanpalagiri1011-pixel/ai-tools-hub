import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.environ.get("GMAIL_ADDRESS", "")
SENDER_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")

recipient = "chethanpalagiri1011@gmail.com" # change to target

print(f"Sending test email from {SENDER_EMAIL} to {recipient}")

try:
    msg = MIMEMultipart()
    msg["Subject"] = "Test SMTP Email"
    msg["From"] = SENDER_EMAIL
    msg["To"] = recipient
    msg.attach(MIMEText("Hello, this is a test email to verify SMTP functionality.", "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
    print("EMAIL SENT SUCCESSFULLY!")
except Exception as e:
    print(f"EMAIL SEND FAILED: {e}")
