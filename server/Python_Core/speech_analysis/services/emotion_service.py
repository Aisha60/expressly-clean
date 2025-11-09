from collections import Counter

def detect_emotion_chunk(chunk):
    """
    Rule-based emotion detection from chunk features.
    Input: dict with 'pitch_variance', 'pitch_mean', etc.
    """
    pitch_std = (chunk.get("pitch_variance", 0) ** 0.5)

    if pitch_std < 30:
        return "neutral"
    elif pitch_std < 200:
        return "sad"
    elif pitch_std < 1000:
        return "happy"
    else:
        return "excited"

def aggregate_emotions(chunk_features):
    """
    Detect emotion for each audio chunk and compute overall emotion.
    Returns overall emotion and list of chunk-level emotions.
    """
    chunk_emotions = []
    for ch in chunk_features:
        em = detect_emotion_chunk(ch)
        chunk_emotions.append(em)

    overall_emotion = Counter(chunk_emotions).most_common(1)[0][0]
    return overall_emotion, chunk_emotions
