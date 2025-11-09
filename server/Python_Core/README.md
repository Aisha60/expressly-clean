# Expressly Python Core - Unified Service

This is the unified Python service that handles three types of analysis:
1. **Text Analysis** - Grammar, coherence, readability, structure
2. **Body Language Analysis** - Video analysis for gestures, posture, eye contact
3. **Speech Analysis** - Audio transcription, pronunciation, fluency, tone, pitch

## Architecture

```
Python_Core/
├── app.py                      # Main FastAPI application (port 5001)
├── text_Analysis/              # Text/document analysis module
│   ├── analyzer.py
│   ├── grammar_checker.py
│   ├── coherence_analyzer.py
│   └── ...
├── bodylang_Analysis/          # Video/body language analysis module
│   ├── analyzer.py
│   ├── video_processing.py
│   └── ...
├── speech_analysis/            # Speech/audio analysis module (NEW)
│   ├── analyzer.py
│   ├── services/
│   │   ├── transcribe_audio.py
│   │   ├── fluency_service.py
│   │   ├── pronunciation_service.py
│   │   ├── pitch_service.py
│   │   └── ...
│   └── utils/
│       ├── audio_utils.py
│       └── ...
└── requirements_unified.txt    # All dependencies merged
```

## API Endpoints

### Health Check
- `GET /health` - General health check
- `GET /speech/health` - Speech module health check

### Text Analysis
- `POST /text/analyze` - Analyze text document

### Body Language Analysis
- `POST /video/analyze` - Analyze video for body language

### Speech Analysis
- `POST /speech/process-audio` - Full speech analysis (transcription, pronunciation, fluency, pitch, tone)
- `POST /speech/evaluate-feature` - Evaluate specific feature (Pronunciation|Fluency|Tone|Pitch)

## Setup Instructions

### 1. Install Dependencies

From the `server/Python_Core` directory:

```powershell
# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install unified dependencies
pip install -r requirements_unified.txt
```

### 2. Download NLTK Data

```python
import nltk
nltk.download('words')
nltk.download('punkt')
```

### 3. Verify Whisper Models

The speech analysis module will automatically download the `base.en` model on first use.

## Running the Service

### Development Mode

From `server/Python_Core` directory:

```powershell
# Activate venv
.\venv\Scripts\Activate.ps1

# Run the service
python -m uvicorn app:app --host 127.0.0.1 --port 5001 --reload
```

### Production Mode

```powershell
python -m uvicorn app:app --host 0.0.0.0 --port 5001
```

### Alternative: Run directly

```powershell
python app.py
```

## Configuration

### Environment Variables

Set in `server/.env`:

```
PYTHON_SERVICE_URL=http://localhost:5001
```

The Node.js server will forward requests to this unified Python service.

## Testing

### Test Speech Analysis

```powershell
curl.exe http://localhost:5001/speech/health
```

Expected response:
```json
{"status": "ok", "module": "speech_analysis"}
```

### Test Full Service

```powershell
curl.exe http://localhost:5001/health
```

Expected response:
```json
{"status": "ok", "service": "unified_python_core"}
```

## Migration Notes

### What Changed

1. **Speech analysis moved** from `python_service/` to `server/Python_Core/speech_analysis/`
2. **Single Python service** now runs on port 5001 (instead of separate services on 5001 and 8000)
3. **Endpoint changed**: `/process-audio` → `/speech/process-audio`
4. **Node.js controllers updated** to use new endpoint

### Old vs New

| Module | Old Port | Old Endpoint | New Port | New Endpoint |
|--------|----------|-------------|----------|--------------|
| Text Analysis | 8000 | `/analyze` | 5001 | `/text/analyze` |
| Body Language | 8000 | `/video/analyze` | 5001 | `/video/analyze` |
| Speech Analysis | 5001 | `/process-audio` | 5001 | `/speech/process-audio` |

## Troubleshooting

### Import Errors

If you see `ModuleNotFoundError`, ensure you:
1. Activated the virtual environment
2. Installed from `requirements_unified.txt`
3. Are running from the `Python_Core` directory

### Whisper Model Loading

First run downloads the model (~150MB). Subsequent runs are faster.

### Port Already in Use

If port 5001 is occupied:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force
```

## Development Workflow

1. Start Python Core service (port 5001)
2. Start Node.js server (port 5000)
3. Start React client (port 3000)

All three modules (text, video, speech) are now served by a single Python process!
