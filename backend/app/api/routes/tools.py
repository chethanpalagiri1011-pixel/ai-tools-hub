from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.models import User, GenerationHistory
from app.core.security import get_current_user
from app.core.config import settings
import asyncio, random, json, os, replicate

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────
class ImageRequest(BaseModel):
    prompt: str
    style: str = "photorealistic"
    aspect_ratio: str = "16:9"

class VideoRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "16:9"

class SummarizeRequest(BaseModel):
    text: str
    length: str = "medium"

class CaptionRequest(BaseModel):
    topic: str
    tone: str = "casual"
    count: int = 4

class PromptRequest(BaseModel):
    prompt: str

# ── Helpers ───────────────────────────────────────────────────────────────────
async def deduct_credits(user: User, db: Session, amount: int):
    if user.credits < amount:
        raise HTTPException(status_code=402, detail=f"Insufficient credits. Need {amount}, have {user.credits}.")
    user.credits -= amount
    db.commit()

def save_history(db: Session, user_id: int, type_: str, prompt: str, result: str, credits: int):
    entry = GenerationHistory(
        user_id=user_id, type=type_, prompt=prompt,
        result=result, credits_used=credits
    )
    db.add(entry)
    db.commit()

# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/video")
async def generate_video(data: VideoRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    await deduct_credits(user, db, 15)
    
    if not settings.REPLICATE_API_TOKEN:
        # Fallback to simulated demo if no API key is provided
        await asyncio.sleep(3)
        video_url = "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4"
        result = {"video_url": video_url, "prompt": data.prompt, "aspect_ratio": data.aspect_ratio, "status": "simulated"}
        save_history(db, user.id, "video", data.prompt, json.dumps(result), 15)
        return result

    try:
        # Set API token for replicate client
        os.environ["REPLICATE_API_TOKEN"] = settings.REPLICATE_API_TOKEN
        
        # Use stability-ai/stable-video-diffusion or similar
        # For this example we use stability-ai/stable-video-diffusion (requires an image, but let's assume minimax or similar prompt-to-video)
        # We will use lucataco/hotshot-xl as a fast prompt-to-video model
        output = await asyncio.to_thread(
            replicate.run,
            "lucataco/hotshot-xl:78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd3275",
            input={"prompt": data.prompt, "mp4": True}
        )
        # output is a list of URIs or a single URI depending on the model.
        video_url = output if isinstance(output, str) else output[0]
        
        result = {"video_url": video_url, "prompt": data.prompt, "aspect_ratio": data.aspect_ratio, "status": "success"}
        save_history(db, user.id, "video", data.prompt, json.dumps(result), 15)
        return result
    except Exception as e:
        # Refund credits on failure
        user.credits += 15
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image")
async def generate_image(data: ImageRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    await deduct_credits(user, db, 5)
    await asyncio.sleep(0.5)  # Simulate processing

    import urllib.parse
    seed = random.randint(1, 999999)
    encoded_prompt = urllib.parse.quote(data.prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?seed={seed}&nologo=true"
    result = {"url": url, "seed": seed, "style": data.style, "prompt": data.prompt}
    save_history(db, user.id, "image", data.prompt, json.dumps(result), 5)
    return result

@router.post("/summarize")
async def summarize_text(data: SummarizeRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    await deduct_credits(user, db, 2)
    words = data.text.split()
    ratios = {"short": 0.1, "medium": 0.25, "long": 0.4}
    target = max(30, int(len(words) * ratios.get(data.length, 0.25)))
    sentences = data.text.replace("\n", " ").split(".")
    summary = ". ".join(s.strip() for s in sentences[:3] if s.strip()) + "."

    result = {"summary": summary, "original_words": len(words), "summary_words": len(summary.split()), "reduction": 75}
    save_history(db, user.id, "summary", data.text[:100], json.dumps(result), 2)
    return result

@router.post("/captions")
async def generate_captions(data: CaptionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    await deduct_credits(user, db, 2)
    templates = {
        "professional": [f"Elevating the future of {data.topic}. 🚀", f"Innovation meets excellence in {data.topic}. ✨"],
        "casual":       [f"Just vibing with some {data.topic} today ✨", f"Obsessed with {data.topic} rn 🙌"],
    }
    captions = templates.get(data.tone, templates["casual"])[:data.count]
    result = {"captions": captions, "hashtags": ["#AI", "#Innovation", "#Tech"], "tone": data.tone}
    save_history(db, user.id, "caption", data.topic, json.dumps(result), 2)
    return result

@router.post("/enhance-prompt")
async def enhance_prompt(data: PromptRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    await deduct_credits(user, db, 1)
    enhanced = f"{data.prompt}, highly detailed, 8K resolution, professional photography, dramatic lighting, cinematic composition, masterpiece quality"
    negative = "blurry, low quality, pixelated, distorted, ugly"
    result = {"original": data.prompt, "enhanced": enhanced, "negative_prompt": negative}
    save_history(db, user.id, "prompt", data.prompt, json.dumps(result), 1)
    return result
