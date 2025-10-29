// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPbHmuI7MjEiyUZnUOGlw3l_OboOl5164",
  authDomain: "cac-mtka.firebaseapp.com",
  projectId: "cac-mtka",
  storageBucket: "cac-mtka.firebasestorage.app",
  messagingSenderId: "518618210046",
  appId: "1:518618210046:web:f200e45ac96fbf37d98faf",
  measurementId: "G-D1EK4J7FCY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

console.log("Firebase initialized successfully");
console.log("Auth instance:", auth);
console.log("Firestore instance:", db);

export { app, db, analytics, auth };