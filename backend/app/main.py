from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.db.database import engine, Base
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Validate critical environment variables at startup
def _validate_startup_config():
    """Validate required environment variables for AI features."""
    missing_vars = []
    
    # Check for OpenAI credentials if diagnostic AI is enabled
    if os.getenv("ENABLE_DIAGNOSTIC_AI", "true").lower() in ["true", "1", "yes"]:
        if not os.getenv("OPENAI_API_KEY"):
            missing_vars.append("OPENAI_API_KEY")
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        logger.error(f"Startup validation failed: {error_msg}")
        raise RuntimeError(error_msg)
    
    logger.info("✅ Startup validation passed")

# Run validation before initializing app
_validate_startup_config()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ETDP SETA AI Mathematics Teacher Assistant API",
    description="Backend API for AI-powered mathematics education platform",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "ETDP SETA AI Mathematics Teacher Assistant API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
