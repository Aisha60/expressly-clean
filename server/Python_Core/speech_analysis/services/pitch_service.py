
import numpy as np

def analyze_pitch_variation(chunk_features, monotone_threshold=0.15):
    """
    Calculate pitch variation for each chunk and total pitch variation.
    Normalize by pitch range to handle male and female pitch differences.
    
    Args:
        chunk_features: List of dictionaries with pitch features per chunk.
        monotone_threshold: Relative pitch variation threshold (e.g., 0.15 = 15% of pitch range).
    
    Returns:
        Dictionary with per-chunk pitch variations and total pitch variation.
    """
    pitch_data = []
    monotone_chunks = 0
    
    for ch in chunk_features:
        mean_pitch = float(ch.get("pitch_mean", 0))
        pitch_std = float(np.sqrt(ch.get("pitch_variance", 0))) if ch.get("pitch_variance") else 0.0
        pitch_max = float(ch.get("pitch_max", mean_pitch)) if ch.get("pitch_max") else mean_pitch
        pitch_min = float(ch.get("pitch_min", mean_pitch)) if ch.get("pitch_min") else mean_pitch
        pitch_range = pitch_max - pitch_min if pitch_max > pitch_min else 1.0  # Avoid division by zero
        
        # Normalize pitch variation by pitch range
        relative_variation = pitch_std / pitch_range if pitch_range > 0 else 0.0
        is_monotone = bool(relative_variation < monotone_threshold)
        if is_monotone:
            monotone_chunks += 1
            
        pitch_data.append({
            "chunk_index": int(ch["chunk_index"]),
            "start_time": float(ch.get("start_time", 0)),
            "end_time": float(ch.get("end_time", 0)),
            "mean_pitch": mean_pitch,
            "pitch_std": pitch_std,
            "pitch_range": pitch_range,
            "relative_variation": relative_variation,
            "is_monotone": is_monotone
        })
    
    # Calculate total pitch variation (average of relative variations)
    total_pitch_variation = float(np.mean([p["relative_variation"] for p in pitch_data])) if pitch_data else 0.0
    
    overall = {
        "avg_mean_pitch": float(np.mean([p["mean_pitch"] for p in pitch_data])) if pitch_data else 0.0,
        "avg_pitch_std": float(np.mean([p["pitch_std"] for p in pitch_data])) if pitch_data else 0.0,
        "avg_relative_variation": total_pitch_variation,
        "monotone_chunks": int(monotone_chunks),
        "total_chunks": int(len(pitch_data))
    }
    
    return {
        "overall": overall,
        "chunks": pitch_data,
        "total_pitch_variation": total_pitch_variation
    }
