// ═══════════════════════════════════════════
// src/services/firebase.js — VERSION POPUP
// ═══════════════════════════════════════════
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

// ── Config Firebase ──
const firebaseConfig = {
    apiKey: "AIzaSyDSae64hEK-g7x6icJWdFxSyw8Fr_HOPVk",
    authDomain: "nomadverse-1f766.firebaseapp.com",
    projectId: "nomadverse-1f766",
    storageBucket: "nomadverse-1f766.firebasestorage.app",
    messagingSenderId: "632057387503",
    appId: "1:632057387503:web:cef5e13c9c9845aeb5be1a",
};

// ── Initialisation ──
const app = initializeApp(firebaseConfig);

// ── Services ──
export const auth = getAuth(app);
export const db = getFirestore(app);

// ── Providers ──
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Auth state ──
export { onAuthStateChanged };

// ── Email / Password ──
export const emailSignUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
export const emailSignIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

// ── Google (POPUP) ──
export const googleSignIn = () => signInWithPopup(auth, googleProvider);
export const googleSigIn = () => signInWithPopup(auth, googleProvider); // alias

// ── Déconnexion ──
export const logOut = () => signOut(auth);
export const googleSignOut = () => signOut(auth); // alias