from collections import Counter
import re

def detect_context(text):
    """
    Detect context for a small piece of text.
    """
    text = text.lower()
    if "sorry" in text or "apologize" in text:
        return "apology"
    elif "congratulations" in text or "congrats" in text:
        return "congratulations"
    elif "thank" in text:
        return "thanks"
    elif text.endswith("?"):
        return "question"
    else:
        return "neutral"

def detect_overall_context(transcription_text):
    
    sentences = re.split(r'[.!?]', transcription_text)
    sentences = [s.strip() for s in sentences if s.strip()]

    chunk_contexts = [detect_context(sentence) for sentence in sentences]

    overall_context = Counter(chunk_contexts).most_common(1)[0][0]

    return overall_context, chunk_contexts





    



##Via model# services/context_service.py
# from transformers import pipeline

# # Load model once (at import)
# classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# # Candidate contexts (expandable)
# CANDIDATE_LABELS = [
#     "formal interview",
#     "presentation",
#     "casual conversation",
#     "storytelling",
#     "discussion",
#     "meeting",
#     "academic lecture"
# ]

# def detect_overall_context(transcription_text):
#     """
#     Detects overall context of the speech using zero-shot classification.

#     Args:
#         transcription_text (str): Full transcribed text.

#     Returns:
#         str: Best matching context.
#     """
#     if not transcription_text.strip():
#         return "unknown"

#     result = classifier(transcription_text, CANDIDATE_LABELS)
#     overall_context = result["labels"][0]  # Top prediction
#     return overall_context

