# NEWEST ONE
import cv2
import mediapipe as mp
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def process_video(video_path, frame_skip=3):
    """
    Unified video processing pipeline for single-speaker videos.
    - Uses MediaPipe Holistic for pose, hands, face landmarks.
    - Handles full-body, chest-up, sitting, standing videos.
    - Includes only high-visibility landmarks for robustness.
    """
    results_data = {
        "frames": [],
        "meta": {
            "total_frames": 0,
            "processed_frames": 0,
            "usable_frames": 0,
            "fps": 0,
            "duration_sec": 0,
            "width": 0,
            "height": 0,
            "warnings": []
        }
    }

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        results_data["meta"]["warnings"].append("Could not open video")
        logger.error(f"Failed to open video: {video_path}")
        return results_data

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 10
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480
    duration = total_frames / fps if fps else 0

    results_data["meta"].update({
        "total_frames": total_frames,
        "fps": fps,
        "duration_sec": duration,
        "width": width,
        "height": height
    })

    mp_holistic = mp.solutions.holistic
    with mp_holistic.Holistic(
        static_image_mode=False,
        refine_face_landmarks=True,
        min_detection_confidence=0.5,
        model_complexity=1
    ) as holistic:
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_skip != 0:
                frame_idx += 1
                continue

            # Downscale high-resolution frames for efficiency
            if width > 720:
                frame = cv2.resize(frame, (720, int(720 * height / width)))
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = holistic.process(rgb)

            frame_data = {"frame_idx": frame_idx}
            usable = False

            # Pose landmarks (only include visible)
            if res.pose_landmarks:
                lm = res.pose_landmarks.landmark
                frame_data["pose"] = {}
                if lm[0].visibility > 0.5:
                    frame_data["pose"]["nose"] = (lm[0].x, lm[0].y)
                if lm[11].visibility > 0.5:
                    frame_data["pose"]["left_shoulder"] = (lm[11].x, lm[11].y)
                if lm[12].visibility > 0.5:
                    frame_data["pose"]["right_shoulder"] = (lm[12].x, lm[12].y)
                if lm[23].visibility > 0.5:
                    frame_data["pose"]["left_hip"] = (lm[23].x, lm[23].y)
                if lm[24].visibility > 0.5:
                    frame_data["pose"]["right_hip"] = (lm[24].x, lm[24].y)
                if frame_data["pose"]:
                    usable = True
                else:
                    results_data["meta"]["warnings"].append(f"⚠️ No usable pose landmarks at frame {frame_idx}")

            # Hands
            frame_data["hands"] = {}
            if res.left_hand_landmarks:
                lw = res.left_hand_landmarks.landmark[0]
                frame_data["hands"]["left_wrist"] = (lw.x, lw.y)
                usable = True
            if res.right_hand_landmarks:
                rw = res.right_hand_landmarks.landmark[0]
                frame_data["hands"]["right_wrist"] = (rw.x, rw.y)
                usable = True

            # Face landmarks
            if res.face_landmarks:
                lm = res.face_landmarks.landmark
                frame_data["face"] = {
                    "mouth_left": (lm[61].x, lm[61].y),
                    "mouth_right": (lm[291].x, lm[291].y),
                    "mouth_top": (lm[13].x, lm[13].y),
                    "mouth_bottom": (lm[14].x, lm[14].y),
                    "left_eye": (lm[33].x, lm[33].y),
                    "right_eye": (lm[263].x, lm[263].y)
                }
                usable = True

            # Edge cases
            if not usable:
                results_data["meta"]["warnings"].append(f"⚠️ No person detected at frame {frame_idx}")
            elif res.pose_landmarks and not res.face_landmarks:
                results_data["meta"]["warnings"].append(f"⚠️ Face not detected at frame {frame_idx}")
            if frame_data.get("pose"):
                ls = frame_data["pose"].get("left_shoulder")
                rs = frame_data["pose"].get("right_shoulder")
                if ls and rs:
                    shoulder_width = abs(ls[0] - rs[0])
                    if shoulder_width < 0.1:
                        results_data["meta"]["warnings"].append(f"⚠️ Possible facing away at frame {frame_idx}")

            logger.debug(f"Frame {frame_idx}: face={bool(frame_data.get('face'))}, pose={bool(frame_data.get('pose'))}, hands={bool(frame_data.get('hands'))}")

            results_data["frames"].append(frame_data)
            results_data["meta"]["processed_frames"] += 1
            if usable:
                results_data["meta"]["usable_frames"] = results_data["meta"].get("usable_frames", 0) + 1
            frame_idx += 1

    cap.release()
    return results_data

