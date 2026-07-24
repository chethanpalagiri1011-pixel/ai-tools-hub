from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, GenerationHistory, Feedback
from app.core.security import get_current_user

router = APIRouter()

def safe_str(val):
    if val is None:
        return ""
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    if hasattr(val, 'value'):
        return str(val.value)
    return str(val)

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        total_users = db.query(User).count()
    except Exception:
        total_users = 0

    try:
        total_generations = db.query(GenerationHistory).count()
    except Exception:
        total_generations = 0

    try:
        images_count = db.query(GenerationHistory).filter(GenerationHistory.type == "image").count()
        summaries_count = db.query(GenerationHistory).filter(GenerationHistory.type == "summary").count()
        captions_count = db.query(GenerationHistory).filter(GenerationHistory.type == "caption").count()
        prompts_count = db.query(GenerationHistory).filter(GenerationHistory.type == "prompt").count()
    except Exception:
        images_count = summaries_count = captions_count = prompts_count = 0

    # Recent Users
    recent_users = []
    try:
        users_db = db.query(User).order_by(User.created_at.desc()).limit(15).all()
        for u in users_db:
            recent_users.append({
                "id": u.id,
                "name": u.name or "User",
                "email": u.email or "",
                "plan": safe_str(u.plan) or "Free",
                "credits": u.credits if u.credits is not None else 50,
                "created_at": safe_str(u.created_at)
            })
    except Exception as e:
        print("Users query error:", e)

    # Recent Activity
    recent_activity = []
    try:
        act_db = db.query(GenerationHistory).order_by(GenerationHistory.created_at.desc()).limit(15).all()
        for act in act_db:
            act_user = db.query(User).filter(User.id == act.user_id).first()
            recent_activity.append({
                "id": act.id,
                "user_name": act_user.name if act_user else "Member",
                "type": act.type or "tool",
                "prompt": act.prompt or "Generation task",
                "credits_used": act.credits_used or 1,
                "created_at": safe_str(act.created_at)
            })
    except Exception as e:
        print("Activity query error:", e)

    # Recent Feedback
    recent_feedback = []
    try:
        fb_db = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(15).all()
        for fb in fb_db:
            recent_feedback.append({
                "id": fb.id,
                "user_name": fb.user_name or "Member",
                "tool_type": fb.tool_type or "general",
                "rating": fb.rating if fb.rating else 5,
                "comment": fb.comment or "",
                "created_at": safe_str(fb.created_at)
            })
    except Exception as e:
        print("Feedback query error:", e)

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
        "recent_activity": recent_activity,
        "recent_feedback": recent_feedback
    }
