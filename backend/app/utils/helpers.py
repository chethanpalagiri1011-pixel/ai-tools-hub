import uuid
import re

def generate_tracking_number() -> str:
    return f"TRK-{uuid.uuid4().hex[:10].upper()}"

def generate_transaction_id() -> str:
    return f"TXN-{uuid.uuid4().hex[:12].upper()}"

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text
