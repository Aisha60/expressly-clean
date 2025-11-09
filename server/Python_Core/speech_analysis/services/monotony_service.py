# services/monotony_service.py

def detect_monotony(chunk_features, threshold=100):
    """
    Detects monotone sections in speech based on pitch variance.
    
    Args:
        chunk_features (list): List of chunk feature dicts from features.json
        threshold (float): Variance threshold below which chunk is considered monotonous

    Returns:
        dict with:
            - monotonous_sections: list of chunks with low pitch variance
            - total_monotonous: number of monotone chunks
            - total_chunks: total number of chunks
            - monotony_score: simple ratio score (higher = more monotone)
    """
    monotonous_sections = []

    for chunk in chunk_features:
        if chunk["pitch_variance"] < threshold:
            monotonous_sections.append({
                "chunk_index": chunk["chunk_index"],
                "start_time": chunk["start_time"],
                "end_time": chunk["end_time"],
                "pitch_variance": chunk["pitch_variance"]
            })

    total_chunks = len(chunk_features)
    total_monotonous = len(monotonous_sections)
    monotony_score = round(total_monotonous / total_chunks, 2) if total_chunks > 0 else 0

    return {
        "monotonous_sections": monotonous_sections,
        "total_monotonous": total_monotonous,
        "total_chunks": total_chunks,
        "monotony_score": monotony_score
    }
