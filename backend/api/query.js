/**
 * Query API Endpoint
 * 
 * POST /api/query
 * 
 * Receives audio from ESP32, transcribes with Whisper, processes with Gemini AI,
 * and stores the response in Firebase for later retrieval.
 * 
 * Request Body:
 * {
 *   "request_id": "unique-id-from-esp32",
 *   "audio": "base64-encoded-wav-audio"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "request_id": "unique-id-from-esp32",
 *   "transcription": "what user said",
 *   "message": "Query processed successfully"
 * }
 */

import { generateResponse } from '../services/geminiService.js';
import { transcribeAudio } from '../services/whisperService.js';
import { savePendingResponse, saveResponse, saveErrorResponse } from '../services/dbService.js';

// Max audio size: 2MB
const MAX_AUDIO_SIZE = 2 * 1024 * 1024;

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Use POST method' });
  }

  try {
    const { request_id, audio } = req.body || {};

    // Validate request_id
    if (!request_id || typeof request_id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(request_id)) {
      return res.status(400).json({ success: false, error: 'Valid request_id required' });
    }

    // Validate audio
    if (!audio || typeof audio !== 'string') {
      return res.status(400).json({ success: false, error: 'audio (base64) required' });
    }

    // Check audio size
    const audioSize = Math.ceil(audio.length * 0.75);
    if (audioSize > MAX_AUDIO_SIZE) {
      return res.status(400).json({ success: false, error: 'Audio too large (max 2MB)' });
    }

    console.log('[Query] Processing:', request_id);

    // Save pending status
    await savePendingResponse(request_id);

    // Transcribe audio
    let transcription;
    try {
      transcription = await transcribeAudio(audio);
      console.log('[Query] Transcribed:', transcription);
    } catch (err) {
      await saveErrorResponse(request_id, 'Transcription failed');
      return res.status(200).json({ success: false, request_id, error: 'Transcription failed' });
    }

    // Get AI response
    try {
      const aiResponse = await generateResponse(transcription);
      await saveResponse(request_id, aiResponse);
      
      return res.status(200).json({
        success: true,
        request_id,
        transcription,
        message: 'Query processed'
      });
    } catch (err) {
      await saveErrorResponse(request_id, 'AI processing failed');
      return res.status(200).json({ success: false, request_id, transcription, error: 'AI failed' });
    }

  } catch (error) {
    console.error('[Query] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
