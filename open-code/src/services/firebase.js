import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDSae64hEK-g7x6icJWdFxSyw8Fr_HOPVk",
    authDomain: "nomadverse-1f766.firebaseapp.com",
    projectId: "nomadverse-1f766",
    messagingSenderId: "632057387503",
    appId: "1:632057387503:web:cef5e13c9c9845aeb5be1a",
    measurementId: "G-LVN7FSPJJJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const FirebaseStorage = {};
export const provider = new GoogleAuthProvider();
export const googleProvider = new GoogleAuthProvider();

export const googleSignIn = () => signInWithPopup(auth, googleProvider);
export const emailSignIn = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const emailSignUp = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);

export async function googleSigIn() {
    return signInWithPopup(auth, provider);
}

export async function googleSignOut() {
    await signOut(auth);
    localStorage.setItem("isSigIn", "false");
    window.location.reload();
}

export async function uploadProfilePic(file, fileName) {
    return null;
}

export async function getDateOfBirth() {
    return undefined;
}

export async function setDateOfBirth(DOB) {
    return;
}

const firebase = {
    auth: () => auth,
    initializeApp: () => { },
};

export default firebase;