expected_tones = {
    "apology": ["sad", "neutral"],
    "congratulations": ["happy", "excited"],
    "thanks": ["happy", "grateful"],
    "question": ["neutral", "curious"],
    "neutral": ["neutral"]
}

def evaluate_tone(context, overall_emotion):
    expected = expected_tones.get(context, ["neutral"])
    if overall_emotion.lower() in expected:
        return {
            "status": "match",
            "feedback": "✅ Tone matches content."
        }
    else:
        return {
            "status": "mismatch",
            "feedback": f"⚠️ Tone mismatch. For '{context}', expected {expected}, but detected '{overall_emotion}'."
        }

# Via Model
# import numpy as np

# Context-specific expectations (ranges + emotions)
# CONTEXT_RULES = {
#     "job interview": {
#         "pitch_range": (100, 250),     # Hz
#         "energy_range": (0.01, 0.12),  # RMS mean
#         "tempo_range": (90, 160),      # words/min or proxy
#         "pause_ratio_max": 0.3,
#         "expected_emotions": ["neutral", "calm", "confident"]
#     },
#     "presentation": {
#         "pitch_range": (120, 300),
#         "energy_range": (0.02, 0.15),
#         "tempo_range": (110, 180),
#         "pause_ratio_max": 0.25,
#         "expected_emotions": ["enthusiastic", "happy", "confident", "neutral"]
#     },
#     "meeting": {
#         "pitch_range": (100, 260),
#         "energy_range": (0.01, 0.12),
#         "tempo_range": (90, 160),
#         "pause_ratio_max": 0.35,
#         "expected_emotions": ["neutral", "calm", "confident"]
#     },
#     "casual chat": {
#         "pitch_range": (90, 300),
#         "energy_range": (0.01, 0.14),
#         "tempo_range": (100, 200),
#         "pause_ratio_max": 0.5,
#         "expected_emotions": ["happy", "relaxed", "friendly"]
#     }
# }

# def evaluate_tone(context, chunk_features, chunk_emotions):
#     """
#     Evaluate tone appropriateness per chunk and overall score.
#     Uses prosodic + emotional features against context expectations.
    
#     Args:
#         context (str): Predicted overall context (e.g., "presentation").
#         chunk_features (list): Feature dicts from extract_features().
#         chunk_emotions (list): Emotion labels for each chunk.
    
#     Returns:
#         dict with per_chunk results and overall_score (0–1).
#     """
#     if not context:
#         context = "meeting"  # fallback default
#     context = context.lower()
#     if context not in CONTEXT_RULES:
#         context = "meeting"
#     rules = CONTEXT_RULES[context]

#     per_chunk_results = []
#     weighted_sum, total_weight = 0.0, 0.0

#     for i, feats in enumerate(chunk_features):
#         if not feats:
#             continue

#         # Get features
#         pitch_mean = feats.get("pitch_mean", 0.0)
#         energy = feats.get("rms_mean", 0.0)
#         energy_var = feats.get("rms_var", 0.0)
#         tempo = feats.get("tempo", 0.0)
#         pause_ratio = feats.get("pause_ratio", 0.0)
#         duration = feats.get("duration", 1.0)
#         emotion = (chunk_emotions[i] if i < len(chunk_emotions) else "unknown").lower()

#         # --- Pitch placement score
#         pmin, pmax = rules["pitch_range"]
#         if pmin <= pitch_mean <= pmax:
#             pitch_score = 1.0
#         else:
#             pitch_score = 0.5 if pitch_mean > 0 else 0.0

#         # --- Energy score
#         emin, emax = rules["energy_range"]
#         energy_score = 1.0 if emin <= energy <= emax else 0.5

#         # --- Energy variance score (expressiveness)
#         energy_var_score = 1.0 if energy_var > 0.001 else 0.5

#         # --- Tempo score
#         tmin, tmax = rules["tempo_range"]
#         tempo_score = 1.0 if tmin <= tempo <= tmax else 0.5

#         # --- Pause ratio score
#         pause_score = 1.0 if pause_ratio <= rules["pause_ratio_max"] else 0.5

#         # --- Emotion score
#         emotion_score = 1.0 if emotion in rules["expected_emotions"] else 0.0

#         # --- Final chunk score (weighted)
#         final_score = (
#             0.2 * pitch_score +
#             0.2 * energy_score +
#             0.15 * energy_var_score +
#             0.15 * tempo_score +
#             0.1 * pause_score +
#             0.2 * emotion_score
#         )

#         per_chunk_results.append({
#             "chunk_index": feats.get("chunk_index", i),
#             "start_time": feats.get("start_time", 0),
#             "end_time": feats.get("end_time", 0),
#             "pitch_mean": round(pitch_mean, 2),
#             "energy_rms": round(energy, 4),
#             "energy_var": round(energy_var, 6),
#             "tempo": round(tempo, 2),
#             "pause_ratio": round(pause_ratio, 3),
#             "emotion": emotion,
#             "scores": {
#                 "pitch": round(pitch_score, 2),
#                 "energy": round(energy_score, 2),
#                 "energy_var": round(energy_var_score, 2),
#                 "tempo": round(tempo_score, 2),
#                 "pause": round(pause_score, 2),
#                 "emotion": round(emotion_score, 2)
#             },
#             "final_score": round(final_score, 3)
#         })

#         weighted_sum += final_score * duration
#         total_weight += duration

#     overall_score = round(weighted_sum / total_weight, 3) if total_weight > 0 else 0.0

#     return {
#         "per_chunk": per_chunk_results,
#         "overall_score": overall_score
#     }
