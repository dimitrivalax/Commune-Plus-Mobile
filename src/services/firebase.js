import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseName: import.meta.env.VITE_FIREBASE_DATABASE_NAME || '(default)'
}

let app
export function getFirebaseApp() {
  if (!cfg.apiKey || !cfg.projectId) {
    console.warn('Firebase client: missing VITE_FIREBASE_* env vars')
  }
  if (!getApps().length) {
    app = initializeApp(cfg)
  } else {
    app = getApps()[0]
  }
  return app
}

export function getFirestoreDb() {
  const app = getFirebaseApp()
  return getFirestore(app, cfg.databaseName)
}
