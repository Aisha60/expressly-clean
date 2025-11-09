import logging
from typing import Dict, List, Any
import requests

logger = logging.getLogger("grammar_analyzer")

class GrammarChecker:
    def __init__(self):
        self.server_url = "http://localhost:8081"
        logger.info("Grammar checker ready to use local LanguageTool server")
    
    def analyze_grammar_spelling(self, text: str) -> Dict[str, Any]:
        """Combined grammar and spelling analysis"""
        try:
            # Call local LanguageTool server
            response = requests.post(
                f"{self.server_url}/v2/check",
                data={
                    'text': text, 
                    'language': 'en-US',
                    'enabledOnly': 'false'
                },
                timeout=20
            )
            
            if response.status_code != 200:
                return self._simple_error_response(f"Server error: {response.status_code}")
            
            data = response.json()
            return self._process_languagetool_response(data, text)
            
        except Exception as e:
            logger.error(f"Grammar analysis error: {e}")
            return self._simple_error_response(str(e))

    def _process_languagetool_response(self, data: Dict, text: str) -> Dict[str, Any]:
        """Process LanguageTool API response and return combined grammar-spelling results"""
        matches = data.get('matches', [])
        
        # Calculate metrics
        total_errors = len(matches)
        word_count = len(text.split())
        error_ratio = total_errors / max(1, word_count)
        
        # Calculate score (0-10 scale)
        if total_errors == 0:
            score = 10.0
        elif error_ratio <= 0.02:  # 2 errors per 100 words
            score = 9.5
        elif error_ratio <= 0.05:  # 5 errors per 100 words
            score = 9.0
        elif error_ratio <= 0.08:  # 8 errors per 100 words
            score = 8.0
        elif error_ratio <= 0.12:  # 12 errors per 100 words
            score = 7.0
        elif error_ratio <= 0.15:  # 15 errors per 100 words
            score = 6.0
        elif error_ratio <= 0.20:  # 20 errors per 100 words
            score = 5.0
        elif error_ratio <= 0.25:  # 25 errors per 100 words
            score = 4.0
        elif error_ratio <= 0.30:  # 30 errors per 100 words
            score = 3.0
        else:
            score = max(1.0, 10 - (error_ratio * 20))
        
        # Process all errors with their context and suggestions
        all_errors = []
        for match in matches:
            error_info = {
                "message": match.get('message', ''),
                "context": match.get('context', {}).get('text', ''),
                "offset": match.get('offset', 0),
                "length": match.get('length', 0),
                "category": match.get('rule', {}).get('category', {}).get('name', 'Unknown'),
                "suggestions": [rep.get('value', '') for rep in match.get('replacements', [])][:3]
            }
            all_errors.append(error_info)
        
        # Generate improvement tips
        improvement_tips = self._generate_improvement_tips(total_errors)
        
        return {
            "score": round(score, 1),
            "total_issues": total_errors,
            "error_ratio": round(error_ratio, 3),
            "issues": {
                "all_errors": all_errors[:10],  # Limit to first 10 errors
                "error_count": total_errors
            },
            "summary": {
                "quality_rating": self._get_quality_rating(score),
                "overall_feedback": self._get_feedback(total_errors, score),
                "specific_issues": [f"{total_errors} grammar and spelling issues found"],
                "improvement_tips": improvement_tips
            },
            "analysis_method": "language_tool_local_server"
        }

    def _generate_improvement_tips(self, total_errors: int) -> List[str]:
        """Generate improvement tips based on error count"""
        if total_errors == 0:
            return ["Excellent writing! No grammar or spelling issues found."]
        elif total_errors <= 3:
            return ["Minor issues found", "A quick proofread would help"]
        elif total_errors <= 8:
            return ["Some writing issues detected", "Review grammar and spelling rules"]
        elif total_errors <= 15:
            return ["Multiple writing issues found", "Use grammar checking tools for assistance"]
        else:
            return ["Significant writing issues", "Focus on fundamental writing skills"]

    def _get_quality_rating(self, score: float) -> str:
        """Get quality rating based on score"""
        if score >= 9.0: return "Excellent"
        elif score >= 8.0: return "Very Good"
        elif score >= 7.0: return "Good"
        elif score >= 6.0: return "Fair"
        elif score >= 5.0: return "Needs Improvement"
        else: return "Poor"

    def _get_feedback(self, total_errors: int, score: float) -> str:
        """Generate feedback based on error count and score"""
        if total_errors == 0:
            return "Perfect grammar and spelling! Your writing is impeccable."
        elif total_errors <= 3:
            return "Minor issues detected. Your writing is strong overall."
        elif total_errors <= 8:
            return "Some issues found. A quick review would help."
        elif total_errors <= 15:
            return "Several issues need attention."
        else:
            return "Multiple issues require revision for better clarity."

    def _simple_error_response(self, error_msg: str) -> Dict[str, Any]:
        """Simple error response without validation"""
        return {
            "score": 5.0,
            "total_issues": 0,
            "error_ratio": 0,
            "issues": {
                "all_errors": [],
                "error_count": 0
            },
            "summary": {
                "quality_rating": "Analysis Failed",
                "overall_feedback": f"Grammar analysis error: {error_msg}",
                "specific_issues": ["Analysis unavailable"],
                "improvement_tips": ["Please try again or check the server connection"]
            },
            "analysis_method": "error"
        }

# Global instance
grammar_checker = GrammarChecker()

def analyze_grammar_spelling(text: str) -> Dict[str, Any]:
    """Main function to analyze grammar and spelling"""
    return grammar_checker.analyze_grammar_spelling(text)