# Python_Core/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers from both modules
from bodylang_Analysis.analyzer import router as video_router
from text_Analysis.analyzer import router as text_router

app = FastAPI(title="Expressly Python Core")

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
