import {
  FirebaseStorage,
  ListOptions,
  StorageReference,
  getStorage as webGetStorage,
  list as webList,
  ListResult as webListResult,
  ref as webRef,
} from "@firebase/storage";
import {
  FirebaseStorageTypes,
  getStorage as nativeGetStorage,
  list as nativeList,
  ref as nativeRef,
} from "@react-native-firebase/storage";
import { Platform } from "react-native";

export function isWebListResult(list: any): list is webListResult {
  return typeof list === "object";
}
export function isNativeListResult(
  list: any
): list is FirebaseStorageTypes.ListResult {
  return typeof list === "object";
}
function isWebStorage(storage: any): storage is FirebaseStorage {
  return typeof storage === "object";
}
export function isWebRef(ref: any): ref is StorageReference {
  return typeof ref === "object" && !ref.putFile;
}
function isNativeRef(ref: any): ref is FirebaseStorageTypes.Reference {
  return typeof ref === "object";
}
function isWebOptions(options: any): options is ListOptions {
  return typeof options === "object";
}
function isNativeOptions(
  options: any
): options is FirebaseStorageTypes.ListOptions {
  return typeof options === "object";
}
// methods
// ---------------------------------------------------------------------------------
export const getStorage = (): FirebaseStorage | FirebaseStorageTypes.Module =>
  Platform.OS === "web" ? webGetStorage() : nativeGetStorage();

export const ref = (
  storage: FirebaseStorageTypes.Module | FirebaseStorage,
  url: string
): StorageReference | FirebaseStorageTypes.Reference =>
  Platform.OS === "web" && isWebStorage(storage)
    ? webRef(storage, url)
    : nativeRef(storage as FirebaseStorageTypes.Module, url);

export const list = (
  ref: StorageReference | FirebaseStorageTypes.Reference,
  options: ListOptions | FirebaseStorageTypes.ListOptions
): Promise<webListResult | FirebaseStorageTypes.ListResult> =>
  Platform.OS === "web" && isWebRef(ref) && isWebOptions(options)
    ? webList(ref, options)
    : isNativeRef(ref) && isNativeOptions(options)
    ? (nativeList(ref, options) as Promise<FirebaseStorageTypes.ListResult>)
    : new Promise(() => {
        items: [];
      });
