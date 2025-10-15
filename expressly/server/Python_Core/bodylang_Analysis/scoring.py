
import numpy as np
import logging

# Setup logging for debugging invalid metadata
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.WARNING)  # Adjust level as needed

# --- Helpers -----------------------------------------------------------------
def safe_get(frame, *keys):
    """Return nested value or None without throwing."""
    cur = frame
    for k in keys:
        if cur is None or k not in cur:
            return None
        cur = cur[k]
    return cur

def to_pixels(norm_xy, width, height):
    """(x,y) normalized -> (px, py)"""
    if norm_xy is None:
        return None
    x, y = norm_xy
    return (x * width, y * height)

def pct(v): return round(v * 100, 2)

def score_posture(processed, min_frames=8):
    """
    Score posture based on processed frames. Tuned for formal scenarios: emphasizes upright, stable posture for confidence.
    """
    frames = processed.get("frames", [])
    meta = processed.get("meta", {})
    validation = meta.get("validation", {})
    width = meta.get("width", 640) or 640
    height = meta.get("height", 480) or 480
    pose_frames = validation.get("pose_frames", 0)  # From validation

    if pose_frames < min_frames:
        return {
            "score": None,
            "reason": "insufficient_pose_frames",
            "message": ["We couldn't analyze your posture because there weren't enough clear frames. Try keeping your upper body visible!"]
        }

    angles = []
    shoulder_tilt_flags = 0
    slouch_flags = 0
    valid = 0
    bad_frames = []  

    for f in frames:
        pose = f.get("pose")
        if not pose:
            continue

        nose = pose.get("nose")
        ls = pose.get("left_shoulder")
        rs = pose.get("right_shoulder")
        lh = pose.get("left_hip")
        rh = pose.get("right_hip")

        if None in (nose, ls, rs, lh, rh):
            continue

        nose_px = (nose[0] * width, nose[1] * height)
        hip_mid = ((lh[0] + rh[0]) / 2.0, (lh[1] + rh[1]) / 2.0)
        hip_mid_px = (hip_mid[0] * width, hip_mid[1] * height)

        dx = nose_px[0] - hip_mid_px[0]
        dy = nose_px[1] - hip_mid_px[1]
        angle_deg = np.degrees(np.arctan2(dy, dx)) 
        if angle_deg < -180: angle_deg += 360  # Normalize -180 to 180
        angles.append(angle_deg)

        ls_y = ls[1] * height
        rs_y = rs[1] * height
        shoulder_diff_px = abs(ls_y - rs_y)
        frame_idx = f.get("frame_idx", -1)
        if shoulder_diff_px > 0.05 * height:
            shoulder_tilt_flags += 1
            if len(bad_frames) < 3:
                bad_frames.append((frame_idx, "tilted"))
        if abs(angle_deg) > 12:  # Ergonomic threshold for slouch (forward lean)
            slouch_flags += 1
            if len(bad_frames) < 3:
                bad_frames.append((frame_idx, "slouched"))

        valid += 1

    if valid == 0:
        return {
            "score": None,
            "reason": "no_pose_detected",
            "message": ["We couldn't detect your posture clearly. Make sure your upper body and hips are in the frame!"]
        }

    mean_angle = float(np.mean(angles))
    angle_std = float(np.std(angles))
    slouch_pct = slouch_flags / valid
    tilt_pct = shoulder_tilt_flags / valid

    score = 100.0
    score -= np.interp(angle_std, [0.0, 8.0, 20.0], [0.0, 10.0, 40.0])  # Instability penalty
    score -= (slouch_pct * 50.0)  # Heavier for confidence (up from 40)
    score -= (tilt_pct * 20.0)  # Lighter, as minor tilt is common
    score = max(0.0, round(score / 10))  # Normalize to 0-10

    feedbacks = []
    if slouch_pct > 0.25:
        feedbacks.append("You’re leaning forward or back a bit too often. Try sitting up straighter to boost your confidence!")
    if tilt_pct > 0.15:
        feedbacks.append("Your shoulders seem uneven at times. Keep them level for a stronger, more polished look.")
    if angle_std > 10:
        feedbacks.append("Your posture shifts a lot. Stay steady to project a calm, confident vibe.")
    if not feedbacks:
        feedbacks.append("Great job! Your posture is upright and confident.")

    return {
        "score": score,
        "mean_torso_angle_deg": round(mean_angle, 2),
        "angle_std_deg": round(angle_std, 2),
        "slouched_percent": round(slouch_pct * 100, 1),
        "tilted_percent": round(tilt_pct * 100, 1),
        "feedback": feedbacks,
        "bad_frames": bad_frames 
    }

