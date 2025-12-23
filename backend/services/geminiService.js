/**
 * Gemini AI Service
 */

import { getModel } from '../config/gemini.js';

const MAX_RESPONSE_LENGTH = 500;

export async function generateResponse(text) {
  console.log('[Gemini] Processing:', text.substring(0, 50));

  const model = getModel();
  
  // Create prompt with strict constraints
  const prompt = `User said: "${text}"

IMPORTANT INSTRUCTIONS:
- Respond ONLY in English language
- Keep your response under 20 words maximum
- Be concise and direct
- No explanations, just answer the question or respond to the statement

Your response:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  let responseText = response.text();

  // Truncate if too long for ESP32
  if (responseText.length > MAX_RESPONSE_LENGTH) {
    responseText = responseText.substring(0, MAX_RESPONSE_LENGTH) + '...';
  }

  return responseText.trim();
}
