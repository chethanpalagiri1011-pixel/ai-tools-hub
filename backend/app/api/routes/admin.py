from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, GenerationHistory
from app.core.security import get_current_user

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate overall analytics
    total_users = db.query(User).count()
    total_generations = db.query(GenerationHistory).count()

    images_count = db.query(GenerationHistory).filter(GenerationHistory.type == "image").count()
    summaries_count = db.query(GenerationHistory).filter(GenerationHistory.type == "summary").count()
    captions_count = db.query(GenerationHistory).filter(GenerationHistory.type == "caption").count()
    prompts_count = db.query(GenerationHistory).filter(GenerationHistory.type == "prompt").count()

    # Recent user registrations
    recent_users_db = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    recent_users = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "plan": u.plan.value if hasattr(u.plan, 'value') else str(u.plan),
            "credits": u.credits,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in recent_users_db
    ]

    # Recent generation activity
    recent_activity_db = db.query(GenerationHistory).order_by(GenerationHistory.created_at.desc()).limit(15).all()
    recent_activity = []
    for act in recent_activity_db:
        act_user = db.query(User).filter(User.id == act.user_id).first()
        recent_activity.append({
            "id": act.id,
            "user_name": act_user.name if act_user else "Unknown User",
            "type": act.type,
            "prompt": act.prompt or "N/A",
            "credits_used": act.credits_used,
            "created_at": act.created_at.isoformat() if act.created_at else None
        })

    return {
        "total_users": total_users,
        "total_generations": total_generations,
        "breakdown": {
            "image": images_count,
            "summary": summaries_count,
            "caption": captions_count,
            "prompt": prompts_count
        },
        "recent_users": recent_users,
        "recent_activity": recent_activity
    }
