# ESP32 Voice Assistant Backend

Serverless backend for ESP32 voice assistant. Receives audio, transcribes with Whisper (Groq), processes with Gemini AI, stores in Firebase.

## API Endpoints

### POST /api/query
Send audio from ESP32.

```json
{
  "request_id": "unique-id",
  "audio": "base64-encoded-wav"
}
```

Response:
```json
{
  "success": true,
  "request_id": "unique-id",
  "transcription": "what user said",
  "message": "Query processed"
}
```

### GET /api/response?request_id=xxx
Poll for AI response.

Response:
```json
{
  "success": true,
  "request_id": "xxx",
  "status": "completed",
  "text": "AI response here"
}
```

### DELETE /api/response?request_id=xxx
Delete response after reading.

## Environment Variables (Vercel)

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

GEMINI_API_KEY=your-gemini-api-key

GROQ_API_KEY=your-groq-api-key
```

## ESP32 Workflow

1. Record audio (WAV, max 2MB)
2. Base64 encode
3. POST to `/api/query` with `request_id` and `audio`
4. Poll `/api/response?request_id=xxx` until status is `completed`
5. DELETE `/api/response?request_id=xxx` to clean up
