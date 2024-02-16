// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCB94zmaq_GZv71FC7xKCchSCiJtK84CBU",
  authDomain: "binan-health-certificate.firebaseapp.com",
  projectId: "binan-health-certificate",
  storageBucket: "binan-health-certificate.appspot.com",
  messagingSenderId: "953782364171",
  appId: "1:953782364171:web:f09f14d4ac3667e7a7ff0e",
  measurementId: "G-TZWKG74K4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

