
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from datetime import datetime
from typing import Dict, List

# Import analysis modules and scoring functions
from .grammar_checker import analyze_grammar_spelling
from .readability import analyze_readability
from .structure_analyzer import analyze_sentence_structure
from .coherence_analyzer import analyze_coherence_flow
from .scoring import calculate_overall_score, get_quality_label, get_score_level, identify_key_improvement_areas

router = APIRouter()
logger = logging.getLogger("text_analyzer")

class TextRequest(BaseModel):
    text: str

@router.post("/analyze-text")
async def analyze_text(request: TextRequest):
    """
    Main text analysis endpoint with structured response
    """
    try:
        start_time = datetime.now()
        text = request.text.strip()
        
        logger.info(f"Analyzing text (length: {len(text)} characters)")
        
        # Run all analyses
        grammar_analysis = analyze_grammar_spelling(text)
        readability_analysis = analyze_readability(text)
        structure_analysis = analyze_sentence_structure(text)
        coherence_analysis = analyze_coherence_flow(text)
        
        # Extract category scores
        category_scores = {
            'grammar': grammar_analysis.get('score', 0),
            'readability': readability_analysis.get('readability_score', 0),
            'structure': structure_analysis.get('structure_score', 0),
            'coherence': coherence_analysis.get('coherence_score', 0)
        }
        
        # Calculate overall metrics
        overall_score = calculate_overall_score(category_scores)
        key_improvement_areas = identify_key_improvement_areas(category_scores)
        suggestions = generate_improvement_suggestions(category_scores, overall_score)
        
        # Build structured response
        processing_time = round((datetime.now() - start_time).total_seconds(), 2)
        
        response = {
            "success": True,
            "analysis": {
                "overall_score": overall_score,
                "quality_label": get_quality_label(overall_score),
                "categories": {
                    "grammar_spelling": build_grammar_spelling_category(grammar_analysis),
                    "readability": build_readability_category(readability_analysis),
                    "structure": build_structure_category(structure_analysis),
                    "coherence": build_coherence_category(coherence_analysis)
                }
            },
            "suggestions": suggestions,
            "key_improvement_areas": key_improvement_areas,
            "metadata": {
                "processing_time_seconds": processing_time,
                "word_count": structure_analysis.get("word_count", 0),
                "sentence_count": structure_analysis.get("sentence_count", 0),
                "text_length": len(text)
            }
        }
        
        logger.info(f"Analysis completed in {processing_time}s - Score: {overall_score}/10")
        return response
        
    except Exception as e:
        logger.exception(f"Text analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={
                "success": False,
                "error": "Text analysis failed", 
                "message": str(e)
            }
        )

def build_grammar_spelling_category(analysis: Dict) -> Dict:
    """Build combined grammar and spelling category response"""
    return {
        "score": analysis.get('score', 0),
        "level": get_score_level(analysis.get('score', 0)),
        "total_errors": analysis.get('total_issues', 0),
        "detailed_errors": analysis.get('issues', {}),
        "weaknesses": analysis.get('summary', {}).get('specific_issues', []),
        "improvement_tips": analysis.get('summary', {}).get('improvement_tips', []),
        "quality_feedback": analysis.get('summary', {}).get('overall_feedback', '')
    }

def build_readability_category(analysis: Dict) -> Dict:
    """Build readability category response"""
    return {
        "score": analysis.get('readability_score', 0),
        "level": get_score_level(analysis.get('readability_score', 0)),
        "details": {
            "level": analysis.get('readability_level', 'Unknown'),
            "target_audience": analysis.get('estimated_education_level', 'Unknown'),
            "reading_ease": interpret_flesch_ease(analysis.get('flesch_reading_ease', 0))
        },
        "improvement_tips": generate_readability_tips(analysis.get('readability_score', 0))
    }

def build_structure_category(analysis: Dict) -> Dict:
    """Build structure category response"""
    return {
        "score": analysis.get('structure_score', 0),
        "level": get_score_level(analysis.get('structure_score', 0)),
        "details": {
            "sentence_variety": "Good" if 5 <= analysis.get('avg_sentence_length', 0) <= 25 else "Could be improved",
            "avg_sentence_length": analysis.get('avg_sentence_length', 0),
            "word_count": analysis.get('word_count', 0)
        },
        "improvement_tips": generate_structure_tips(analysis)
    }

def build_coherence_category(analysis: Dict) -> Dict:
    """Build coherence category response"""
    return {
        "score": analysis.get('coherence_score', 0),
        "level": get_score_level(analysis.get('coherence_score', 0)),
        "details": {
            "fluency": analysis.get('fluency_rating', 'Unknown'),
            "transition_words": analysis.get('transition_analysis', {}).get('total_transitions', 0)
        },
        "weaknesses": ["Text flow", "Transition usage"] if analysis.get('coherence_score', 0) < 7 else [],
        "improvement_tips": [analysis.get('coherence_feedback', 'Improve text flow')]
    }

def interpret_flesch_ease(score: float) -> str:
    """Interpret Flesch Reading Ease score"""
    if score >= 90: return "Very Easy"
    elif score >= 80: return "Easy"
    elif score >= 70: return "Fairly Easy"
    elif score >= 60: return "Standard"
    elif score >= 50: return "Fairly Difficult"
    else: return "Difficult"

def generate_readability_tips(score: float) -> List[str]:
    """Generate readability improvement tips"""
    if score < 6:
        return ["Simplify vocabulary", "Use shorter sentences", "Break up long paragraphs"]
    elif score > 8:
        return ["Maintain current readability level"]
    else:
        return ["Vary sentence length for better flow"]

def generate_structure_tips(analysis: Dict) -> List[str]:
    """Generate structure improvement tips"""
    avg_len = analysis.get('avg_sentence_length', 0)
    if avg_len > 25:
        return ["Break up long sentences", "Use more varied sentence structures"]
    elif avg_len < 10:
        return ["Combine some short sentences", "Add more detail to sentences"]
    else:
        return ["Good sentence structure variety"]

def generate_improvement_suggestions(category_scores: Dict[str, float], overall_score: float) -> List[str]:
    """Generate improvement suggestions based on analysis results"""
    suggestions = []
    
    # Overall score suggestions
    if overall_score >= 9:
        suggestions.append("🎉 **Excellent Writing**: Your text demonstrates strong writing skills across all categories!")
    elif overall_score >= 8:
        suggestions.append("✅ **Very Good**: Your writing is strong with only minor areas for improvement.")
    elif overall_score >= 7:
        suggestions.append("👍 **Good Foundation**: Solid writing with some opportunities for enhancement.")
    elif overall_score >= 6:
        suggestions.append("📝 **Needs Attention**: Several areas need improvement for better clarity.")
    else:
        suggestions.append("🔄 **Significant Improvement Needed**: Focus on fundamental writing skills.")
    
    # Category-specific suggestions
    if category_scores.get('grammar', 0) < 7:
        suggestions.append("📚 **Grammar & Spelling**: Review grammar rules and proofread carefully.")
    
    if category_scores.get('readability', 0) < 6:
        suggestions.append("📖 **Readability**: Simplify language and improve sentence flow.")
    
    if category_scores.get('coherence', 0) < 6:
        suggestions.append("🔗 **Coherence**: Use transition words and improve logical flow.")
    
    if category_scores.get('structure', 0) < 6:
        suggestions.append("📏 **Structure**: Vary sentence length and structure.")
    
    return suggestions