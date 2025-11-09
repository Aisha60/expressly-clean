
import logging

logger = logging.getLogger("readability_analyzer")

def analyze_readability(text: str):
    """Analyze readability using textstat"""
    try:
        import textstat
        
        if len(text.split()) < 5:
            return {
                "error": "Text too short for meaningful readability analysis",
                "readability_level": "Insufficient Text"
            }
        
        # Calculate readability scores
        flesch_ease = textstat.flesch_reading_ease(text)
        flesch_grade = textstat.flesch_kincaid_grade(text)
        
        # Use the scoring function from scoring.py
        from .scoring import calculate_readability_score
        readability_score = calculate_readability_score(flesch_ease, flesch_grade)
        
        # Interpret Flesch Reading Ease
        readability_level = interpret_flesch_score(flesch_ease)
        
        return {
            "flesch_reading_ease": round(flesch_ease, 2),
            "flesch_kincaid_grade": round(flesch_grade, 2),
            "readability_score": readability_score,  # 0-10 scale
            "smog_index": round(textstat.smog_index(text), 2) if len(text.split()) > 30 else "N/A",
            "coleman_liau_index": round(textstat.coleman_liau_index(text), 2),
            "automated_readability_index": round(textstat.automated_readability_index(text), 2),
            "dale_chall_readability": round(textstat.dale_chall_readability_score(text), 2),
            "difficult_words": textstat.difficult_words(text),
            "gunning_fog": round(textstat.gunning_fog(text), 2),
            "readability_level": readability_level,
            "estimated_education_level": f"Grade {round(flesch_grade)}"
        }
    except Exception as e:
        logger.error(f"Readability analysis error: {e}")
        return {"error": str(e)}

def interpret_flesch_score(score: float) -> str:
    """Interpret Flesch Reading Ease score"""
    if score >= 90:
        return "Very Easy"
    elif score >= 80:
        return "Easy"
    elif score >= 70:
        return "Fairly Easy"
    elif score >= 60:
        return "Standard"
    elif score >= 50:
        return "Fairly Difficult"
    elif score >= 30:
        return "Difficult"
    else:
        return "Very Difficult"