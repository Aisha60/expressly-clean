"""Robust transcription service with fallback backends.

Primary: faster-whisper (CPU-friendly, reliable)
Fallback: openai-whisper

Output contract:
- Returns dict { "text": str, "segments": [ {start, end, text} ] }
- On error: { "error": str }
"""

import os

# Configuration: allow overriding model name and compute type via env vars.
# Example envs:
#   FW_MODEL_NAME=tiny
#   FW_COMPUTE=int8
# Default uses a moderately-sized English model for better accuracy.
FW_MODEL_NAME = os.getenv("FW_MODEL_NAME", "base.en")
FW_COMPUTE = os.getenv("FW_COMPUTE", "float32")

# Try faster-whisper first (configurable)
BACKEND = None
FW_MODEL = None
OW_MODEL = None

try:
    from faster_whisper import WhisperModel  # type: ignore
    try:
        print(f"🔄 Loading Faster-Whisper model ({FW_MODEL_NAME}, CPU, compute={FW_COMPUTE})...")
        FW_MODEL = WhisperModel(FW_MODEL_NAME, device="cpu", compute_type=FW_COMPUTE)
        print("✅ Faster-Whisper loaded successfully")
        BACKEND = "faster_whisper"
    except Exception as inner_e:
        print(f"❌ Failed to load faster-whisper model {FW_MODEL_NAME} with compute {FW_COMPUTE}: {inner_e}")
        FW_MODEL = None
        BACKEND = None
except Exception:
    FW_MODEL = None
    BACKEND = None

if BACKEND is None:
    try:
        import whisper  # type: ignore
        print("🔄 Loading OpenAI Whisper model (base.en)...")
        # Use English-only model; avoids language detection path which is buggy in some builds
        OW_MODEL = whisper.load_model("base.en")
        print("✅ OpenAI Whisper loaded successfully")
        BACKEND = "openai_whisper"
    except Exception as e:
        OW_MODEL = None
        BACKEND = None
        print(f"❌ No transcription backend available: {e}")


# Expose a generic `model` variable for backwards compatibility (/health check)
model = FW_MODEL if FW_MODEL is not None else OW_MODEL


def transcribe_audio(file_path: str):
    """Transcribe an audio file and return text + segments or an error."""
    if not file_path or not os.path.exists(file_path):
        return {"error": "File not found"}

    if BACKEND == "faster_whisper" and FW_MODEL is not None:
        try:
            # Force English; base.en doesn't require language-id tokens
            segments, info = FW_MODEL.transcribe(file_path, language="en")
            seg_list = []
            full_text_parts = []
            for seg in segments:
                seg_list.append({
                    "start": float(seg.start) if seg.start is not None else 0.0,
                    "end": float(seg.end) if seg.end is not None else 0.0,
                    "text": seg.text or ""
                })
                if seg.text:
                    full_text_parts.append(seg.text.strip())
            return {"text": " ".join(full_text_parts).strip(), "segments": seg_list}
        except Exception as e:
            return {"error": f"faster-whisper failed: {e}"}

    if BACKEND == "openai_whisper" and OW_MODEL is not None:
        try:
            # English-only model; no language param necessary
            result = OW_MODEL.transcribe(file_path, fp16=False)
            segments = result.get("segments", []) or []
            seg_list = []
            for s in segments:
                seg_list.append({
                    "start": float(s.get("start", 0.0)),
                    "end": float(s.get("end", 0.0)),
                    "text": s.get("text", "")
                })
            return {
                "text": result.get("text", "").strip(),
                "segments": seg_list,
            }
        except Exception as e:
            return {"error": f"openai-whisper failed: {e}"}

    return {"error": "No transcription backend available. Please install faster-whisper or openai-whisper."}
