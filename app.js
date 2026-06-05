// app.js - Firebase v10 CDN Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase Config configuration
const firebaseConfig = {
  apiKey: "AIzaSyBen1RjWtmaOE2Ec3LbQvldBvCVaTzYJWk",
  authDomain: "sirmeanacademy-14b84.firebaseapp.com",
  projectId: "sirmeanacademy-14b84",
  storageBucket: "sirmeanacademy-14b84.firebasestorage.app",
  messagingSenderId: "3897951834",
  appId: "1:3897951834:web:154b0d93abdf8ffc32ba63"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get HTML DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const submitBtn = document.getElementById("submit-btn");
const topicInput = document.getElementById("topic-input");

const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");

// 1. Monitor Authentication Status changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        authView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
    } else {
        authView.classList.remove("hidden");
        dashboardView.classList.add("hidden");
    }
});

// 2. Register Account
registerBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if(!email || !password) return alert("Please fill in all fields.");
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account registration successful!");
    } catch (error) {
        alert(error.message);
    }
});

// 3. Log In User
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});

// 4. Log Out User
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

// 5. Send Submissions to Cloud Firestore
submitBtn.addEventListener("click", async () => {
    const textData = topicInput.value.trim();
    if (!textData) return alert("Please enter text before saving.");

    try {
        await addDoc(collection(db, "student_submissions"), {
            studentId: auth.currentUser.uid,
            studentEmail: auth.currentUser.email,
            content: textData,
            createdAt: serverTimestamp()
        });
        alert("Data successfully saved onto Firestore!");
        topicInput.value = "";
    } catch (error) {
        alert("Database write error: " + error.message);
    }
});