# --- Gesture scoring --------------------------------------------------------
def score_gestures(processed, min_frames=8):
    """
    Gesture scoring for formal scenarios: moderate, purposeful gestures (1-3 per 10s ≈6-18 per min) for engagement without fidgeting.
    """
    frames = processed.get("frames", [])
    meta = processed.get("meta", {})
    validation = meta.get("validation", {})
    width = meta.get("width", 640) or 640
    fps = meta.get("fps", 10) or 10
    if fps <= 0:
        fps = 10
        logger.warning("Invalid FPS; using fallback=10")
    processed_frames = len(frames)
    hands_frames = validation.get("hands_frames", 0)  # From validation

    if processed_frames < min_frames or hands_frames < min_frames:
        return {
            "score": None,
            "reason": "insufficient_hand_frames",
            "message": ["We couldn’t track your hands enough to analyze gestures. Keep them visible in the frame!"]
        }

    duration_s = max(processed_frames / fps, 1e-3)

    left_positions = []
    right_positions = []
    left_visible = 0
    right_visible = 0

    # Smooth wrist positions to reduce noise
    for i, f in enumerate(frames):
        lw = safe_get(f, "hands", "left_wrist")
        rw = safe_get(f, "hands", "right_wrist")
        # Average with previous/next frame if available
        lw_smooth = lw
        rw_smooth = rw
        if lw and i > 0 and i < len(frames) - 1:
            prev_lw = safe_get(frames[i-1], "hands", "left_wrist")
            next_lw = safe_get(frames[i+1], "hands", "left_wrist")
            if prev_lw and next_lw:
                lw_smooth = ((lw[0] + prev_lw[0] + next_lw[0]) / 3, (lw[1] + prev_lw[1] + next_lw[1]) / 3)
        if rw and i > 0 and i < len(frames) - 1:
            prev_rw = safe_get(frames[i-1], "hands", "right_wrist")
            next_rw = safe_get(frames[i+1], "hands", "right_wrist")
            if prev_rw and next_rw:
                rw_smooth = ((rw[0] + prev_rw[0] + next_rw[0]) / 3, (rw[1] + prev_rw[1] + next_rw[1]) / 3)
        
        if lw_smooth:
            left_positions.append((lw_smooth[0] * width, lw_smooth[1] * meta.get("height", 480)))
            left_visible += 1
        else:
            left_positions.append(None)
        if rw_smooth:
            right_positions.append((rw_smooth[0] * width, rw_smooth[1] * meta.get("height", 480)))
            right_visible += 1
        else:
            right_positions.append(None)

    total_possible = 2 * processed_frames
    visible_pct = (left_visible + right_visible) / total_possible

    # Movement analysis
    gesture_count = 0
    movement_mags = []
    jitter_events = 0
    large_thresh = 0.05 * width  # Purposeful gesture
    small_thresh = 0.012 * width  # Jitter wiggle (increased from 0.008 to reduce noise)
    for i in range(1, processed_frames):
        for prev, curr in ((left_positions[i-1], left_positions[i]), (right_positions[i-1], right_positions[i])):
            if prev is None or curr is None:
                continue
            dx = curr[0] - prev[0]
            dy = curr[1] - prev[1]
            mag = np.sqrt(dx * dx + dy * dy)
            movement_mags.append(mag)
            if mag > large_thresh:
                gesture_count += 1
            elif small_thresh < mag <= small_thresh * 4:
                jitter_events += 1

    gestures_per_10s = (gesture_count / duration_s) * 10.0
    jitter_rate = jitter_events / max(1.0, duration_s)

    score = 100.0

    # Penalize low visibility (stricter for formal: open body language key)
    if visible_pct < 0.5:
        score -= 30.0 * (0.5 - visible_pct) / 0.5  

    # Ideal: 1-3 per 10s for moderate engagement in formal talks
    if gestures_per_10s < 1.0:
        score -= (1.0 - gestures_per_10s) * 20.0
    elif gestures_per_10s > 3.0:
        score -= (gestures_per_10s - 3.0) * 10.0

    # Jitter penalty (fidgeting indicates nervousness)
    score -= np.interp(jitter_rate, [0.0, 0.5, 2.0], [0.0, 10.0, 30.0])

    score = max(0.0, round(score / 10))  # Normalize to 0-10

    fb = []
    if visible_pct < 0.7:
        fb.append("Your hands are often out of sight. Try keeping them visible to show open, engaging body language.")
    if gestures_per_10s < 1.0:
        fb.append("Add a few purposeful gestures to highlight your points and connect with your audience.")
    if gestures_per_10s > 3.0:
        fb.append("You’re using a lot of gestures. Slow down a bit to keep the focus on your message.")
    if jitter_rate > 0.5:
        fb.append("Your hands seem a bit fidgety. Relax them to project a calmer presence.")
    if not fb:
        fb.append("Awesome! Your gestures are natural and engaging.")

    logger.debug(f"Gestures: count={gesture_count}, jitter_events={jitter_events}, visible_pct={visible_pct}")

    return {
        "score": score,
        "visible_hands_percent": round(visible_pct * 100, 1),
        "gesture_rate_per_10s": round(gestures_per_10s, 2),
        "jitter_rate_per_s": round(jitter_rate, 3),
        "feedback": fb
    }

