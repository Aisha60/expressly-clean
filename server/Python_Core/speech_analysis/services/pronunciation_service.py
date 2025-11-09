# server/services/pronunciation_service.py

import phonetics  # pip install phonetics
import nltk
import string
from difflib import SequenceMatcher
# Removed import - not needed in this file

# -------------------------
# Ensure required NLTK resources are downloaded
# -------------------------
try:
    nltk.data.find("corpora/words")
except LookupError:
    nltk.download("words")

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")

# Load words corpus
from nltk.corpus import words as nltk_words

# English dictionary
english_vocab = set(w.lower() for w in nltk_words.words())

# Precompute phonetic codes for faster lookup
phonetic_dict = {}
for w in english_vocab:
    code = phonetics.dmetaphone(w)
    if code:
        phonetic_dict[code] = w  # map code to one of the dictionary words

# -------------------------
# Helper functions
# -------------------------
def clean_word(word):
    """Lowercase and remove punctuation"""
    return word.lower().translate(str.maketrans("", "", string.punctuation))

def phonetic_match(word):
    """Check if word matches any English word phonetically"""
    code = phonetics.dmetaphone(word)
    if code and code in phonetic_dict:
        return phonetic_dict[code]
    return None

def levenshtein_similarity(a, b):
    """Return a similarity ratio between 0 and 1"""
    return SequenceMatcher(None, a, b).ratio()

# -------------------------
# Main pronunciation assessment
# -------------------------
def assess_pronunciation_from_transcription(transcription_result):
    """
    Accepts transcription result from transcribe_audio.py
    Returns per-word feedback, counts, and score
    """
    text = transcription_result.get("text", "")
    spoken_words = [clean_word(w) for w in nltk.word_tokenize(text)]  # <-- use nltk tokenizer

    results = []
    correct_count = 0
    mispronounced_count = 0

    for word in spoken_words:
        is_correct = False
        feedback = "Incorrect / mispronounced"

        # 1️⃣ Exact dictionary match
        if word in english_vocab:
            is_correct = True
            feedback = "Correct"
        else:
            # 2️⃣ Phonetic match
            phon_match = phonetic_match(word)
            if phon_match:
                is_correct = True
                feedback = f"Correct (phonetic match to '{phon_match}')"
            else:
                # 3️⃣ Levenshtein similarity check for educational feedback
                best_match = max(
                    english_vocab, key=lambda w: levenshtein_similarity(w, word)
                )
                similarity = levenshtein_similarity(best_match, word)
                if similarity >= 0.7:  # Threshold for "close enough"
                    feedback = f"Close! Did you mean '{best_match}'?"

        if is_correct:
            correct_count += 1
        else:
            mispronounced_count += 1

        results.append(
            {
                "spoken_word": word,
                "correct": is_correct,
                "feedback": feedback,
            }
        )

    total_words = len(spoken_words)
    score_percent = round(correct_count / total_words * 100, 2) if total_words > 0 else 0

    return {
        "results": results,
        "total_words": total_words,
        "correct_words": correct_count,
        "mispronounced_words": mispronounced_count,
        "score_percent": score_percent,
    }



#     //Optimized:

# # server/services/pronunciation_service.py

# import phonetics  # pip install phonetics
# import nltk
# import string
# from functools import lru_cache
# from rapidfuzz import fuzz  # pip install rapidfuzz
# from services.transcribe_audio import transcribe_audio

# # -------------------------
# # Ensure required NLTK resources are downloaded
# # -------------------------
# try:
#     nltk.data.find("corpora/words")
# except LookupError:
#     nltk.download("words")

# try:
#     nltk.data.find("tokenizers/punkt")
# except LookupError:
#     nltk.download("punkt")

# from nltk.corpus import words as nltk_words

# # -------------------------
# # Prepare English dictionary
# # -------------------------
# english_vocab = set(w.lower() for w in nltk_words.words())

# # -------------------------
# # Precompute phonetic codes for faster lookup
# # -------------------------
# phonetic_dict = {}
# for w in english_vocab:
#     codes = phonetics.dmetaphone(w)
#     for code in codes:
#         if code:
#             phonetic_dict.setdefault(code, []).append(w)  # list of words per code

# # -------------------------
# # Helper functions
# # -------------------------
# def clean_word(word):
#     """Lowercase and remove punctuation"""
#     return word.lower().translate(str.maketrans("", "", string.punctuation))

# @lru_cache(maxsize=1000)
# def phonetic_code(word):
#     """Cache phonetic code computation"""
#     return phonetics.dmetaphone(word)

# def phonetic_match_fast(word):
#     """Return first dictionary word that matches phonetically"""
#     codes = phonetic_code(word)
#     for code in codes:
#         if code in phonetic_dict:
#             return phonetic_dict[code][0]
#     return None

# def closest_word(word):
#     """Find closest dictionary word by length & first letter filter + RapidFuzz"""
#     candidates = [w for w in english_vocab if abs(len(w)-len(word)) <= 2 and w[0]==word[0]]
#     if not candidates:
#         return None, 0
#     best = max(candidates, key=lambda w: fuzz.ratio(w, word))
#     similarity = fuzz.ratio(best, word) / 100  # normalize to 0-1
#     return best, similarity

# # -------------------------
# # Main pronunciation assessment
# # -------------------------
# def assess_pronunciation_from_transcription(transcription_result):
#     text = transcription_result.get("text", "")
#     spoken_words = [clean_word(w) for w in nltk.word_tokenize(text)]

#     results = []
#     correct_count = 0
#     mispronounced_count = 0

#     for word in spoken_words:
#         is_correct = False
#         feedback = "Incorrect / mispronounced"

#         # 1️⃣ Exact dictionary match
#         if word in english_vocab:
#             is_correct = True
#             feedback = "Correct"
#         else:
#             # 2️⃣ Phonetic match
#             phon_match = phonetic_match_fast(word)
#             if phon_match:
#                 is_correct = True
#                 feedback = f"Correct (phonetic match to '{phon_match}')"
#             else:
#                 # 3️⃣ Closest word by similarity
#                 best_match, similarity = closest_word(word)
#                 if similarity >= 0.7:
#                     feedback = f"Close! Did you mean '{best_match}'?"

#         if is_correct:
#             correct_count += 1
#         else:
#             mispronounced_count += 1

#         results.append({
#             "spoken_word": word,
#             "correct": is_correct,
#             "feedback": feedback,
#         })

#     total_words = len(spoken_words)
#     score_percent = round(correct_count / total_words * 100, 2) if total_words > 0 else 0

#     return {
#         "results": results,
#         "total_words": total_words,
#         "correct_words": correct_count,
#         "mispronounced_words": mispronounced_count,
#         "score_percent": score_percent,
#     }
