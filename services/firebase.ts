// Fix: Use inline type imports for Firebase types to resolve potential module resolution errors.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

// This check prevents the app from crashing if the user hasn't configured Firebase yet.
export const isFirebaseConfigured = 
    firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured) {
  // Initialize Firebase now that we know the config is valid
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // If not configured, we provide dummy exports. 
  // The UI will be blocked by an error screen, so these will never be used.
  console.warn("Firebase is not configured. Please add your credentials to firebaseConfig.ts");
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db };