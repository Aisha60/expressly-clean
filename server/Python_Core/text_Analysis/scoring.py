
import logging
from typing import List, Dict

logger = logging.getLogger("score_calculator")

def get_quality_label(score: float) -> str:
    """Quality labels for high school and professional writing"""
    if score >= 9.0:
        return "Excellent"
    elif score >= 8.0:
        return "Very Good"
    elif score >= 7.0:
        return "Good"
    elif score >= 6.0:
        return "Fair"
    elif score >= 5.0:
        return "Needs Improvement"
    else:
        return "Poor"

def get_score_level(score: float) -> str:
    """Score level for individual categories"""
    if score >= 9.0: return "Excellent"
    elif score >= 8.0: return "Very Good"
    elif score >= 7.0: return "Good"
    elif score >= 6.0: return "Fair"
    elif score >= 5.0: return "Needs Improvement"
    else: return "Poor"

def calculate_readability_score(flesch_reading_ease: float, flesch_kincaid_grade: float) -> float:
    """
    Calculate readability score optimized for high school level (10-12 grade)
    Based on educational standards and professional writing guidelines
    """
    # Ideal for high school/professional: Flesch 60-70 (Standard), Grade 10-12
    flesch_score = 0.0
    
    if flesch_reading_ease >= 80:
        flesch_score = 8.0  # Very Easy - may be too simple
    elif flesch_reading_ease >= 70:
        flesch_score = 9.0  # Fairly Easy - good for general audience
    elif flesch_reading_ease >= 60:
        flesch_score = 9.5  # Standard - ideal for high school/professional
    elif flesch_reading_ease >= 50:
        flesch_score = 8.0  # Fairly Difficult - acceptable
    elif flesch_reading_ease >= 30:
        flesch_score = 6.0  # Difficult - needs simplification
    else:
        flesch_score = 4.0  # Very Difficult - hard to read
    
    grade_score = 0.0
    if 10 <= flesch_kincaid_grade <= 12:
        grade_score = 9.5  # Perfect for target audience
    elif 9 <= flesch_kincaid_grade <= 13:
        grade_score = 8.0  # Acceptable range
    elif flesch_kincaid_grade < 9:
        grade_score = 7.0  # Too simple for high school
    else:
        grade_score = 6.0  # Too complex
    
    # Combined score (weighted average)
    final_score = (flesch_score * 0.6) + (grade_score * 0.4)
    return max(0, min(10, round(final_score, 1)))

def calculate_overall_score(category_scores: Dict[str, float]) -> float:
    """
    Calculate overall score with weights optimized for academic/professional writing
    """
    weights = {
        'grammar': 0.35,      # Combined grammar + spelling weight
        'readability': 0.20,   # Appropriate for audience
        'coherence': 0.25,     # Critical for academic writing
        'structure': 0.20      # Important for professional presentation
    }
    
    total_score = 0
    total_weight = 0
    
    for category, weight in weights.items():
        if category in category_scores:
            total_score += category_scores[category] * weight
            total_weight += weight
    
    final_score = total_score / total_weight if total_weight > 0 else 0
    return round(final_score, 1)

def identify_key_improvement_areas(category_scores: Dict[str, float]) -> List[str]:
    """Identify categories needing improvement for academic writing"""
    improvement_areas = []
    threshold = 7.0  # Target for "Good" writing
    
    for category, score in category_scores.items():
        if score < threshold:
            improvement_areas.append(category.capitalize())
    
    return improvement_areas