# --- Expression scoring -----------------------------------------------------
def score_expressions(processed, min_frames=8):
    """
    Expression scoring for formal scenarios: strong eye contact (70%+), balanced smiles (20-60%), low variability.
    Detects only nervousness (rapid eye shifts, small mouth).
    """
    frames = processed.get("frames", [])
    meta = processed.get("meta", {})
    validation = meta.get("validation", {})
    width = meta.get("width", 640) or 640
    height = meta.get("height", 480) or 480
    processed_frames = len(frames)
    face_frames = validation.get("face_frames", 0)  # From validation

    if processed_frames < min_frames or face_frames < min_frames:
        return {
            "score": None,
            "reason": "insufficient_face_frames",
            "message": ["We couldn’t see your face clearly enough to analyze expressions. Keep your face in the frame!"]
        }

    fps = meta.get("fps", 10) or 10
    if fps <= 0:
        fps = 10
        logger.warning("Invalid FPS; using fallback=10")
    duration_s = max(processed_frames / fps, 1e-3)

    smile_flags = []
    eye_contact_flags = []
    expr_states = []  # 0=neutral, 1=smile, 3=nervous
    nervous_flags = []
    eye_offsets = []  # For nervousness (rapid eye shifts)

    for f in frames:
        face = f.get("face", {})
        ml = face.get("mouth_left")
        mr = face.get("mouth_right")
        mt = face.get("mouth_top")
        mb = face.get("mouth_bottom")
        le = face.get("left_eye")
        re = face.get("right_eye")

        if None in (ml, mr, mt, mb, le, re):
            expr_states.append(0)  # Neutral for missing
            smile_flags.append(False)
            eye_contact_flags.append(False)
            nervous_flags.append(False)
            eye_offsets.append(0)
            continue

        ml_px = to_pixels(ml, width, height)
        mr_px = to_pixels(mr, width, height)
        mt_px = to_pixels(mt, width, height)
        mb_px = to_pixels(mb, width, height)

        mouth_w = np.linalg.norm(np.array(ml_px) - np.array(mr_px))
        mouth_h = np.linalg.norm(np.array(mt_px) - np.array(mb_px)) + 1e-6
        smile_ratio = mouth_w / mouth_h
        smile_flags.append(smile_ratio)

        eye_mid_x = (le[0] + re[0]) / 2.0
        mouth_mid_x = (ml[0] + mr[0]) / 2.0
        horiz_off = abs(eye_mid_x - mouth_mid_x)
        eye_contact_flags.append(horiz_off < 0.08)
        eye_offsets.append(horiz_off)

        # Nervousness: small mouth (pursed lips) or rapid eye shifts (tracked via eye_offsets std)
        is_nervous = (mouth_w < 0.04 * width and mouth_h < 0.04 * height)
        nervous_flags.append(is_nervous)

        # Expression state
        if is_nervous:
            expr_states.append(3)  # Nervous
        elif smile_ratio > 1.8:
            expr_states.append(1)  # Smile
        else:
            expr_states.append(0)  # Neutral

    smile_array = np.array([s for s in smile_flags if s is not False])
    if len(smile_array) == 0:
        return {
            "score": None,
            "reason": "no_face_data",
            "message": ["We couldn’t detect your facial landmarks clearly. Try keeping your face centered in the frame!"]
        }
    median = np.median(smile_array)
    smiles = (smile_array > (median * 1.35)).sum()
    smile_pct = smiles / len(smile_array)

    eye_contact_pct = sum(1 for v in eye_contact_flags if v) / max(1, len(eye_contact_flags))
    nervous_pct = sum(nervous_flags) / max(1, len(nervous_flags))

    transitions = sum(1 for i in range(1, len(expr_states)) if expr_states[i] != expr_states[i-1])
    transitions_per_10s = (transitions / duration_s) * 10.0

    # Nervousness: high eye offset variability
    eye_offset_std = np.std(eye_offsets) if eye_offsets else 0
    is_nervous_eye = eye_offset_std > 0.02  # Tuned for rapid eye shifts

    score = 100.0

    # Smile: 20-60% for natural warmth
    if smile_pct < 0.2:
        score -= (0.2 - smile_pct) * 40.0
    elif smile_pct > 0.6:
        score -= (smile_pct - 0.6) * 30.0

    # Eye contact: Stricter for formal (70%+ ideal)
    if eye_contact_pct < 0.7:
        score -= (0.7 - eye_contact_pct) * 50.0

    # Transitions: >3 per 10s indicates volatility
    score -= np.interp(transitions_per_10s, [0.0, 3.0, 6.0], [0.0, 10.0, 30.0])

    # Negative expressions (only nervousness)
    if nervous_pct > 0.2 or is_nervous_eye:
        score -= 12.5  # Moderate penalty for nervousness

    score = max(0.0, round(score / 10))  # Normalize to 0-10

    fb = []
    if smile_pct < 0.2:
        fb.append("Add a gentle smile now and then to appear warm and approachable.")
    elif smile_pct > 0.6:
        fb.append("You’re smiling a lot! Try using smiles sparingly to emphasize key moments.")
    if eye_contact_pct < 0.7:
        fb.append("Try looking directly at the camera more to connect with your audience.")
    if transitions_per_10s > 3.0:
        fb.append("Your expressions change quickly. Keep them steady to show calm confidence.")
    if nervous_pct > 0.2 or is_nervous_eye:
        fb.append("Your expressions or eye movements seem a bit nervous. Relax and maintain steady focus.")
    if not fb:
        fb.append("Nice work! Your facial expressions are natural and engaging.")

    logger.debug(f"Expressions: nervous_pct={nervous_pct}, eye_offset_std={eye_offset_std}")

    return {
        "score": score,
        "smile_percent": round(smile_pct * 100, 1),
        "eye_contact_percent": round(eye_contact_pct * 100, 1),
        "expression_transitions_per_10s": round(transitions_per_10s, 2),
        "nervous_percent": round(nervous_pct * 100, 1),
        "feedback": fb
    }

