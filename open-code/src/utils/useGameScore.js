import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000];
const MAX_LEVEL = 5;

export const POINTS = {
    move: 2,
    upload: 50,
};

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [levelUpInfo, setLevelUpInfo] = useState(null);
    const [scoreAnim, setScoreAnim] = useState(false);

    // Refs pour éviter les closures périmées
    const levelRef = useRef(1);
    const timerRef = useRef(null);
    const lastMoveRef = useRef(null);
    const animTimerRef = useRef(null);

    // Synchronise le ref avec l'état
    useEffect(() => { levelRef.current = level; }, [level]);

    const addScore = useCallback((points) => {
        if (!points || points <= 0) return;

        setScore(s => s + points);

        // Animation score
        setScoreAnim(true);
        if (animTimerRef.current) clearTimeout(animTimerRef.current);
        animTimerRef.current = setTimeout(() => setScoreAnim(false), 400);

        // XP + level up — utilise levelRef.current pour avoir la valeur à jour
        setXp(prevXp => {
            let newXp = prevXp + points;
            let newLevel = levelRef.current;

            while (newLevel < MAX_LEVEL) {
                const needed = XP_PER_LEVEL[newLevel] || 100;
                if (newXp >= needed) { newXp -= needed; newLevel += 1; }
                else break;
            }

            if (newLevel > levelRef.current) {
                levelRef.current = newLevel;
                setLevel(newLevel);
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setLevelUpInfo({ newLevel }), 300);
            }

            return newXp;
        });
    }, []); // ✅ pas de dépendance à `level` — on utilise levelRef

    // Points seulement si le robot bouge (moveForward/Backward/turnLeft/Right)
    const addMoveScore = useCallback((cmd) => {
        const moveCmds = ['moveForward', 'moveBackward', 'turnLeft', 'turnRight'];
        if (!moveCmds.includes(cmd)) return;

        const now = Date.now();
        // Anti-spam : 800ms entre deux gains pour la même commande continue
        if (lastMoveRef.current?.cmd === cmd && now - lastMoveRef.current.t < 800) return;
        lastMoveRef.current = { cmd, t: now };

        addScore(POINTS.move);
    }, [addScore]);

    const dismissLevelUp = useCallback(() => setLevelUpInfo(null), []);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (animTimerRef.current) clearTimeout(animTimerRef.current);
    }, []);

    const xpNeeded = XP_PER_LEVEL[Math.min(level, MAX_LEVEL - 1)] || 100;

    return (
        <GameContext.Provider value={{
            score, level, xp, xpNeeded,
            levelUpInfo, scoreAnim,
            addScore, addMoveScore, dismissLevelUp,
            POINTS,
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameScore() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGameScore doit etre utilise dans un GameProvider');
    return ctx;
}