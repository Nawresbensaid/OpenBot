/**
 * firebase.js — version locale sans Firebase
 * Toutes les fonctions sont désactivées pour fonctionner sans connexion
 */

// Objets fictifs pour éviter les erreurs
export const auth = {
    currentUser: null,
    onAuthStateChanged: (cb) => { cb(null); return () => { }; },
    signInWithPopup: async () => { },
    signInWithRedirect: async () => { },
};

export const provider = {};

export const FirebaseStorage = {};

export const db = {};

// Fonction désactivée
export async function uploadProfilePic(file, fileName) {
    return null;
}

// Connexion désactivée — mode local uniquement
export async function googleSigIn() {
    console.log('[Local Mode] Google Sign-In désactivé');
    localStorage.setItem("isSigIn", "false");
    return null;
}

// Déconnexion désactivée
export async function googleSignOut() {
    localStorage.setItem("isSigIn", "false");
    window.location.reload();
}

// Date de naissance désactivée
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