# --- Orchestrator -----------------------------------------------------------
def score_video(processed):
    """
    Top-level API: Honors analysis_mode from validation, returns posture, gestures, expressions, and overall weighted average.
    Organizes feedback into Strengths, Weaknesses, and Summary of Tips. Computes overall score with available data.
    Weightages: Posture 30%, Gestures 30%, Expressions 40%.
    """
    mode = processed.get("analysis_mode", {"use_pose": True, "use_face": True, "use_hands": True})
    
    posture = score_posture(processed) if mode["use_pose"] else {
        "score": None, "reason": "disabled", "message": ["Posture analysis was skipped because we couldn’t detect enough data. Keep your upper body in view!"]
    }
    gestures = score_gestures(processed) if mode["use_hands"] else {
        "score": None, "reason": "disabled", "message": ["Gesture analysis was skipped because we couldn’t see your hands clearly. Try keeping them in the frame!"]
    }
    expressions = score_expressions(processed) if mode["use_face"] else {
        "score": None, "reason": "disabled", "message": ["Expression analysis was skipped because we couldn’t detect your face clearly. Keep your face centered!"]
    }

    scores = [s["score"] for s in (posture, gestures, expressions) if s["score"] is not None]
    overall = 0.0
    weight_sum = 0.0

    if posture["score"] is not None:
        overall += 0.3 * posture["score"]
        weight_sum += 0.3
    if gestures["score"] is not None:
        overall += 0.3 * gestures["score"]
        weight_sum += 0.3
    if expressions["score"] is not None:
        overall += 0.4 * expressions["score"]
        weight_sum += 0.4

    
    if weight_sum == 0:
        overall = 0.0  # Default to 0 if no scores available

    overall = round(overall,1) 
    
    # Collect and categorize feedback
    all_feedback = [part.get("feedback") or part.get("message", []) 
                    for part in (posture, gestures, expressions) 
                    if part.get("feedback") or part.get("message")]
    all_feedback = [item for sublist in all_feedback for item in sublist]  # Flatten list

    strengths = [fb for fb in all_feedback if any(pos in fb.lower() for pos in ["great", "nice", "awesome", "natural", "confident"])]
    weaknesses = [fb for fb in all_feedback if any(neg in fb.lower() for neg in ["try", "often", "seem", "should"]) and not any(pos in fb.lower() for pos in ["great", "nice", "awesome", "natural", "confident"])]
    tips = []

    # Add specific tips based on weaknesses
    if any("posture" in fb.lower() for fb in weaknesses):
        tips.append("Keep your upper body and hips visible for better posture analysis.")
    if any("hands" in fb.lower() or "gestures" in fb.lower() for fb in weaknesses):
        tips.append("Keep hands in frame and use purposeful, steady gestures.")
    if any("expressions" in fb.lower() or "smile" in fb.lower() or "eye contact" in fb.lower() for fb in weaknesses):
        tips.append("Maintain steady eye contact and use smiles sparingly for warmth.")
    if any("nervous" in fb.lower() for fb in weaknesses):
        tips.append("Relax your face and eyes to reduce nervous movements.")
    if not tips and strengths:  # If no weaknesses, suggest refinement
        tips.append("Continue refining your strong performance with practice.")

    # Add partial analysis note if applicable
    missing = []
    if posture["score"] is None:
        missing.append("Posture (no detectable pose landmarks)" if posture["reason"] == "no_pose_detected" else "Posture")
    if gestures["score"] is None:
        missing.append("Gestures")
    if expressions["score"] is None:
        missing.append("Expressions")
    if missing:
        weaknesses.insert(0, f"Partial analysis: {', '.join(missing)} missing. Try adjusting your frame to include all body parts.")

    return {
        "posture": posture,
        "gestures": gestures,
        "expressions": expressions,
        "overall": {
            "average_score": overall,
            "feedback": {
                "Strengths": strengths if strengths else ["No notable strengths identified."],
                "Weaknesses": weaknesses if weaknesses else ["No notable weaknesses identified."],
                "Summary of Tips": tips if tips else ["Keep up the good work and practice consistently."]
            }
        }
    }