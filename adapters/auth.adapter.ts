import {
  NextOrObserver,
  Unsubscribe,
  User,
  Auth as WebAuth,
  UserCredential as WebUserCredential,
  getAuth as getWebAuth,
  createUserWithEmailAndPassword as webCreateUserWithEmailAndPassword,
  onAuthStateChanged as webOnAuthStateChanged,
  signInWithEmailAndPassword as webSignInWithEmailAndPassword,
} from "@firebase/auth";
import {
  CallbackOrObserver,
  FirebaseAuthTypes,
  getAuth as getNativeAuth,
  createUserWithEmailAndPassword as nativeCreateUserWithEmailAndPassword,
  onAuthStateChanged as nativeOnAuthStateChanged,
  signInWithEmailAndPassword as nativeSignInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { Platform } from "react-native";

// types
// ---------------------------------------------------------------------------------
type AuthInstance = WebAuth | FirebaseAuthTypes.Module;

type UserCredential = WebUserCredential | FirebaseAuthTypes.UserCredential;

function isWebAuth(auth: any): auth is WebAuth {
  return typeof auth === "object";
}
function isWebObserver(next: any): next is NextOrObserver<User> {
  return typeof next === "object";
}

// methods
// ---------------------------------------------------------------------------------
export const getAuth = (): AuthInstance =>
  Platform.OS === "web" ? getWebAuth() : getNativeAuth();

export const createUserWithEmailAndPassword = (
  auth: AuthInstance,
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential | WebUserCredential> =>
  Platform.OS === "web" && isWebAuth(auth)
    ? webCreateUserWithEmailAndPassword(auth, email, password)
    : nativeCreateUserWithEmailAndPassword(
        auth as FirebaseAuthTypes.Module,
        email,
        password
      );

export const signInWithEmailAndPassword = (
  auth: AuthInstance,
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential | WebUserCredential> =>
  Platform.OS === "web" && isWebAuth(auth)
    ? webSignInWithEmailAndPassword(auth, email, password)
    : nativeSignInWithEmailAndPassword(
        auth as FirebaseAuthTypes.Module,
        email,
        password
      );

export const onAuthStateChanged = (
  auth: AuthInstance,
  next:
    | NextOrObserver<User>
    | CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>
): Unsubscribe | void =>
  Platform.OS === "web" && isWebAuth(auth) && isWebObserver(next)
    ? webOnAuthStateChanged(auth, next)
    : nativeOnAuthStateChanged(
        auth as FirebaseAuthTypes.Module,
        next as CallbackOrObserver<FirebaseAuthTypes.AuthListenerCallback>
      );
