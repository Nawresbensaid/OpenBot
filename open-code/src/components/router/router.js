// src/components/router/router.js
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "../../pages/home";
import Playground from "../../pages/playground";
import HomeScreen from "../levels/HomeScreen";
import LevelsScreen from "../levels/LevelsScreen";
import MissionCinematic from "../levels/MissionCinematic";
import { LEVELS } from "../../data/levels";

function HomeScreenWrapper() {
    const navigate = useNavigate();
    return <HomeScreen onStart={() => navigate('/levels')} />;
}

function LevelsScreenWrapper() {
    const navigate = useNavigate();
    return (
        <LevelsScreen
            onSelectLevel={(level) => navigate(`/cinematic?level=${level.id}`)}
            onBack={() => navigate('/')}
            completedLevels={[]}
            activeMission={null}
        />
    );
}

function CinematicWrapper() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const levelId = parseInt(params.get('level')) || 1;
    const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];
    return (
        <MissionCinematic
            level={level}
            onComplete={() => navigate(`/playground?level=${levelId}`)}
        />
    );
}

export const RouterComponent = () => {
    return (
        <Routes>
            <Route path="/" element={<HomeScreenWrapper />} />
            <Route path="/levels" element={<LevelsScreenWrapper />} />
            <Route path="/cinematic" element={<CinematicWrapper />} />
            <Route path="/home" element={<Home />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="*" element={
                <div style={{ color: '#fff', textAlign: 'center', padding: '2rem', fontFamily: "'Cinzel', serif" }}>
                    404 — Page non trouvée
                </div>
            } />
        </Routes>
    );
};