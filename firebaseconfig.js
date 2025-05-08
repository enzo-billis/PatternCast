// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy4T5S2wWGrwHaSU6JWLeerPZw4awcVz4",
  authDomain: "patterncast-76448.firebaseapp.com",
  projectId: "patterncast-76448",
  storageBucket: "patterncast-76448.firebasestorage.app",
  messagingSenderId: "215565005262",
  appId: "1:215565005262:web:0cf661c554cbf08a263b9f",
  measurementId: "G-K50YZR3DLC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
