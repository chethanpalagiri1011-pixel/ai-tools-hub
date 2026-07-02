import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.environ.get("GMAIL_ADDRESS", "")
SENDER_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")

print(f"Testing with: {SENDER_EMAIL}")

try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        print("LOGIN SUCCESSFUL!")
except Exception as e:
    print(f"LOGIN FAILED: {e}")
