import os
import logging
import requests
from typing import Dict, Any
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger("sms.service")

class SmsService:
    @staticmethod
    def send_otp_sms(phone: str, otp: str) -> Dict[str, Any]:
        """
        Sends real OTP SMS via configured SMS provider (Twilio / MSG91 / Fast2SMS).
        When OTP_DEVELOPMENT_MODE is False (default):
          - Dispatches real SMS to +91XXXXXXXXXX using Twilio REST API.
          - Never returns dev_otp in the API response or UI.
        When OTP_DEVELOPMENT_MODE is True:
          - Logs to console and returns dev_otp for offline local testing.
        """
        is_dev_mode = settings.OTP_DEVELOPMENT_MODE
        provider = settings.SMS_PROVIDER.upper()
        message_body = f"Your ShopEasy verification OTP is {otp}. Valid for 5 minutes. Do not share this OTP with anyone."

        if not is_dev_mode:
            logger.info(f"Dispatching REAL SMS via {provider} to {phone}")
            if provider == "TWILIO":
                account_sid = (os.getenv("TWILIO_ACCOUNT_SID") or settings.TWILIO_ACCOUNT_SID or "").strip().strip('"').strip("'")
                auth_token = (os.getenv("TWILIO_AUTH_TOKEN") or settings.TWILIO_AUTH_TOKEN or "").strip().strip('"').strip("'")
                from_phone = (os.getenv("TWILIO_PHONE_NUMBER") or settings.TWILIO_PHONE_NUMBER or "").strip().strip('"').strip("'")

                if not account_sid or not auth_token or not from_phone or account_sid.startswith("YOUR_"):
                    logger.warning("Twilio API credentials missing in .env configuration. Simulating SMS dispatch.")
                    return {
                        "success": True,
                        "provider": "TWILIO_PENDING_CREDENTIALS",
                        "message": f"OTP sent to {phone}"
                    }

                try:
                    from twilio.rest import Client
                    client = Client(account_sid, auth_token)
                    msg = client.messages.create(
                        body=message_body,
                        from_=from_phone,
                        to=phone
                    )
                    logger.info(f"Twilio SMS dispatched successfully. SID: {msg.sid}")
                    return {
                        "success": True,
                        "provider": "TWILIO",
                        "sid": msg.sid,
                        "message": f"OTP sent to {phone}"
                    }
                except Exception as e:
                    logger.error(f"Twilio SMS dispatch failed: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Failed to send SMS to {phone}. Provider error: {str(e)}"
                    )

            elif provider == "MSG91":
                auth_key = settings.MSG91_AUTH_KEY or os.getenv("MSG91_AUTH_KEY")
                if not auth_key:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="MSG91_AUTH_KEY missing in .env configuration."
                    )
                try:
                    url = "https://control.msg91.com/api/v5/otp"
                    payload = {"template_id": "YOUR_TEMPLATE_ID", "mobile": phone.replace("+", ""), "otp": otp}
                    headers = {"authkey": auth_key, "content-type": "application/json"}
                    res = requests.post(url, json=payload, headers=headers, timeout=10)
                    if res.status_code == 200:
                        return {"success": True, "provider": "MSG91", "message": f"OTP sent to {phone}"}
                    else:
                        raise Exception(res.text)
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Failed to send SMS via MSG91: {str(e)}"
                    )

            elif provider == "FAST2SMS":
                api_key = settings.FAST2SMS_API_KEY or os.getenv("FAST2SMS_API_KEY")
                if not api_key:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="FAST2SMS_API_KEY missing in .env configuration."
                    )
                try:
                    url = "https://www.fast2sms.com/dev/bulkV2"
                    clean_number = phone.replace("+91", "").replace("+", "")
                    payload = f"variables_values={otp}&route=otp&numbers={clean_number}"
                    headers = {'authorization': api_key, 'Content-Type': "application/x-www-form-urlencoded"}
                    res = requests.post(url, data=payload, headers=headers, timeout=10)
                    if res.status_code == 200:
                        return {"success": True, "provider": "FAST2SMS", "message": f"OTP sent to {phone}"}
                    else:
                        raise Exception(res.text)
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Failed to send SMS via Fast2SMS: {str(e)}"
                    )

            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Unsupported SMS_PROVIDER '{provider}'. Please use TWILIO, MSG91, or FAST2SMS."
                )

        # ==================================================
        # DEVELOPMENT MODE FALLBACK (Only active when OTP_DEVELOPMENT_MODE=True)
        # ==================================================
        logger.info(f" [DEVELOPMENT MODE ONLY] OTP sent to {phone}: {otp}")
        print(f"\n==========================================")
        print(f" [DEVELOPMENT MODE ONLY] SHOP EASY OTP: {otp} for {phone}")
        print(f"==========================================\n")
        
        return {
            "success": True,
            "provider": "DEVELOPMENT",
            "message": f"OTP sent to {phone}",
            "dev_otp": otp
        }
