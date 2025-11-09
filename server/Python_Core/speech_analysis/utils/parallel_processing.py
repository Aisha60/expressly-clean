from concurrent.futures import ThreadPoolExecutor
import numpy as np

def process_chunk_parallel(args):
    """Helper function for parallel processing of audio chunks"""
    from utils.audio_utils import extract_features
    chunk_data, sr, idx, start, end = args
    features = extract_features(chunk_data, sr, idx, start, end)
    return {k: float(v) if isinstance(v, (np.float32, np.float64, np.int32, np.int64)) else v
            for k, v in features.items()}