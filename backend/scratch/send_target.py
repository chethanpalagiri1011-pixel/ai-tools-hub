import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender = "chethanpalagiri1011@gmail.com"
password = "ovqmgkrwrrpeqpla"
recipient = "chethanp11110@gmail.com"

print(f"Attempting to send direct confirmation email from {sender} to {recipient}...")

msg = MIMEMultipart("alternative")
msg["Subject"] = "Welcome to AI Tools Hub — Registration Completed! 🎉"
msg["From"] = f"AI Tools Hub <{sender}>"
msg["To"] = recipient

html = f"""
<div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #0b0a1a; color: #e2e8f0; padding: 36px; border-radius: 20px; border: 1px solid rgba(139,92,246,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
  <div style="text-align: center; margin-bottom: 28px;">
    <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #7c3aed, #3b82f6); border-radius: 16px; line-height: 56px; font-size: 26px;">🚀</div>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 16px 0 4px; letter-spacing: -0.5px;">AI Tools Hub</h1>
    <p style="color: #a78bfa; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">Registration Confirmed</p>
  </div>

  <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <p style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Hello Creator, 👋</p>
    <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0;">
      Welcome to <strong>AI Tools Hub</strong>! Your account registration for <strong>{recipient}</strong> has been <span style="color: #4ade80; font-weight: bold;">successfully completed</span>.
    </p>
  </div>

  <div style="background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15)); border: 1px solid rgba(139,92,246,0.4); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
    <p style="color: #f1f5f9; font-size: 14px; margin: 0 0 8px;">🎁 Your Welcome Bonus</p>
    <p style="color: #38bdf8; font-size: 28px; font-weight: 900; margin: 0;">+100 Free Pro Credits</p>
  </div>

  <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 16px; font-weight: 700;">🚀 Next Steps — Explore Your Toolkit:</h3>

  <div style="margin-bottom: 12px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 4px solid #a855f7;">
    <strong style="color: #e2e8f0; font-size: 14px;">1. 🎨 Generate 4K AI Images</strong>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0; line-height: 1.4;">Turn text prompts into high-definition realistic artwork and visuals.</p>
  </div>

  <div style="margin-bottom: 12px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 4px solid #3b82f6;">
    <strong style="color: #e2e8f0; font-size: 14px;">2. 📄 Instant Text Summarizer</strong>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0; line-height: 1.4;">Condense articles and documents into concise key takeaways.</p>
  </div>

  <div style="margin-bottom: 24px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 4px solid #f59e0b;">
    <strong style="color: #e2e8f0; font-size: 14px;">3. 🎮 Arcade Games</strong>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0; line-height: 1.4;">Play fun mini-games to earn extra credits anytime.</p>
  </div>

  <div style="text-align: center; margin: 28px 0 20px;">
    <a href="https://ai-tools-hub-zeta-flame.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; font-weight: bold; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 8px 20px rgba(124,58,237,0.4);">
      Open AI Tools Dashboard →
    </a>
  </div>

  <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 28px; padding-top: 20px; text-align: center;">
    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">
      This email was sent to <strong>{recipient}</strong> to confirm your registration for AI Tools Hub.
    </p>
    <p style="color: #475569; font-size: 11px; margin: 0;">
      © 2026 AI Tools Hub • All Rights Reserved
    </p>
  </div>
</div>
"""

text = f"Welcome to AI Tools Hub!\nYour registration for {recipient} is successfully completed with +100 Free Pro Credits.\nOpen dashboard: https://ai-tools-hub-zeta-flame.vercel.app/dashboard"
msg.attach(MIMEText(text, "plain"))
msg.attach(MIMEText(html, "html"))

try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12) as server:
        server.login(sender, password)
        server.sendmail(sender, recipient, msg.as_string())
    print(f"SUCCESS: EMAIL SENT TO {recipient} VIA PORT 465 SSL!")
except Exception as e:
    print(f"Port 465 SSL failed for {recipient}: {e}. Retrying Port 587...")
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=12) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, recipient, msg.as_string())
        print(f"SUCCESS: EMAIL SENT TO {recipient} VIA PORT 587 STARTTLS!")
    except Exception as e2:
        print(f"ERROR: FAILED TO SEND TO {recipient}: {e2}")
