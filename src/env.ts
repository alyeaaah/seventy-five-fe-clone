import { z } from "zod";

const schema = z.object({
  AUTH_COOKIE_NAME: z.string(),
  SECRET_KEY: z.string(),
  API_BASE_URL: z.string().transform((url) => url.replace(/\/$/, "")),
  // GOOGLE_MAP_API_KEY: z.string(),
  BASENAME: z.string(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_APP_ID: z.string(),
  FIREBASE_MEASUREMENT_ID: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string(),
  FIREBASE_MESSAGING_SENDER_ID: z.string(),
  FIREBASE_SCORE_COLLECTION: z.string(),
  FIREBASE_FIRESTORE_SECRET_KEY: z.string(),
});

export const clientEnv = schema.parse({
  SECRET_KEY: import.meta.env.VITE_SECRET_KEY,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  AUTH_COOKIE_NAME: import.meta.env.VITE_AUTH_COOKIE_NAME,
  BASENAME: import.meta.env.VITE_BASENAME,
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_SCORE_COLLECTION: import.meta.env.VITE_FIREBASE_SCORE_COLLECTION,
  FIREBASE_FIRESTORE_SECRET_KEY: import.meta.env.VITE_FIREBASE_FIRESTORE_SECRET_KEY,
});
