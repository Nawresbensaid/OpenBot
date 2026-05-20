import React, { createContext, useState } from 'react';
import { getCurrentProject } from "../services/workspace";
import { Constants, localStorageKeys } from "../utils/constants";

export const StoreContext = createContext(null);

export default function StoreProvider({
    children,
    isOnline,
    user,
    setUser,
    isSessionExpireModal,
    setIsSessionExpireModal,
    setIsSessionExpire,
    isTimeoutId,
    setTimeoutId,
}) {
    let savedProjectName = null;
    let savedProjectXml = null;
    let savedFileId = null;
    let savedFolderId = null;

    if (localStorage.getItem(localStorageKeys.currentProject)) {
        savedProjectName = getCurrentProject().projectName;
        savedProjectXml = getCurrentProject().xmlValue;
        savedFileId = getCurrentProject()?.fileId;
        savedFolderId = getCurrentProject().folderId;
    }

    const [projectName, setProjectName] = useState(savedProjectName ?? undefined);
    const [drawer, setDrawer] = useState(false);
    const [logOut, setLogOut] = useState(false);
    const [code, setCode] = useState({});
    const [generate, setGenerateCode] = useState(false);
    const [currentProjectXml, setCurrentProjectXml] = useState(savedProjectXml);
    const [fileId, setFileId] = useState(savedFileId);
    const [folderId, setFolderId] = useState(savedFolderId);
    const [category, setCategory] = useState(Constants.qr);
    const [workspace, setWorkspace] = useState(undefined);
    const [isError, setIsError] = useState(false);
    const [isSignIn, setIsSignIn] = useState(false);
    const [isDob, setIsDob] = useState(undefined);
    const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

    // ✅ Lien Drive téléchargement direct — utilisé par le QR code
    // Format : https://drive.google.com/uc?export=download&id=FILE_ID
    const [driveLink, setDriveLink] = useState(null);

    // NomadVerse
    const [currentLevel, setCurrentLevel] = useState(1);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [score, setScore] = useState(0);
    const [stars, setStars] = useState(0);

    const completeLevel = (levelId, starsEarned) => {
        if (!completedLevels.includes(levelId)) {
            setCompletedLevels(prev => [...prev, levelId]);
            setScore(prev => prev + (starsEarned ?? 0) * 100);
            setStars(prev => prev + (starsEarned ?? 0));
            setCurrentLevel(levelId + 1);
        }
    };

    const store = {
        projectName, setProjectName,
        drawer, setDrawer,
        logOut, setLogOut,
        category, setCategory,
        code, setCode,
        generate, setGenerateCode,
        generateCode: generate,
        currentProjectXml, setCurrentProjectXml,
        fileId, setFileId,
        folderId, setFolderId,
        user, setUser,
        workspace, setWorkspace,
        isError, setIsError,
        isOnline,
        isSignIn, setIsSignIn,
        isDob, setIsDob,
        isAutoSyncEnabled, setIsAutoSyncEnabled,
        isSessionExpireModal, setIsSessionExpireModal,
        setIsSessionExpire,
        isTimeoutId, setTimeoutId,
        currentLevel, setCurrentLevel,
        completedLevels, setCompletedLevels,
        score, setScore,
        stars, setStars,
        completeLevel,
        // ✅ driveLink exposé dans le context
        driveLink, setDriveLink,
    };

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
}