# server/services/practice_tone_service.py

expected_tones = {
    "apology": ["sad", "neutral"],
    "congratulations": ["happy", "excited"],
    "thanks": ["happy", "grateful"],
    "question": ["neutral", "curious"],
    "neutral": ["neutral"]
}

def check_tone_practice(context, detected_emotion):
    """
    Check if tone matches expected emotion for practice exercise.

    Args:
        context (str): e.g., "apology", "thanks"
        detected_emotion (str): e.g., "happy", "sad"

    Returns:
        dict: {success, expected, correct, feedback}
    """
    detected_emotion = detected_emotion.lower()
    expected = expected_tones.get(context, ["neutral"])

    correct = detected_emotion in expected

    feedback = (
        f"✅ Correct tone! '{detected_emotion}' fits the '{context}' context."
        if correct
        else f"⚠️ Tone mismatch. For '{context}', expected {expected}, but got '{detected_emotion}'."
    )

    return {
        "success": True,
        "expected": expected,
        "correct": correct,
        "feedback": feedback
    }
