/**
 * Whisper Transcription Service (via Groq)
 */

import { getGroqClient } from '../config/whisper.js';

export async function transcribeAudio(base64Audio) {
  const groq = getGroqClient();
  
  // Decode base64 to buffer
  const audioBuffer = Buffer.from(base64Audio, 'base64');
  
  // Create a File-like object
  const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    response_format: 'text'
  });

  return transcription.trim();
}
