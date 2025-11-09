import re
from nltk.tokenize import word_tokenize
import nltk


try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

FILLER_WORDS = ["um", "uh", "like", "you know", "so", "actually", "basically", "right", "er", "ahm", "well"]

def calculate_fluency(transcription_result):
    """
    Calculates fluency and pacing, then derives clarity score.
    Returns:
      - fluency_score (0-100 scale) -> based on filler words & pauses
      - pacing_score (0-100 scale) -> based on WPM
      - clarity_score (0-100 scale) -> weighted combo of fluency + pacing
      - wpm
      - total_words
      - duration_seconds
      - filler_words_count
      - filler_words (with timestamps)
      - pauses (with timestamps)
    """
    text = transcription_result.get("text", "")
    segments = transcription_result.get("segments", [])

    if not text or not segments:
        return {
            "fluency_score": 0,
            "pacing_score": 0,
            "clarity_score": 0,
            "wpm": 0,
            "total_words": 0,
            "duration_seconds": 0,
            "filler_words_count": 0,
            "filler_words": [],
            "pauses": [],
            "error": "No transcription data"
        }

    # Tokenize words
    words = [w.lower() for w in word_tokenize(text) if w.strip()]
    total_words = len(words)

    # Duration
    duration = segments[-1]["end"] - segments[0]["start"]
    duration = max(duration, 1)  # Prevent division by zero

    # Words Per Minute
    wpm = total_words / (duration / 60.0)

    # Detect filler words
    text_lower = text.lower()
    filler_pattern = r'\b(' + '|'.join(FILLER_WORDS) + r')\b'
    filler_matches = [(m.group(), m.start()) for m in re.finditer(filler_pattern, text_lower)]
    filler_count = len(filler_matches)
    detected_fillers = []

    # Map fillers to timestamps
    word_timestamps = []
    for segment in segments:
        for word_info in segment.get("words", []):
            word = word_info.get("word", "").lower()
            if word:
                word_timestamps.append({
                    "word": word,
                    "start": word_info.get("start"),
                    "end": word_info.get("end")
                })

    for filler, _ in filler_matches:
        for i, wt in enumerate(word_timestamps):
            if wt["word"] == filler:
                detected_fillers.append({
                    "word": filler,
                    "start": round(wt["start"], 2),
                    "end": round(wt["end"], 2)
                })
                word_timestamps.pop(i)  # Prevent reusing the same timestamp
                break

    # Pause detection
    pause_threshold = 0.7  # seconds
    pauses = []
    prev_end = None
    for segment in segments:
        start = segment.get("start")
        if prev_end is not None and start - prev_end >= pause_threshold:
            pauses.append({
                "start": round(prev_end, 2),
                "end": round(start, 2),
                "duration": round(start - prev_end, 2)
            })
        prev_end = segment.get("end")

    # --- Scoring ---

    # Pacing score from WPM (ideal range: 110–160 WPM)
    if wpm < 80:
        pacing_score = max(0, (wpm / 80) * 60)  # very slow
    elif wpm > 180:
        pacing_score = max(0, 100 - ((wpm - 180) / 50) * 40)  # very fast
    else:
        pacing_score = 100  # within ideal range

    pacing_score = round(min(max(pacing_score, 0), 100), 2)

    # Fluency score from fillers & pauses
    filler_ratio = filler_count / max(total_words, 1)
    filler_penalty = min(filler_ratio * 200, 50)   # cap at -50
    pause_penalty = min(len(pauses) * 5, 30)       # cap at -30
    fluency_score = max(100 - (filler_penalty + pause_penalty), 0)
    fluency_score = round(fluency_score, 2)

    # Clarity score = weighted fusion
    clarity_score = round((fluency_score * 0.6) + (pacing_score * 0.4), 2)

    return {
        "fluency_score": fluency_score,
        "pacing_score": pacing_score,
        "clarity_score": clarity_score,
        "wpm": round(wpm, 2),
        "total_words": total_words,
        "duration_seconds": round(duration, 2),
        "filler_words_count": filler_count,
        "filler_words": detected_fillers,
        "pauses": pauses
    }





# FILLER_WORDS = ["um", "uh", "like", "you know", "so", "actually", "basically", "right"]

# def calculate_fluency(transcription_result):
#     """
#     Calculates fluency using Words Per Minute (WPM) and filler words.
#     Returns:
#       - fluency_score (1=poor, 3=average, 5=good)
#       - wpm
#       - total_words
#       - duration_seconds
#       - filler_words_count
#       - filler_words list
#     """
#     text = transcription_result.get("text", "")
#     segments = transcription_result.get("segments", [])

#     if not text or not segments:
#         return {"fluency_score": 0, "wpm": 0, "total_words": 0,
#                 "duration_seconds": 0, "filler_words_count": 0, "filler_words": [], "error": "No transcription data"}

#     words = text.split()
#     total_words = len(words)

#     # Duration = last segment end - first segment start
#     duration = segments[-1]["end"] - segments[0]["start"]
#     duration = max(duration, 1)  # prevent division by zero

#     wpm = total_words / (duration / 60.0)

#     # Count filler words
#     text_lower = text.lower()
#     detected_fillers = [word for word in FILLER_WORDS if word in text_lower]
#     filler_count = len(detected_fillers)

#     # Scoring (example: penalize too many fillers)
#     if wpm < 80 or filler_count > 5:
#         score = 1  # poor
#     elif 80 <= wpm <= 160 and filler_count <= 5:
#         score = 5  # fluent
#     else:
#         score = 3  # average

#     return {
#         "fluency_score": score,
#         "wpm": round(wpm, 2),
#         "total_words": total_words,
#         "duration_seconds": round(duration, 2),
#         "filler_words_count": filler_count,
#         "filler_words": detected_fillers
#     }
