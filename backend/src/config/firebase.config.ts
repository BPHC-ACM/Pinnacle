import * as admin from 'firebase-admin';

import { logger } from './logger.config';

let firebaseApp: admin.app.App | null = null;

/**
 * Get the Firebase Admin instance (lazy initialization)
 * Returns null if Firebase is not configured
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable (base64-encoded service account JSON)
 */
export function getFirebaseAdmin(): admin.app.App | null {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Push notifications will be disabled.');
      return null;
    }

    // Decode the base64-encoded service account JSON
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8'),
    ) as admin.ServiceAccount;

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Firebase Admin SDK');
    return null;
  }
}
