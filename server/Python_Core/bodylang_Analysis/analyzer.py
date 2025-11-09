
from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import logging

# scoring orchestrator (uses score_posture/gestures/expressions internally)
from .scoring import score_video

# unified processing pipeline (returns frames + meta + warnings) + validation
from .video_processing import process_video, validate_video

# # FastAPI setup
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("analyzer")

# Make sure UPLOAD_DIR points to the server/uploads folder
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

logger.info("FASTAPI UPLOAD DIR: %s", UPLOAD_DIR)


class VideoRequest(BaseModel):
    filename: str
    # sampling control (how many frames to skip; 1 = every frame)
    frame_skip: int = 3


@router.post("/analyze")
async def analyze_video(req: VideoRequest):
    """
    Expects JSON: { "filename": "yourfile.webm", "frame_skip": 3 }
    - process_video(...) extracts landmarks with sampling
    - validate_video(...) ensures the video is suitable (may allow partial modalities)
    - score_video(...) runs scoring using the validated analysis_mode
    - Returns analysis + meta + flags; or a clear error when invalid
    """
    file_path = os.path.join(UPLOAD_DIR, req.filename)
    logger.info("Analyzing video at: %s (frame_skip=%s)", file_path, req.frame_skip)

    if not os.path.exists(file_path):
        logger.warning("File not found: %s", file_path)
        raise HTTPException(status_code=404, detail={"error": f"File '{req.filename}' not found in uploads."})

    try:
        # Process video (single pass). Respect client's frame_skip but ensure >=1
        frame_skip = max(1, int(req.frame_skip or 3))
        processed = process_video(file_path, frame_skip=frame_skip)

        # Extract meta and processing warnings
        meta = processed.get("meta", {})
        processing_warnings = meta.get("warnings", [])

        # Validate processed results (decides usable modalities, flags, metrics)
        validation = validate_video(processed)

        # If invalid -> return clear error response (no analysis payload)
        if not validation.get("valid", False):
            logger.info("Validation failed for %s: %s", req.filename, validation.get("reason"))
            return {
                "analysis": None,
                "meta": {"warnings": validation.get("flags", []), **meta},
                "error": validation.get("reason", "Video failed validation. Ensure the video contains a visible person."),
                "suggestion": "Please upload a video with a person facing the camera and visible upper body, hands, and face."
            }

        # Attach analysis_mode into processed so score_video can inspect it
        processed["analysis_mode"] = validation.get("analysis_mode", {})

        # Merge validation metrics into meta for transparency
        meta.setdefault("validation", {})
        meta["validation"].update(validation.get("metrics", {}))
        # Combine warnings/flags for frontend
        combined_flags = list(processing_warnings or []) + list(validation.get("flags", []))

        # Run scoring (score_video should read processed + processed["analysis_mode"])
        analysis = score_video(processed)

        response = {
            "analysis": analysis,
            "meta": meta,
            "flags": combined_flags,
        }
        print("Response meta:", response["meta"])
        return response

    except HTTPException:
        # re-raise HTTPExceptions so FastAPI returns them as-is
        raise
    except Exception as e:
        logger.exception("Failed to process video: %s", str(e))
        # 500 for unexpected server-side errors
        raise HTTPException(status_code=500, detail={"error": "Failed to process video", "details": str(e), "suggestion": "Try re-uploading the video or contact support."})


# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
