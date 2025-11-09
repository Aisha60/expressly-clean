# speech_analysis/analyzer.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import librosa
import noisereduce as nr
import soundfile as sf
import os
import numpy as np
import json
from datetime import datetime

# Import speech analysis services
from .utils.audio_utils import split_audio_into_chunks, extract_features
from .services.transcribe_audio import transcribe_audio
from .services.fluency_service import calculate_fluency
from .services.context_service import detect_overall_context
from .services.emotion_service import aggregate_emotions
from .services.tone_evaluator import evaluate_tone
from .services.pronunciation_service import assess_pronunciation_from_transcription
from .services.pitch_service import analyze_pitch_variation
from .services.scoring_service import calculate_scores
import nltk

# Ensure NLTK resources
for pkg in ["words", "punkt"]:
    try:
        nltk.data.find(f"{'corpora' if pkg=='words' else 'tokenizers'}/{pkg}")
    except LookupError:
        nltk.download(pkg)

router = APIRouter(prefix="/speech", tags=["Speech Analysis"])

# Define base directory for speech analysis files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
PROCESSED_DIR = os.path.join(BASE_DIR, "processed")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
CHUNKS_DIR = os.path.join(BASE_DIR, "chunks")

# Ensure folders exist
for folder in [UPLOADS_DIR, PROCESSED_DIR, TEMP_DIR, CHUNKS_DIR]:
    os.makedirs(folder, exist_ok=True)


class ProcessAudioRequest(BaseModel):
    filePath: str
    outputPath: str


class EvaluateFeatureRequest(BaseModel):
    audioData: str | None = None
    feature: str | None = None
    question: str | None = None


def generate_performance_summary(scoring_result, pitch_result):
    scores = scoring_result["scores"]
    monotone_chunks = pitch_result["overall"]["monotone_chunks"]
    total_chunks = pitch_result["overall"]["total_chunks"]

    strengths, improvements, recommendations = [], [], []

    if scores.get("pronunciation", 0) >= 80:
        strengths.append("Clear and accurate pronunciation.")
    if scores.get("fluency", 0) >= 80:
        strengths.append("Smooth and natural speech flow.")
    if scores.get("pitch", 0) >= 80:
        strengths.append("Expressive pitch variation.")
    if scores.get("tone", 0) >= 80:
        strengths.append("Positive and engaging tone.")

    if scores.get("pronunciation", 0) < 70:
        improvements.append("Work on clearer pronunciation of words.")
    if scores.get("fluency", 0) < 70:
        improvements.append("Practice smoother transitions between words.")
    if scores.get("pitch", 0) < 70:
        improvements.append(f"Low pitch variation detected. Try varying your pitch more.")
    if scores.get("tone", 0) < 70:
        improvements.append("Adjust tone to be more positive or neutral.")

    if scores.get("pitch", 0) < 70:
        recommendations.append("Practice emphasizing key words to increase pitch variation.")
    if scores.get("fluency", 0) < 70:
        recommendations.append("Read aloud or practice tongue twisters to improve speech fluency.")
    if scores.get("pronunciation", 0) < 70:
        recommendations.append("Use pronunciation exercises or mimic native speakers.")
    if monotone_chunks > 0:
        recommendations.append("Try expressive reading or storytelling.")

    return {
        "strengths": ", ".join(strengths) if strengths else "No specific strengths identified yet. Keep practicing!",
        "improvements": ", ".join(improvements) if improvements else "No major areas for improvement. Great job!",
        "recommendations": ", ".join(recommendations) if recommendations else "Continue practicing to maintain your performance!"
    }


