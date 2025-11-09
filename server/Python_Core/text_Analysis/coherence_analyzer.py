
import logging
import re
import numpy as np
from typing import Dict, List, Any, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy

logger = logging.getLogger("coherence_analyzer")

class AdvancedCoherenceAnalyzer:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_md")  # Medium model with word vectors
            logger.info("Loaded spaCy model with word vectors for coherence analysis")
        except Exception as e:
            logger.warning(f"Could not load spaCy model: {e}. Using basic analysis.")
            self.nlp = None

    def analyze_coherence_flow(self, text: str) -> Dict[str, Any]:
        """Advanced coherence analysis using discourse and semantic features"""
        try:
            sentences = self._split_into_sentences(text)
            
            if len(sentences) < 2:
                return self._get_short_text_response()
            
            # Multiple coherence metrics
            discourse_score = self._analyze_discourse_structure(sentences)
            semantic_score = self._analyze_semantic_coherence(sentences)
            transition_score = self._analyze_transition_words(text, len(sentences))
            
            # Combined coherence score (weighted average)
            coherence_score = self._calculate_combined_coherence(
                discourse_score, semantic_score, transition_score
            )
            
            fluency_rating = self._classify_fluency(coherence_score)
            
            return {
                "coherence_score": round(coherence_score, 1),
                "fluency_rating": fluency_rating,
                "detailed_metrics": {
                    "discourse_coherence": round(discourse_score, 2),
                    "semantic_coherence": round(semantic_score, 2),
                    "transition_density": round(transition_score, 2),
                    "sentence_connections": self._analyze_sentence_connections(sentences)
                },
                "coherence_feedback": self._generate_detailed_feedback(
                    coherence_score, discourse_score, semantic_score, transition_score
                ),
                "improvement_suggestions": self._get_coherence_suggestions(
                    discourse_score, semantic_score, transition_score
                )
            }
            
        except Exception as e:
            logger.error(f"Advanced coherence analysis error: {e}")
            return self._get_fallback_analysis(text)

    def _analyze_discourse_structure(self, sentences: List[str]) -> float:
        """Analyze logical flow and discourse markers between sentences"""
        if not self.nlp or len(sentences) < 2:
            return 0.5
        
        discourse_indicators = {
            'additive': ['furthermore', 'moreover', 'additionally', 'also', 'and'],
            'contrastive': ['however', 'but', 'although', 'nevertheless', 'conversely'],
            'causal': ['therefore', 'thus', 'consequently', 'hence', 'as a result'],
            'temporal': ['meanwhile', 'subsequently', 'finally', 'then', 'next'],
            'exemplification': ['for example', 'for instance', 'specifically', 'namely']
        }
        
        total_connections = 0
        valid_transitions = 0
        
        for i in range(len(sentences) - 1):
            current_sent = sentences[i].lower()
            next_sent = sentences[i + 1].lower()
            
            # Check for discourse markers at sentence boundaries
            current_last_5 = ' '.join(current_sent.split()[-5:])
            next_first_5 = ' '.join(next_sent.split()[:5])
            
            # Score based on discourse marker presence
            for category, markers in discourse_indicators.items():
                if any(marker in current_last_5 for marker in markers) or \
                   any(marker in next_first_5 for marker in markers):
                    valid_transitions += 1
                    break
            
            total_connections += 1
        
        discourse_score = valid_transitions / max(1, total_connections) * 10
        return min(10.0, discourse_score)

    def _analyze_semantic_coherence(self, sentences: List[str]) -> float:
        """Analyze semantic similarity and topic consistency using word embeddings"""
        if not self.nlp or len(sentences) < 2:
            return 0.5
        
        try:
            # Method 1: Sentence similarity using spaCy vectors
            similarities = []
            for i in range(len(sentences) - 1):
                doc1 = self.nlp(sentences[i])
                doc2 = self.nlp(sentences[i + 1])
                
                if doc1.has_vector and doc2.has_vector and doc1.vector_norm and doc2.vector_norm:
                    similarity = doc1.similarity(doc2)
                    similarities.append(similarity)
            
            if similarities:
                avg_similarity = np.mean(similarities)
                # Convert similarity (0-1) to score (0-10)
                semantic_score = avg_similarity * 10
            else:
                semantic_score = 5.0
            
            # Method 2: Topic consistency using TF-IDF
            vectorizer = TfidfVectorizer(max_features=50, stop_words='english')
            try:
                tfidf_matrix = vectorizer.fit_transform(sentences)
                topic_similarities = []
                
                for i in range(tfidf_matrix.shape[0] - 1):
                    sim = cosine_similarity(tfidf_matrix[i], tfidf_matrix[i + 1])[0][0]
                    topic_similarities.append(sim)
                
                if topic_similarities:
                    topic_score = np.mean(topic_similarities) * 10
                    # Combine both methods
                    semantic_score = (semantic_score + topic_score) / 2
            except:
                pass
            
            return min(10.0, semantic_score)
            
        except Exception as e:
            logger.error(f"Semantic coherence analysis failed: {e}")
            return 5.0

    def _analyze_transition_words(self, text: str, sentence_count: int) -> float:
        """Analyze transition word usage with proper density metrics"""
        transition_categories = {
            'contrast': {'however', 'but', 'although', 'though', 'nevertheless', 'nonetheless', 'yet', 'still', 'conversely'},
            'addition': {'and', 'also', 'moreover', 'furthermore', 'additionally', 'besides', 'too', 'similarly'},
            'result': {'therefore', 'thus', 'consequently', 'hence', 'accordingly', 'so', 'as a result'},
            'example': {'for example', 'for instance', 'specifically', 'such as', 'e.g.', 'including'},
            'emphasis': {'indeed', 'in fact', 'certainly', 'notably', 'importantly'},
            'time': {'meanwhile', 'subsequently', 'finally', 'then', 'next', 'previously', 'currently'}
        }
        
        text_lower = text.lower()
        total_transitions = 0
        
        for category, words in transition_categories.items():
            for word in words:
                total_transitions += text_lower.count(word)
        
        # Calculate transition density (transitions per 100 words)
        word_count = len(text.split())
        transition_density = (total_transitions / max(1, word_count)) * 100
        
        # Ideal density: 2-4 transitions per 100 words (writing center standards)
        if 2 <= transition_density <= 4:
            transition_score = 9.0
        elif 1 <= transition_density <= 5:
            transition_score = 7.0
        elif transition_density > 5:
            transition_score = 6.0  # Too many transitions can be artificial
        else:
            transition_score = max(3.0, transition_density * 2)
        
        return min(10.0, transition_score)

    def _analyze_sentence_connections(self, sentences: List[str]) -> Dict[str, Any]:
        """Analyze how sentences connect to each other"""
        connections = {
            "total_sentences": len(sentences),
            "explicit_transitions": 0,
            "implicit_connections": 0,
            "topic_shifts": 0
        }
        
        for i in range(len(sentences) - 1):
            sent1 = sentences[i].lower()
            sent2 = sentences[i + 1].lower()
            
            # Check for explicit transitions
            transition_words = {'however', 'therefore', 'moreover', 'furthermore', 'consequently'}
            if any(word in sent1.split()[-3:] or word in sent2.split()[:3] for word in transition_words):
                connections["explicit_transitions"] += 1
            
            # Check for implicit connections (shared words/concepts)
            words1 = set(sent1.split())
            words2 = set(sent2.split())
            shared_words = words1.intersection(words2)
            if len(shared_words) >= 2:
                connections["implicit_connections"] += 1
            
            # Detect potential topic shifts (few shared words)
            if len(shared_words) <= 1 and len(words1) > 3 and len(words2) > 3:
                connections["topic_shifts"] += 1
        
        return connections

    def _calculate_combined_coherence(self, discourse: float, semantic: float, transition: float) -> float:
        """Calculate combined coherence score with academic writing weights"""
        # Weights for academic/professional writing
        weights = {
            'discourse': 0.40,  # Logical flow is most important
            'semantic': 0.35,   # Meaning consistency
            'transition': 0.25  # Explicit connectors
        }
        
        combined_score = (
            discourse * weights['discourse'] +
            semantic * weights['semantic'] + 
            transition * weights['transition']
        )
        
        return min(10.0, round(combined_score, 1))

    def _generate_detailed_feedback(self, overall: float, discourse: float, semantic: float, transition: float) -> str:
        """Generate specific feedback based on coherence metrics"""
        if overall >= 9.0:
            return "Excellent coherence with strong logical flow and clear connections between ideas."
        elif overall >= 8.0:
            return "Very good coherence. Ideas flow logically with appropriate transitions."
        elif overall >= 7.0:
            return "Good coherence overall. Some minor improvements to logical flow possible."
        elif overall >= 6.0:
            feedback = "Fair coherence. "
            if discourse < 6:
                feedback += "Work on creating clearer logical connections between sentences. "
            if semantic < 6:
                feedback += "Ensure ideas maintain consistent focus. "
            if transition < 6:
                feedback += "Add more transition words to guide the reader. "
            return feedback.strip()
        else:
            return "The text lacks clear coherence. Focus on logical organization, consistent topics, and using transition words to connect ideas."

    def _get_coherence_suggestions(self, discourse: float, semantic: float, transition: float) -> List[str]:
        """Generate specific improvement suggestions"""
        suggestions = []
        
        if discourse < 7.0:
            suggestions.append("Use discourse markers (however, therefore, furthermore) to show logical relationships")
            suggestions.append("Ensure each sentence logically follows from the previous one")
        
        if semantic < 7.0:
            suggestions.append("Maintain consistent topics throughout paragraphs")
            suggestions.append("Use pronouns and repetition to create clear references")
        
        if transition < 7.0:
            suggestions.append("Add transition words at the beginning of sentences to guide readers")
            suggestions.append("Vary transition types (contrast, addition, cause-effect)")
        
        if not suggestions:
            suggestions.append("Maintain current coherence practices")
        
        return suggestions[:3]  # Return top 3 suggestions

    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences using spaCy or fallback"""
        if self.nlp:
            doc = self.nlp(text)
            return [sent.text.strip() for sent in doc.sents if sent.text.strip()]
        else:
            # Fallback sentence splitting
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
            return sentences

    def _classify_fluency(self, score: float) -> str:
        """Classify fluency based on coherence score"""
        if score >= 9.0: return "Excellent"
        elif score >= 8.0: return "Very Good"
        elif score >= 7.0: return "Good"
        elif score >= 6.0: return "Fair"
        elif score >= 5.0: return "Needs Improvement"
        else: return "Poor"

    def _get_short_text_response(self) -> Dict[str, Any]:
        return {
            "coherence_score": 6.0,
            "fluency_rating": "Insufficient Text",
            "detailed_metrics": {},
            "coherence_feedback": "Text is too short for meaningful coherence analysis",
            "improvement_suggestions": ["Write more content to enable coherence analysis"]
        }

    def _get_fallback_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback analysis when advanced methods fail"""
        return {
            "coherence_score": 5.0,
            "fluency_rating": "Analysis Failed",
            "detailed_metrics": {},
            "coherence_feedback": "Coherence analysis unavailable",
            "improvement_suggestions": ["Basic coherence analysis could not be performed"]
        }

# Global instance
coherence_analyzer = AdvancedCoherenceAnalyzer()

def analyze_coherence_flow(text: str) -> Dict[str, Any]:
    return coherence_analyzer.analyze_coherence_flow(text)