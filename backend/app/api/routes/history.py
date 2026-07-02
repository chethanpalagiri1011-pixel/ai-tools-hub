from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, GenerationHistory
from app.core.security import get_current_user

router = APIRouter()

@router.get("/")
async def get_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    items = (
        db.query(GenerationHistory)
        .filter(GenerationHistory.user_id == user.id)
        .order_by(GenerationHistory.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    return [
        {
            "id": h.id, "type": h.type, "prompt": h.prompt,
            "result": h.result, "saved": h.saved,
            "credits_used": h.credits_used,
            "created_at": h.created_at.isoformat()
        }
        for h in items
    ]

@router.delete("/{item_id}")
async def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    item = db.query(GenerationHistory).filter(
        GenerationHistory.id == item_id,
        GenerationHistory.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}

@router.put("/{item_id}/save")
async def toggle_save(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    item = db.query(GenerationHistory).filter(
        GenerationHistory.id == item_id,
        GenerationHistory.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.saved = not item.saved
    db.commit()
    return {"saved": item.saved}

@router.delete("/")
async def clear_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    db.query(GenerationHistory).filter(GenerationHistory.user_id == user.id).delete()
    db.commit()
    return {"message": "History cleared"}