def _is_present(obj):
    """Check if object is non-empty."""
    if not obj:
        return False
    if isinstance(obj, dict):
        return bool(obj)
    try:
        if hasattr(obj, "__len__") and len(obj) == 0:
            return False
    except:
        pass
    try:
        if hasattr(obj, "landmark"):
            return len(obj.landmark) > 0
    except:
        pass
    return True

def _count_hands(hands_obj):
    """Return number of hands detected."""
    if not _is_present(hands_obj):
        return 0
    if isinstance(hands_obj, dict):
        return sum(1 for k in ("left_wrist", "right_wrist") if hands_obj.get(k))
    logger.warning(f"Unexpected hands_obj type: {type(hands_obj)}")
    return 1

def _face_bbox_and_mouth(frame_face):
    """Compute normalized face bbox and mouth height."""
    if not isinstance(frame_face, dict):
        logger.warning(f"Invalid face object type: {type(frame_face)}")
        return None, None
    try:
        ys = [v[1] for v in frame_face.values() if isinstance(v, (tuple, list)) and len(v) >= 2]
        if not ys:
            return None, None
        bbox_h = max(ys) - min(ys)
        mouth_top = frame_face.get("mouth_top")
        mouth_bottom = frame_face.get("mouth_bottom")
        if mouth_top and mouth_bottom:
            mouth_h = abs(mouth_top[1] - mouth_bottom[1])
        else:
            mouth_h = None
        return bbox_h, mouth_h
    except Exception as e:
        logger.warning(f"Error computing face bbox: {str(e)}")
        return None, None

