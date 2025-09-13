// Firebase configuration - this file is now deprecated
// Firebase is initialized directly in index.html
// This file is kept for backward compatibility

console.warn('firebase-config.js is deprecated. Firebase is now initialized in index.html');

// Export empty functions for compatibility
export function sendOTP(phoneNumber) {
  console.error('Use firebase-auth.js functions instead');
  return Promise.reject(new Error('Use firebase-auth.js functions instead'));
}
