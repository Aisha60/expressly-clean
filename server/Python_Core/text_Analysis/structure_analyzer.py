
import logging
import statistics
import numpy as np
from typing import Dict, List, Any, Tuple
import spacy

logger = logging.getLogger("structure_analyzer")

class AdvancedStructureAnalyzer:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model for advanced structure analysis")
        except Exception as e:
            logger.warning(f"Could not load spaCy model: {e}")
            self.nlp = None

    def analyze_sentence_structure(self, text: str) -> Dict[str, Any]:
        """Advanced sentence structure analysis using NLP features"""
        try:
            if not self.nlp:
                return self._basic_structure_analysis(text)
            
            doc = self.nlp(text)
            sentences = [sent for sent in doc.sents]
            
            if len(sentences) < 1:
                return self._get_short_text_response()
            
            # Comprehensive structure metrics
            basic_metrics = self._calculate_basic_metrics(doc, sentences)
            syntactic_metrics = self._analyze_syntactic_complexity(sentences)
            pos_metrics = self._analyze_pos_distribution(doc)
            dependency_metrics = self._analyze_dependency_structures(sentences)
            
            # Calculate overall structure score
            structure_score = self._calculate_structure_score(
                basic_metrics, syntactic_metrics, pos_metrics, dependency_metrics
            )
            
            return {
                "structure_score": round(structure_score, 1),
                "basic_metrics": basic_metrics,
                "syntactic_complexity": syntactic_metrics,
                "pos_analysis": pos_metrics,
                "dependency_analysis": dependency_metrics,
                "structure_feedback": self._generate_structure_feedback(
                    structure_score, basic_metrics, syntactic_metrics
                ),
                "improvement_suggestions": self._get_structure_suggestions(
                    basic_metrics, syntactic_metrics, pos_metrics
                )
            }
            
        except Exception as e:
            logger.error(f"Advanced structure analysis error: {e}")
            return self._basic_structure_analysis(text)

    def _calculate_basic_metrics(self, doc, sentences: List) -> Dict[str, Any]:
        """Calculate basic sentence structure metrics"""
        sentence_lengths = [len([token for token in sent if not token.is_punct]) for sent in sentences]
        word_count = len([token for token in doc if not token.is_punct and not token.is_space])
        
        if sentence_lengths:
            avg_length = statistics.mean(sentence_lengths)
            length_variance = statistics.stdev(sentence_lengths) if len(sentence_lengths) > 1 else 0
        else:
            avg_length = 0
            length_variance = 0
        
        return {
            "sentence_count": len(sentences),
            "word_count": word_count,
            "avg_sentence_length": round(avg_length, 1),
            "sentence_length_variance": round(length_variance, 2),
            "max_sentence_length": max(sentence_lengths) if sentence_lengths else 0,
            "min_sentence_length": min(sentence_lengths) if sentence_lengths else 0,
            "sentence_length_range": f"{min(sentence_lengths) if sentence_lengths else 0}-{max(sentence_lengths) if sentence_lengths else 0}"
        }

    def _analyze_syntactic_complexity(self, sentences: List) -> Dict[str, Any]:
        """Analyze syntactic complexity using various metrics"""
        if not sentences:
            return {"error": "No sentences to analyze"}
        
        complexities = []
        clause_counts = []
        dependency_depths = []
        
        for sent in sentences:
            # Sentence complexity based on clause count
            clauses = self._count_clauses(sent)
            clause_counts.append(clauses)
            
            # Dependency tree depth
            depth = self._calculate_dependency_depth(sent)
            dependency_depths.append(depth)
            
            # Overall complexity score
            complexity = (clauses * 0.6) + (depth * 0.4)
            complexities.append(complexity)
        
        return {
            "avg_clauses_per_sentence": round(statistics.mean(clause_counts), 2) if clause_counts else 0,
            "avg_dependency_depth": round(statistics.mean(dependency_depths), 2) if dependency_depths else 0,
            "syntactic_complexity_score": round(statistics.mean(complexities), 2) if complexities else 0,
            "complexity_variance": round(statistics.stdev(complexities), 2) if len(complexities) > 1 else 0
        }

    def _count_clauses(self, sentence) -> int:
        """Count clauses in a sentence using dependency parsing"""
        clause_count = 1  # Start with main clause
        
        # Look for clause markers and dependent clauses
        for token in sentence:
            if token.dep_ in ['ccomp', 'xcomp', 'advcl', 'relcl']:
                clause_count += 1
            # Compound sentences with conjunctions
            elif token.dep_ == 'cc' and token.head.dep_ == 'ROOT':
                clause_count += 1
        
        return clause_count

    def _calculate_dependency_depth(self, sentence) -> int:
        """Calculate maximum dependency tree depth"""
        if not sentence:
            return 0
        
        depths = {}
        
        def calculate_token_depth(token, current_depth=0):
            depths[token.i] = current_depth
            for child in token.children:
                calculate_token_depth(child, current_depth + 1)
        
        # Start from root
        root = [token for token in sentence if token.dep_ == 'ROOT']
        if root:
            calculate_token_depth(root[0])
            return max(depths.values()) if depths else 0
        return 0

    def _analyze_pos_distribution(self, doc) -> Dict[str, Any]:
        """Analyze Part-of-Speech distribution and diversity"""
        pos_counts = {}
        total_tokens = 0
        
        for token in doc:
            if not token.is_punct and not token.is_space:
                pos_tag = token.pos_
                pos_counts[pos_tag] = pos_counts.get(pos_tag, 0) + 1
                total_tokens += 1
        
        # Calculate POS diversity using Simpson's Diversity Index
        diversity = 0.0
        richness = len(pos_counts)  # Number of unique POS tags
        
        for count in pos_counts.values():
            proportion = count / total_tokens
            diversity += proportion * proportion
        
        diversity_index = 1 - diversity  # Higher = more diverse
        
        # Calculate specific ratios important for writing quality
        noun_ratio = pos_counts.get('NOUN', 0) / total_tokens
        verb_ratio = pos_counts.get('VERB', 0) / total_tokens
        adj_ratio = pos_counts.get('ADJ', 0) / total_tokens
        adv_ratio = pos_counts.get('ADV', 0) / total_tokens
        
        return {
            "pos_richness": richness,
            "pos_diversity_index": round(diversity_index, 3),
            "noun_ratio": round(noun_ratio, 3),
            "verb_ratio": round(verb_ratio, 3),
            "adjective_ratio": round(adj_ratio, 3),
            "adverb_ratio": round(adv_ratio, 3),
            "pos_distribution": pos_counts
        }

    def _analyze_dependency_structures(self, sentences: List) -> Dict[str, Any]:
        """Analyze dependency relationships and sentence structures"""
        if not sentences:
            return {}
        
        dependency_types = {}
        sentence_structures = []
        
        for sent in sentences:
            structure_type = self._classify_sentence_structure(sent)
            sentence_structures.append(structure_type)
            
            for token in sent:
                dep_type = token.dep_
                dependency_types[dep_type] = dependency_types.get(dep_type, 0) + 1
        
        return {
            "sentence_structure_types": self._count_structure_types(sentence_structures),
            "dependency_relations": dependency_types,
            "avg_dependencies_per_sentence": sum(dependency_types.values()) / len(sentences) if sentences else 0
        }

    def _classify_sentence_structure(self, sentence) -> str:
        """Classify sentence structure type"""
        has_subordinate = any(token.dep_ in ['advcl', 'relcl', 'ccomp'] for token in sentence)
        has_coordinate = any(token.dep_ == 'cc' and token.head.dep_ == 'ROOT' for token in sentence)
        
        if has_subordinate and has_coordinate:
            return "complex-compound"
        elif has_subordinate:
            return "complex"
        elif has_coordinate:
            return "compound"
        else:
            return "simple"

    def _count_structure_types(self, structures: List[str]) -> Dict[str, int]:
        """Count occurrences of each sentence structure type"""
        counts = {}
        for structure in structures:
            counts[structure] = counts.get(structure, 0) + 1
        return counts

    def _calculate_structure_score(self, basic: Dict, syntactic: Dict, pos: Dict, dependency: Dict) -> float:
        """Calculate comprehensive structure score for academic writing"""
        score = 0.0
        
        # Sentence length factor (25% weight)
        avg_length = basic.get("avg_sentence_length", 0)
        if 15 <= avg_length <= 25:  # Ideal for academic writing
            score += 2.5
        elif 12 <= avg_length <= 30:
            score += 2.0
        else:
            score += 1.0
        
        # Sentence variety factor (25% weight)
        variance = basic.get("sentence_length_variance", 0)
        if variance >= 8:
            score += 2.5  # Excellent variety
        elif variance >= 5:
            score += 2.0  # Good variety
        elif variance >= 3:
            score += 1.5  # Some variety
        else:
            score += 1.0  # Little variety
        
        # Syntactic complexity factor (25% weight)
        complexity = syntactic.get("syntactic_complexity_score", 0)
        if 1.5 <= complexity <= 3.0:  # Ideal range for academic writing
            score += 2.5
        elif 1.0 <= complexity <= 4.0:
            score += 2.0
        else:
            score += 1.0
        
        # POS diversity factor (25% weight)
        diversity = pos.get("pos_diversity_index", 0)
        if diversity >= 0.7:
            score += 2.5
        elif diversity >= 0.5:
            score += 2.0
        elif diversity >= 0.3:
            score += 1.5
        else:
            score += 1.0
        
        return min(10.0, score)

    def _generate_structure_feedback(self, score: float, basic: Dict, syntactic: Dict) -> str:
        """Generate specific structure feedback"""
        avg_length = basic.get("avg_sentence_length", 0)
        variance = basic.get("sentence_length_variance", 0)
        complexity = syntactic.get("syntactic_complexity_score", 0)
        
        if score >= 9.0:
            return "Excellent sentence structure with ideal length, variety, and complexity for academic writing."
        elif score >= 8.0:
            return "Very good sentence structure. Maintains appropriate complexity and variety."
        elif score >= 7.0:
            feedback = "Good sentence structure. "
            if avg_length < 15:
                feedback += "Some sentences could be more developed. "
            if variance < 5:
                feedback += "Consider varying sentence length more. "
            return feedback.strip()
        else:
            feedback = "Sentence structure needs improvement. "
            if avg_length > 25:
                feedback += "Some sentences are too long. "
            if avg_length < 12:
                feedback += "Many sentences are too short. "
            if variance < 3:
                feedback += "Sentence length is too uniform. "
            if complexity < 1.0:
                feedback += "Sentences are overly simple. "
            return feedback.strip()

    def _get_structure_suggestions(self, basic: Dict, syntactic: Dict, pos: Dict) -> List[str]:
        """Generate specific structure improvement suggestions"""
        suggestions = []
        
        avg_length = basic.get("avg_sentence_length", 0)
        variance = basic.get("sentence_length_variance", 0)
        complexity = syntactic.get("syntactic_complexity_score", 0)
        diversity = pos.get("pos_diversity_index", 0)
        
        if avg_length > 25:
            suggestions.append("Break long sentences into shorter, clearer statements")
        elif avg_length < 15:
            suggestions.append("Combine some short sentences to create more complex ideas")
        
        if variance < 5:
            suggestions.append("Vary sentence length to create better rhythm and flow")
        
        if complexity < 1.5:
            suggestions.append("Use subordinate clauses to create more sophisticated sentences")
        
        if diversity < 0.5:
            suggestions.append("Use more varied vocabulary and sentence patterns")
        
        if not suggestions:
            suggestions.append("Maintain current sentence structure practices")
        
        return suggestions[:3]

    def _basic_structure_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback basic analysis"""
        try:
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            word_count = len(text.split())
            
            if not sentences:
                return self._get_short_text_response()
            
            sentence_lengths = [len(sent.split()) for sent in sentences]
            avg_length = statistics.mean(sentence_lengths) if sentence_lengths else 0
            
            return {
                "structure_score": 5.0,
                "basic_metrics": {
                    "sentence_count": len(sentences),
                    "word_count": word_count,
                    "avg_sentence_length": round(avg_length, 1),
                    "sentence_length_variance": 0,
                    "max_sentence_length": max(sentence_lengths) if sentence_lengths else 0,
                    "min_sentence_length": min(sentence_lengths) if sentence_lengths else 0
                },
                "syntactic_complexity": {"error": "Basic analysis only"},
                "structure_feedback": "Basic structure analysis completed",
                "improvement_suggestions": ["Install spaCy for advanced structure analysis"]
            }
        except Exception as e:
            return {
                "structure_score": 5.0,
                "error": str(e),
                "structure_feedback": "Structure analysis failed"
            }

    def _get_short_text_response(self) -> Dict[str, Any]:
        return {
            "structure_score": 5.0,
            "basic_metrics": {},
            "syntactic_complexity": {},
            "structure_feedback": "Text is too short for meaningful structure analysis",
            "improvement_suggestions": ["Write more content to enable structure analysis"]
        }

# Global instance
structure_analyzer = AdvancedStructureAnalyzer()

def analyze_sentence_structure(text: str) -> Dict[str, Any]:
    return structure_analyzer.analyze_sentence_structure(text)