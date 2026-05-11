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

// ✅ Scopes Google Drive nécessaires pour uploadToGoogleDrive()
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");

// ── Auth state ──
export { onAuthStateChanged };

// ── Email / Password ──
export const emailSignUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
export const emailSignIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

// ── Google (POPUP) ──
// ✅ On sauvegarde le accessToken Google dans localStorage
//    pour que uploadToGoogleDrive() puisse l'utiliser via getAccessToken()
export const googleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);

    // Récupère le credential Google → contient le vrai accessToken OAuth2
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (accessToken) {
        // ✅ Clé exacte attendue par src/services/googleDrive.js → getAccessToken()
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("isSigIn", "true");
        console.log("✅ Google accessToken sauvegardé pour Google Drive");
    } else {
        console.warn("⚠️ Pas de accessToken dans le credential Google");
    }

    return result;
};

// Alias (utilisé dans certains composants)
export const googleSigIn = googleSignIn;

// ── Déconnexion ──
export const logOut = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isSigIn");
    return signOut(auth);
};

export const googleSignOut = logOut; // alias