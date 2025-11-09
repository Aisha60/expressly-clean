import librosa
import numpy as np

def split_audio_into_chunks(y, sr, chunk_duration=5):
    """Split audio into chunks of specified duration."""
    chunk_length = int(sr * chunk_duration)
    chunks = []
    for i in range(0, len(y), chunk_length):
        chunk = y[i:i + chunk_length]
        start_time = i / sr
        end_time = min((i + chunk_length) / sr, len(y) / sr)
        chunks.append((chunk, start_time, end_time))
    return chunks

def extract_features(chunk_data, sr, chunk_index, start_time, end_time):
    """
    Extract audio features for a chunk, including energy, pitch, tempo, pauses.
    Returns None if features cannot be extracted.
    """
    if len(chunk_data) == 0 or len(chunk_data) < sr * 0.1:  # Require at least 100ms of audio
        print(f"Warning: Chunk {chunk_index} too short")
        return None

    try:
        features = {
            "chunk_index": chunk_index,
            "start_time": float(start_time),
            "end_time": float(end_time),
            "duration": float(end_time - start_time)
        }

        # --- Energy (RMS mean + variance)
        try:
            rms_values = librosa.feature.rms(y=chunk_data)[0]
            features.update({
                "rms_mean": float(np.mean(rms_values)),
                "rms_var": float(np.var(rms_values))
            })
        except Exception as e:
            print(f"Warning: RMS extraction failed for chunk {chunk_index}: {str(e)}")
            features.update({"rms_mean": 0.0, "rms_var": 0.0})

        # --- ZCR (zero crossing rate)
        try:
            zcr = librosa.feature.zero_crossing_rate(y=chunk_data)
            features["zcr"] = float(np.mean(zcr))
        except Exception as e:
            print(f"Warning: ZCR extraction failed for chunk {chunk_index}: {str(e)}")
            features["zcr"] = 0.0

        # --- MFCCs (spectral features)
        try:
            mfccs = librosa.feature.mfcc(y=chunk_data, sr=sr, n_mfcc=13)
            features["mfccs_mean"] = [float(np.mean(mfcc)) for mfcc in mfccs]
        except Exception as e:
            print(f"Warning: MFCC extraction failed for chunk {chunk_index}: {str(e)}")
            features["mfccs_mean"] = [0.0] * 13

        # --- Pitch estimation using pyin
        try:
            f0, voiced_flag, _ = librosa.pyin(
                chunk_data,
                fmin=librosa.note_to_hz('C2'),
                fmax=librosa.note_to_hz('C7'),
                sr=sr
            )
            valid_f0 = f0[voiced_flag]
            
            if len(valid_f0) >= 10:
                features.update({
                    "pitch_mean": float(np.mean(valid_f0)),
                    "pitch_variance": float(np.var(valid_f0)) if len(valid_f0) > 1 else 0.0,
                    "pitch_max": float(np.max(valid_f0)),
                    "pitch_min": float(np.min(valid_f0)),
                    "pitch_range": float(np.max(valid_f0) - np.min(valid_f0))
                })
            else:
                print(f"Warning: Insufficient voiced frames in chunk {chunk_index}")
                features.update({
                    "pitch_mean": 0.0,
                    "pitch_variance": 0.0,
                    "pitch_max": 0.0,
                    "pitch_min": 0.0,
                    "pitch_range": 0.0
                })
        except Exception as e:
            print(f"Warning: Pitch extraction failed for chunk {chunk_index}: {str(e)}")
            features.update({
                "pitch_mean": 0.0,
                "pitch_variance": 0.0,
                "pitch_max": 0.0,
                "pitch_min": 0.0,
                "pitch_range": 0.0
            })

        # --- Tempo (proxy for pace, in BPM)
        try:
            tempo, _ = librosa.beat.beat_track(y=chunk_data, sr=sr)
            features["tempo"] = float(tempo)
        except Exception as e:
            # Tempo extraction can fail on short/silent chunks or scipy version issues
            features["tempo"] = 0.0

        # --- Pause ratio (proportion of silence frames)
        try:
            energy_threshold = 0.01 * np.max(np.abs(chunk_data))
            features["silence_ratio"] = float(np.sum(np.abs(chunk_data) < energy_threshold) / len(chunk_data))
        except Exception as e:
            print(f"Warning: Silence ratio calculation failed for chunk {chunk_index}: {str(e)}")
            features["silence_ratio"] = 0.0

        return features

    except Exception as e:
        print(f"Error extracting features for chunk {chunk_index}: {str(e)}")
        return None

        # --- MFCCs (spectral features)
        mfccs = librosa.feature.mfcc(y=chunk_data, sr=sr, n_mfcc=13)
        mfccs_mean = [float(np.mean(mfcc)) for mfcc in mfccs]

        # --- Pitch estimation using pyin
        f0, voiced_flag, _ = librosa.pyin(
            chunk_data,
            fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C7')
        )
        valid_f0 = f0[voiced_flag]
        if len(valid_f0) < 10:
            print(f"Warning: Chunk {chunk_index} has insufficient voiced frames ({len(valid_f0)})")
            return None

        pitch_mean = float(np.mean(valid_f0))
        pitch_var = float(np.var(valid_f0)) if len(valid_f0) > 1 else 0.0
        pitch_max = float(np.max(valid_f0))
        pitch_min = float(np.min(valid_f0))
        pitch_range = pitch_max - pitch_min

        # --- Tempo (proxy for pace, in BPM)
        try:
            tempo, _ = librosa.beat.beat_track(y=chunk_data, sr=sr)
            tempo = float(tempo)
        except:
            tempo = 0.0

        # --- Pause ratio (proportion of silence frames)
        energy_threshold = 0.01 * np.max(np.abs(chunk_data))
        silence_ratio = float(np.sum(np.abs(chunk_data) < energy_threshold) / len(chunk_data))

        # --- Jitter & shimmer placeholders
        jitter = None
        shimmer = None
        # (explain in report: real jitter/shimmer require Praat/parselmouth)

        return {
            "chunk_index": chunk_index,
            "start_time": float(start_time),
            "end_time": float(end_time),
            "duration": float(end_time - start_time),
            "rms_mean": rms_mean,
            "rms_var": rms_var,
            "zcr": zcr,
            "mfccs_mean": mfccs_mean,
            "pitch_mean": pitch_mean,
            "pitch_variance": pitch_var,
            "pitch_max": pitch_max,
            "pitch_min": pitch_min,
            "pitch_range": pitch_range,
            "tempo": tempo,
            "pause_ratio": silence_ratio,
            "jitter": jitter,
            "shimmer": shimmer
        }

    except Exception as e:
        print(f"Error extracting features for chunk {chunk_index}: {e}")
        return None
