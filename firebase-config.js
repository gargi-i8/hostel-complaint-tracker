// Firebase Browser CDN Configuration
// Uses modular Firebase scripts from Google's static CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

// Web app Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDZpnxnP-_-blPK2xtcxjLIfmbzMlQA478",
  authDomain: "hostel-complaint-tracker-a1288.firebaseapp.com",
  projectId: "hostel-complaint-tracker-a1288",
  storageBucket: "hostel-complaint-tracker-a1288.firebasestorage.app",
  messagingSenderId: "820256908153",
  appId: "1:820256908153:web:0b9370bcce07defb8c05a8",
  measurementId: "G-1GCWE3VR9R"
};

// Initialize Firebase services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
