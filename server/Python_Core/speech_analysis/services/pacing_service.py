def calculate_pacing(transcription_result, pause_threshold=0.7):
    """
    Analyzes pacing using pauses between segments.
    Args:
      transcription_result: dict with "segments" from Whisper
      pause_threshold: min seconds considered a 'pause'
    Returns:
      dict with avg_pause_duration, pause_count, pacing_score
    """
    segments = transcription_result.get("segments", [])
    if not segments or len(segments) < 2:
        return {"pacing_score": 0, "avg_pause_duration": 0, "pause_count": 0, "error": "Not enough data"}

    pauses = []
    for i in range(len(segments) - 1):
        current_end = segments[i]["end"]
        next_start = segments[i + 1]["start"]
        gap = next_start - current_end
        if gap >= pause_threshold:
            pauses.append(gap)

    if not pauses:
        return {"pacing_score": 5, "avg_pause_duration": 0, "pause_count": 0}  # no long pauses

    avg_pause = sum(pauses) / len(pauses)
    pause_count = len(pauses)

    # Scoring (tune thresholds as needed)
    if avg_pause < 1.0:
        score = 5  # good pacing
    elif 1.0 <= avg_pause <= 2.0:
        score = 3  # slightly slow
    else:
        score = 1  # too many/long pauses

    return {
        "pacing_score": score,
        "avg_pause_duration": round(avg_pause, 2),
        "pause_count": pause_count
    }
