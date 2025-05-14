import { getApp, getApps, initializeApp } from "@firebase/app";
import { initializeAuth } from "@firebase/auth";
import Constants from "expo-constants";
import { PropsWithChildren } from "react";
import { AuthProvider, FirebaseAppProvider } from "reactfire";
import { getMmkvPersistence } from "./auth-mmkv-persistence";

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: firebaseApiKey,
  appId: firebaseAppId,
  authDomain: firebaseAuthDomain,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  projectId: firebaseProjectId,
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
