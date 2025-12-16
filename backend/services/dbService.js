/**
 * Firebase Database Service
 */

import { getRef } from '../config/firebase.js';

export async function savePendingResponse(requestId) {
  const ref = getRef(`responses/${requestId}`);
  await ref.set({
    text: null,
    status: 'pending',
    timestamp: Date.now()
  });
}

export async function saveResponse(requestId, text) {
  const ref = getRef(`responses/${requestId}`);
  await ref.set({
    text,
    status: 'completed',
    timestamp: Date.now()
  });
}

export async function saveErrorResponse(requestId, errorMessage) {
  const ref = getRef(`responses/${requestId}`);
  await ref.set({
    text: errorMessage,
    status: 'error',
    timestamp: Date.now()
  });
}

export async function getResponse(requestId) {
  const ref = getRef(`responses/${requestId}`);
  const snapshot = await ref.once('value');
  return snapshot.val();
}

export async function deleteResponse(requestId) {
  const ref = getRef(`responses/${requestId}`);
  await ref.remove();
}
