/**
 * Response API Endpoint
 * 
 * GET /api/response?request_id=xxx
 * - Poll for AI response
 * 
 * DELETE /api/response?request_id=xxx  
 * - Delete response after ESP32 retrieves it
 */

import { getResponse, deleteResponse } from '../services/dbService.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const request_id = req.query.request_id;

  // Validate request_id
  if (!request_id || !/^[a-zA-Z0-9_-]+$/.test(request_id)) {
    return res.status(400).json({ success: false, error: 'Valid request_id required' });
  }

  try {
    // GET - Fetch response
    if (req.method === 'GET') {
      const response = await getResponse(request_id);

      if (!response) {
        return res.status(404).json({ success: false, request_id, status: 'not_found' });
      }

      if (response.status === 'pending') {
        return res.status(202).json({ success: true, request_id, status: 'pending' });
      }

      return res.status(200).json({
        success: true,
        request_id,
        status: response.status,
        text: response.text
      });
    }

    // DELETE - Remove response
    if (req.method === 'DELETE') {
      await deleteResponse(request_id);
      return res.status(200).json({ success: true, request_id, message: 'Deleted' });
    }

    return res.status(405).json({ success: false, error: 'Use GET or DELETE' });

  } catch (error) {
    console.error('[Response] Error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
