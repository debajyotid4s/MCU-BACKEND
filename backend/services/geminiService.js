/**
 * Gemini AI Service
 */

import { getModel } from '../config/gemini.js';

const MAX_RESPONSE_LENGTH = 500;

export async function generateResponse(text) {
  console.log('[Gemini] Processing:', text.substring(0, 50));

  const model = getModel();
  const result = await model.generateContent(text);
  const response = result.response;
  let responseText = response.text();

  // Truncate if too long for ESP32
  if (responseText.length > MAX_RESPONSE_LENGTH) {
    responseText = responseText.substring(0, MAX_RESPONSE_LENGTH) + '...';
  }

  return responseText.trim();
}
