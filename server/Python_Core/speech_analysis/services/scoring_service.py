import numpy as np

def calculate_scores(pronunciation_result, fluency_result, pitch_result, tone_result, prompt_match_ratio=0):
    """
    Calculate feature scores and overall metrics.
    - Speech Clarity is based only on Fluency + Pacing
    - Other features (Pronunciation, Pitch, Tone) are still reported individually
    - Includes prompt matching score and detailed feedback
    """

    # --- Pronunciation
    pronunciation_score = pronunciation_result.get("score_percent", 0)

    # --- Fluency
    fluency_score = fluency_result.get("fluency_score", 0)

    # --- Pacing (from fluency_result or default 0 if missing)
    pacing_score = fluency_result.get("pacing_score", 0)

    # --- Clarity (based only on fluency + pacing)
    clarity_score = round(0.6 * fluency_score + 0.4 * pacing_score, 2)

    # --- Pitch variation score (scaled)
    total_pitch_variation = pitch_result.get("total_pitch_variation", 0.0)
    pitch_score = min(int(total_pitch_variation * 200), 100)

    # --- Tone score
    tone_eval = tone_result.get("evaluation", "").lower()
    if "positive" in tone_eval:
        tone_score = 90
    elif "neutral" in tone_eval:
        tone_score = 70
    else:
        tone_score = 50

    # --- Collect all scores
    scores = {
        "pronunciation": pronunciation_score,
        "fluency": fluency_score,
        "pacing": pacing_score,
        "clarity": clarity_score,   # ✅ new metric
        "pitch": pitch_score,
        "tone": tone_score
    }

    # --- Prompt matching score
    prompt_score = int(prompt_match_ratio * 100)
    scores["prompt_match"] = prompt_score

    # --- Overall Score (weighted average)
    weights = {
        "prompt_match": 0.3,  # 30% weight for matching Gemini's prompt
        "clarity": 0.2,
        "pronunciation": 0.15,
        "fluency": 0.15,
        "pitch": 0.1,
        "tone": 0.1
    }
    
    overall_score = int(sum(scores[k] * v for k, v in weights.items()))

    # --- Generate specific feedback
    feedback = {
        "summary": "",
        "improvements": [],
        "strengths": []
    }

    # Add prompt-specific feedback
    if prompt_score < 60:
        feedback["improvements"].append("Try to match the given prompt more closely")
    elif prompt_score >= 90:
        feedback["strengths"].append("Excellent adherence to the given prompt")

    # Add feature-specific feedback
    if scores["pronunciation"] < 70:
        feedback["improvements"].append("Focus on clearer pronunciation of individual words")
    elif scores["pronunciation"] >= 85:
        feedback["strengths"].append("Very clear pronunciation")

    if scores["fluency"] < 70:
        feedback["improvements"].append("Work on smoother speech flow with fewer pauses")
    elif scores["fluency"] >= 85:
        feedback["strengths"].append("Good speech fluency and natural flow")

    if scores["pitch"] < 70:
        feedback["improvements"].append("Try to vary your pitch more for engaging speech")
    elif scores["pitch"] >= 85:
        feedback["strengths"].append("Good use of pitch variation")

    if scores["tone"] < 70:
        feedback["improvements"].append("Work on matching your tone to the context")
    elif scores["tone"] >= 85:
        feedback["strengths"].append("Appropriate tone for the context")

    # Generate summary based on overall score
    if overall_score >= 90:
        feedback["summary"] = "Excellent! Your speech was clear, natural, and very well delivered."
    elif overall_score >= 80:
        feedback["summary"] = "Very good! Your speech was clear and mostly well-delivered."
    elif overall_score >= 70:
        feedback["summary"] = "Good effort! There's room for improvement in some areas."
    else:
        feedback["summary"] = "Keep practicing! Focus on the suggested improvements."

    return {
        "scores": scores,
        "overallScore": overall_score,
        "feedback": feedback
    }

# via context tone model
# import numpy as np

# def calculate_scores(pronunciation_result, fluency_result, pitch_result, tone_result):
#     """
#     Normalize and combine all feature scores into an overall score.
#     - Pronunciation: % from pronunciation_result
#     - Fluency: % from fluency_result
#     - Pitch: scaled from total pitch variation
#     - Tone: overall score from tone evaluator (0–1 scaled to 0–100)
#     """

#     # --- Pronunciation score
#     pronunciation_score = pronunciation_result.get("score_percent") \
#                           or pronunciation_result.get("score_pct") \
#                           or 0

#     # --- Fluency score
#     fluency_score = fluency_result.get("fluency_score") \
#                      or fluency_result.get("score_pct") \
#                      or 0

#     # --- Pitch variation score
#     total_pitch_variation = pitch_result.get("total_pitch_variation", 0.0)
#     pitch_score = min(int(total_pitch_variation * 200), 100)  # heuristic scaling
#     if "overall" in pitch_result and "score" in pitch_result["overall"]:
#         pitch_score = pitch_result["overall"]["score"]

#     # --- Tone score (new evaluator output)
#     tone_score = 0
#     if isinstance(tone_result, dict):
#         overall = tone_result.get("overall_score")
#         if overall is not None:
#             tone_score = int(overall * 100)

#     # --- Aggregate
#     scores = {
#         "pronunciation": pronunciation_score,
#         "fluency": fluency_score,
#         "pitch": pitch_score,
#         "tone": tone_score
#     }
#     overall_score = int(np.mean(list(scores.values())))

#     return {"scores": scores, "overallScore": overall_score}