def validate_video(processed_results, min_usable_ratio=0.30, min_processed_ratio=0.05,
                   face_small_bbox_thresh=0.06, mouth_small_thresh=0.02, face_covered_frame_ratio=0.5,
                   facing_away_ratio=0.5):
    """
    Validate processed video for single-speaker analysis.
    - Rejects: No person, insufficient frames, facing away too much.
    - Allows partial analysis (full-body, chest-up).
    - No multi-person check (uses Holistic for single person).
    """
    meta = processed_results.get("meta", {})
    frames = processed_results.get("frames", [])
    total_frames = meta.get("total_frames", 0)
    processed_frames = meta.get("processed_frames", len(frames))
    usable_frames = meta.get("usable_frames", 0)

    flags = []
    metrics = {
        "total_frames": total_frames,
        "processed_frames": processed_frames,
        "usable_frames": usable_frames
    }

    # No processed frames
    if processed_frames == 0:
        return {
            "valid": False,
            "reason": "No frames were processed or no landmarks extracted.",
            "flags": ["No usable frames"],
            "analysis_mode": {"use_pose": False, "use_face": False, "use_hands": False},
            "metrics": metrics
        }

    # Too few processed frames
    if total_frames and processed_frames < max(1, int(total_frames * min_processed_ratio)):
        return {
            "valid": False,
            "reason": "Insufficient processed frames (video likely irrelevant or unreadable).",
            "flags": ["Too few processed frames"],
            "analysis_mode": {"use_pose": False, "use_face": False, "use_hands": False},
            "metrics": metrics
        }

    # Too few usable frames
    usable_ratio = usable_frames / processed_frames if processed_frames else 0.0
    metrics["usable_ratio"] = round(usable_ratio, 3)
    if usable_ratio < min_usable_ratio:
        return {
            "valid": False,
            "reason": f"Subject is out of frame or obscured for too many frames (usable ratio={usable_ratio:.2f}).",
            "flags": ["Subject out of frame"],
            "analysis_mode": {"use_pose": False, "use_face": False, "use_hands": False},
            "metrics": metrics
        }

    # Count modalities
    face_frames = 0
    pose_frames = 0
    hands_frames = 0
    face_small_count = 0
    mouth_small_count = 0
    facing_away_count = sum(1 for w in meta.get("warnings", []) if "facing away" in w)

    for frame in frames:
        face_obj = frame.get("face")
        pose_obj = frame.get("pose")
        hands_obj = frame.get("hands")

        if _is_present(face_obj):
            face_frames += 1
            bbox_h, mouth_h = _face_bbox_and_mouth(face_obj)
            if bbox_h and bbox_h < face_small_bbox_thresh:
                face_small_count += 1
            if mouth_h and mouth_h < mouth_small_thresh:
                mouth_small_count += 1
        if _is_present(pose_obj) and pose_obj.get("left_shoulder") and pose_obj.get("right_shoulder"):
            pose_frames += 1
        if _is_present(hands_obj):
            hands_frames += 1

    metrics.update({
        "face_frames": face_frames,
        "pose_frames": pose_frames,
        "hands_frames": hands_frames,
        "face_small_count": face_small_count,
        "mouth_small_count": mouth_small_count,
        "facing_away_count": facing_away_count
    })

    # Facing away check
    facing_away_ratio_actual = facing_away_count / processed_frames if processed_frames else 0
    metrics["facing_away_ratio"] = round(facing_away_ratio_actual, 3)
    if facing_away_ratio_actual > facing_away_ratio:
        return {
            "valid": False,
            "reason": "Person facing away in too many frames—please face the camera.",
            "flags": ["Facing away detected"],
            "analysis_mode": {"use_pose": False, "use_face": False, "use_hands": False},
            "metrics": metrics
        }

    # Face occluded/small
    face_disabled = False
    if face_frames > 0:
        face_coverage_ratio = 1 - (face_small_count / face_frames) if face_frames else 0
        mouth_coverage_ratio = 1 - (mouth_small_count / face_frames) if face_frames else 0
        metrics["face_coverage_ratio"] = round(face_coverage_ratio, 3)
        metrics["mouth_coverage_ratio"] = round(mouth_coverage_ratio, 3)
        if (face_small_count / face_frames) >= face_covered_frame_ratio:
            flags.append("Face too small or occluded—expression scoring disabled.")
            face_disabled = True

    # Modalities
    face_ratio = face_frames / processed_frames if processed_frames else 0
    use_face = face_ratio >= 0.30 and not face_disabled
    pose_ratio = pose_frames / processed_frames if processed_frames else 0
    hands_ratio = hands_frames / processed_frames if processed_frames else 0

    use_pose = pose_ratio >= 0.30
    use_hands = hands_ratio >= 0.30



    if not use_pose:
        flags.append(f"Pose landmarks insufficient ({pose_frames}/{processed_frames}). Posture scoring disabled.")
    if not use_face:
        flags.append(f"Face landmarks insufficient ({face_frames}/{processed_frames}). Expression scoring disabled.")
    if not use_hands:
        flags.append(f"Hand landmarks insufficient ({hands_frames}/{processed_frames}). Gesture scoring disabled.")

    if not (use_pose or use_face or use_hands):
        return {
            "valid": False,
            "reason": "Insufficient detectable landmarks for analysis.",
            "flags": ["Insufficient landmark coverage"],
            "analysis_mode": {"use_pose": False, "use_face": False, "use_hands": False},
            "metrics": metrics
        }
    logger.debug(f"Validation result: {metrics}")
    return {
        "valid": True,
        "reason": "Video validated for analysis.",
        "flags": flags,
        "analysis_mode": {"use_pose": use_pose, "use_face": use_face, "use_hands": use_hands},
        "metrics": metrics
    }