@router.post("/process-audio")
def process_audio(payload: ProcessAudioRequest):
    try:
        file_path = payload.filePath
        output_path = payload.outputPath
        print(f"[SPEECH] Processing: {file_path} -> {output_path}")
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail="File not found")

        sr = 16000
        y, _ = librosa.load(file_path, sr=sr, mono=True)
        duration = len(y) / sr
        
        if duration < 2:
            raise HTTPException(status_code=400, detail="Audio too short. Minimum 2 seconds required.")
        elif duration > 120:
            y = y[:int(120 * sr)]

        noise_clip = y[0:int(0.5 * sr)]
        y_clean = nr.reduce_noise(y=y, sr=sr, y_noise=noise_clip, prop_decrease=0.75)

        if not output_path.lower().endswith(".wav"):
            output_path = os.path.splitext(output_path)[0] + ".wav"

        sf.write(output_path, y_clean, sr)

        chunks = split_audio_into_chunks(y_clean, sr, chunk_duration=5)
        chunk_features = [extract_features(chunk_data, sr, idx, start, end) 
                         for idx, (chunk_data, start, end) in enumerate(chunks)
                         if extract_features(chunk_data, sr, idx, start, end) is not None]

        transcription_result = transcribe_audio(output_path)
        if "error" in transcription_result:
            raise HTTPException(status_code=500, detail=transcription_result["error"])
        
        transcription_text = transcription_result.get("text", "")
        transcription_filename = os.path.splitext(os.path.basename(file_path))[0] + "_transcription.txt"
        transcription_path = os.path.join(PROCESSED_DIR, transcription_filename)
        with open(transcription_path, "w", encoding="utf-8") as f:
            f.write(transcription_text)

        pronunciation_result = assess_pronunciation_from_transcription(transcription_result)
        fluency_result = calculate_fluency(transcription_result)
        pitch_result = analyze_pitch_variation(chunk_features, monotone_threshold=0.15)
        
        overall_context, chunk_contexts = detect_overall_context(transcription_text)
        overall_emotion, chunk_emotions = aggregate_emotions(chunk_features)
        tone_result = evaluate_tone(overall_context, str(overall_emotion))

        scoring_result = calculate_scores(pronunciation_result, fluency_result, pitch_result, tone_result)
        summary = generate_performance_summary(scoring_result, pitch_result)

        now = datetime.now()
        recording_info = {
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M:%S"),
            "duration": f"{duration:.1f} seconds"
        }

        return {
            "message": "File processed successfully",
            "filePath": output_path,
            "transcription": transcription_result,
            "pronunciation": pronunciation_result,
            "fluency": fluency_result,
            "pitch": pitch_result,
            "toneAnalysis": {
                "overallContext": overall_context,
                "overallEmotion": str(overall_emotion),
                "evaluation": tone_result
            },
            "scoring": scoring_result,
            "summary": summary,
            "recordingInfo": recording_info
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[SPEECH ERROR]: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-feature")
def evaluate_feature(payload: EvaluateFeatureRequest):
    temp_path = None
    try:
        audio_data = payload.audioData
        feature = payload.feature

        if not audio_data:
            raise HTTPException(status_code=400, detail="No audio data provided")
        if feature not in ["Pronunciation", "Fluency", "Tone", "Pitch"]:
            raise HTTPException(status_code=400, detail="Invalid feature")

        import base64
        audio_bytes = base64.b64decode(audio_data)

        timestamp = int(datetime.now().timestamp() * 1000)
        temp_path = os.path.join(TEMP_DIR, f"{timestamp}.wav")

        with open(temp_path, "wb") as f:
            f.write(audio_bytes)

        y, sr = librosa.load(temp_path, sr=None)
        duration = librosa.get_duration(y=y, sr=sr)
        
        if duration < 2:
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Audio too short.")

        try:
            noise_clip = y[0:int(0.5 * sr)]
            y_clean = nr.reduce_noise(y=y, sr=sr, y_noise=noise_clip)
        except:
            y_clean = y

        chunks = split_audio_into_chunks(y_clean, sr, chunk_duration=5)
        chunk_features = [extract_features(chunk_data, sr, idx, start, end) 
                         for idx, (chunk_data, start, end) in enumerate(chunks)
                         if extract_features(chunk_data, sr, idx, start, end) is not None]

        transcription_result = transcribe_audio(temp_path)
        if "error" in transcription_result:
            os.remove(temp_path)
            raise HTTPException(status_code=500, detail=transcription_result["error"])

        transcription_text = transcription_result.get("text", "")

        result, score = None, 0
        if feature == "Pronunciation":
            result = assess_pronunciation_from_transcription(transcription_result)
            score = 1 if result.get("score_percent", 0) >= 80 else 0
        elif feature == "Fluency":
            result = calculate_fluency(transcription_result)
            score = 1 if result.get("fluency_score", 0) >= 80 else 0
        elif feature == "Tone":
            overall_context, _ = detect_overall_context(transcription_text)
            overall_emotion, _ = aggregate_emotions(chunk_features)
            result = evaluate_tone(overall_context, str(overall_emotion))
            score = 1 if result.get("score", 0) >= 80 else 0
        elif feature == "Pitch":
            pitch_result = analyze_pitch_variation(chunk_features, monotone_threshold=0.15)
            result = pitch_result
            monotone_ratio = pitch_result["overall"]["monotone_chunks"] / max(pitch_result["overall"]["total_chunks"], 1)
            score = 1 if monotone_ratio < 0.3 else 0

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        return {
            "scoring": {"scores": {feature.lower(): score * 100}, "overallScore": score * 100},
            "feature": feature,
            "result": result,
            "isCorrect": score == 1,
            "feedback": f"Good {feature.lower()}!" if score == 1 else f"Work on {feature.lower()}."
        }

    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health():
    """Health check for speech analysis module."""
    try:
        from .services.transcribe_audio import model as whisper_model
        status = "ok" if whisper_model is not None else "degraded"
        return {"status": status, "module": "speech_analysis"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
