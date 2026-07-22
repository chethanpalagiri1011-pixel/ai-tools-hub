from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import routers
from app.api.routes import auth, users, tools, history, admin

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Tools Hub API",
    description="Backend API for AI Tools Hub SaaS platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    redirect_slashes=False
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://ai-tools-hub-zeta-flame.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router,    prefix="/api/auth",    tags=["Authentication"])
app.include_router(users.router,   prefix="/api/users",   tags=["Users"])
app.include_router(tools.router,   prefix="/api/tools",   tags=["AI Tools"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(admin.router,   prefix="/api/admin",   tags=["Admin Analytics"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "AI Tools Hub API — visit /api/docs for documentation"}
