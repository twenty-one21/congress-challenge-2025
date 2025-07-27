// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js';
import { collection, doc, getFirestore, addDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export {app, db, analytics};