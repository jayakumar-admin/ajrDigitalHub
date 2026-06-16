import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';
import path from 'path';

// Try to load from root and server directories
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'server/.env') });

const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT'];
const storageBucket = process.env['FIREBASE_STORAGE_BUCKET'];

let firebaseApp: any = null;
let bucket: any = null;

if (serviceAccountJson && storageBucket) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Check if app already initialized to avoid "Duplicate App" error
    const apps = getApps();
    if (apps.length === 0) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket
      });
    } else {
      firebaseApp = getApp();
    }
    
    bucket = getStorage().bucket();
    console.log('✅ Firebase Admin initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err);
    // Explicitly set to null if it failed
    firebaseApp = null;
    bucket = null;
  }
} else {
  console.warn('⚠️ Firebase credentials missing. Uploads will not work.');
}

export { firebaseApp, bucket };
