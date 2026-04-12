import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { clientEnv } from "../env";

// Your web app's Firebase configuration for analytics only
const firebaseConfig = {
  apiKey: clientEnv.FIREBASE_API_KEY,
  authDomain: clientEnv.FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.FIREBASE_APP_ID,
  measurementId: clientEnv.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase for analytics only
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { analytics };
