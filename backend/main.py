from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.models.models import Base
from app.api.routes import auth, users, tools, history, admin

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Tools Hub Backend",
    description="Production API Server for AI Tools Hub Platform",
    version="1.0.0"
)

# Configure CORS Middleware for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tools.router, prefix="/api/tools", tags=["Tools"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "AI Tools Hub Backend API is Live", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "ok"}
