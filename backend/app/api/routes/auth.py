from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.models.models import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.email_service import send_welcome_email

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class WelcomeEmailRequest(BaseModel):
    email: EmailStr
    name: str = "User"

@router.post("/send-welcome-email")
async def trigger_welcome_email(req: WelcomeEmailRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_welcome_email, req.email, req.name)
    return {"status": "success", "message": f"Welcome email dispatch queued for {req.email}"}

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )

    # Create new user
    user = User(
        name=user_in.name,
        email=user_in.email,
        password=get_password_hash(user_in.password),
        credits=100
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Queue automated welcome email notification
    background_tasks.add_task(send_welcome_email, user.email, user.name)

    # Create token
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan,
            "credits": user.credits
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "plan": user.plan, "credits": user.credits}
    }

