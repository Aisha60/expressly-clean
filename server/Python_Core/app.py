# Python_Core/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers from all modules
from bodylang_Analysis.analyzer import router as video_router
from text_Analysis.analyzer import router as text_router
from speech_analysis.analyzer import router as speech_router

app = FastAPI(title="Expressly Python Core - Unified Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(video_router)
app.include_router(text_router)
app.include_router(speech_router)

@app.get("/")
def root():
    return {
        "service": "Expressly Python Core",
        "modules": ["text_analysis", "body_language_analysis", "speech_analysis"],
        "status": "active"
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "unified_python_core"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
