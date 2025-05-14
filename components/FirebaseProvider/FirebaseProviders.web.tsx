import { getApp, getApps, initializeApp } from "@firebase/app";
import { initializeAuth } from "@firebase/auth";
import { PropsWithChildren } from "react";
import { AuthProvider, FirebaseAppProvider } from "reactfire";
import { getMmkvPersistence } from "./auth-mmkv-persistence";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const fireBaseAuth = initializeAuth(firebaseApp, {
  persistence: getMmkvPersistence(), // required: persist auth token in mmkv
});

const FirebaseProviders = ({ children }: PropsWithChildren) => (
  <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <AuthProvider sdk={fireBaseAuth}>{children}</AuthProvider>
  </FirebaseAppProvider>
);

export default FirebaseProviders;
