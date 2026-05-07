// ═══════════════════════════════════════════
// src/services/firebase.js — VERSION FINALE v2
// ═══════════════════════════════════════════
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithRedirect,
    getRedirectResult,
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

// ── Initialisation UNIQUE ──
const app = initializeApp(firebaseConfig);

// ── Services ──
export const auth = getAuth(app);
export const db = getFirestore(app);

// ── Providers ──
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });
facebookProvider.setCustomParameters({ display: "popup", auth_type: "rerequest" });

// ── Auth state listener ──
export { onAuthStateChanged };

// ── Redirect result ──
export const getAuthRedirectResult = () => getRedirectResult(auth);

// ── Email / Password ──
export const emailSignUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
export const emailSignIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

// ── Google ──
export const googleSignIn = () => signInWithRedirect(auth, googleProvider);
export const googleSigIn = () => signInWithRedirect(auth, googleProvider); // alias

// ── Facebook ──
export const facebookSignIn = () => signInWithRedirect(auth, facebookProvider);

// ── Déconnexion ──
export const logOut = () => signOut(auth);
export const googleSignOut = () => signOut(auth); // alias