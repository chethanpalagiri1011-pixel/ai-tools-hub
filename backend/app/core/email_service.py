import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SENDER_EMAIL = os.getenv("GMAIL_ADDRESS", "")
SENDER_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")

def send_otp_email(recipient_email: str, otp: str, name: str = "User") -> bool:
    """Send OTP email via Gmail SMTP. Returns True on success."""
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("[WARNING] EMAIL NOT CONFIGURED - OTP would be:", otp)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your AI Tools Hub Verification Code"
    msg["From"] = f"AI Tools Hub <{SENDER_EMAIL}>"
    msg["To"] = recipient_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 32px; border-radius: 16px; border: 1px solid rgba(139,92,246,0.3);">
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #3b82f6); border-radius: 12px; line-height: 48px; font-size: 22px;">⚡</div>
        <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 4px;">AI Tools Hub</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">Email Verification</p>
      </div>

      <p style="color: #e2e8f0; font-size: 15px;">Hi <strong>{name}</strong>,</p>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Your verification code for AI Tools Hub is:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: rgba(124,58,237,0.15); border: 2px solid rgba(139,92,246,0.5); border-radius: 12px; padding: 18px 40px;">
          <span style="font-size: 36px; font-weight: bold; color: #a78bfa; letter-spacing: 10px;">{otp}</span>
        </div>
      </div>

      <p style="color: #94a3b8; font-size: 13px; text-align: center;">
        ⏰ This code expires in <strong style="color:#e2e8f0;">10 minutes</strong>
      </p>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
        If you didn't request this, please ignore this email.<br/>
        © 2025 AI Tools Hub
      </p>
    </div>
    """

    text = f"Your AI Tools Hub verification code is: {otp}\nThis code expires in 10 minutes."
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    # Try SMTP_SSL on Port 465 first
    try:
        print(f"Attempting to send SMTP_SSL on port 465 to {recipient_email}...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        print(f"[SUCCESS] OTP email sent to {recipient_email} via Port 465 SSL")
        return True
    except Exception as e:
        print(f"[INFO] Port 465 SSL failed: {e}. Retrying via Port 587 STARTTLS...")

    # Fallback to SMTP with STARTTLS on Port 587
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        print(f"[SUCCESS] OTP email sent to {recipient_email} via Port 587 STARTTLS")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email via Port 587: {e}")
        return False

