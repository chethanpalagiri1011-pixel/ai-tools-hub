from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.models import User, GenerationHistory
from app.core.security import get_current_user, verify_password, get_password_hash

router = APIRouter()

class UpdateUserRequest(BaseModel):
    name: str | None = None
    phone: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class RewardRequest(BaseModel):
    amount: int = 20
    game: str = "arcade"

@router.get("/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "plan": current_user.plan,
        "credits": current_user.credits,
        "created_at": current_user.created_at,
    }

@router.put("/me")
async def update_profile(
    data: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.name:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "name": current_user.name, "phone": current_user.phone}

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    current_user.password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.get("/me/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(GenerationHistory).filter(GenerationHistory.user_id == current_user.id).all()
    return {
        "total_generations": len(history),
        "images":   len([h for h in history if h.type == "image"]),
        "summaries": len([h for h in history if h.type == "summary"]),
        "captions": len([h for h in history if h.type == "caption"]),
        "prompts":  len([h for h in history if h.type == "prompt"]),
    }

@router.post("/me/reward")
async def reward_credits(
    data: RewardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Cap reward to prevent abuse (max 50 credits per claim)
    amount = min(data.amount, 50)
    current_user.credits += amount
    db.commit()
    return {"message": f"Reward claimed from {data.game}", "credits": current_user.credits, "earned": amount}
