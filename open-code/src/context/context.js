import React, { useState, createContext } from 'react';

const StoreContext = createContext();

function StoreProvider({ children }) {

    // ── États OpenBot (originaux) ──────────────────────────
    const [category, setCategory] = useState('js');
    const [drawer, setDrawer] = useState(false);
    const [isError, setIsError] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [fileId, setFileId] = useState(null);
    const [currentProjectXml, setCurrentProjectXml] = useState('');
    const [code, setCode] = useState('');
    const [xmlText, setXmlText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // ── État Blockly (manquant) ────────────────────────────
    const [workspace, setWorkspace] = useState(null);

    // ── États NomadVerse ──────────────────────────────────
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

    return (
        <StoreContext.Provider value={{
            category, setCategory,
            drawer, setDrawer,
            isError, setIsError,
            projectName, setProjectName,
            fileId, setFileId,
            currentProjectXml, setCurrentProjectXml,
            code, setCode,
            xmlText, setXmlText,
            isLoading, setIsLoading,
            isRunning, setIsRunning,
            errorMsg, setErrorMsg,
            workspace, setWorkspace,
            currentLevel, setCurrentLevel,
            completedLevels, setCompletedLevels,
            score, setScore,
            stars, setStars,
            completeLevel,
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export { StoreContext, StoreProvider };
export default StoreProvider;