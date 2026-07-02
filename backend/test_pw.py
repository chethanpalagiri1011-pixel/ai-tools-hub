from app.core.security import verify_password
import sys

pw = sys.argv[1]
hashed = sys.argv[2]
try:
    print(verify_password(pw, hashed))
except Exception as e:
    print("Error:", e)
