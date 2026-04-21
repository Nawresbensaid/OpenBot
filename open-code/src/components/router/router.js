// src/components/router/router.js
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Intro from "../../pages/intro";
import Home from "../../pages/home";
import Playground from "../../pages/playground";
import SignIn from "../../pages/signin";
import SignUp from "../../pages/signup";
import HomeScreen from "../levels/HomeScreen";
import LevelsScreen from "../levels/LevelsScreen";
import MissionCinematic from "../levels/MissionCinematic";
import { LEVELS } from "../../data/levels";

function NotFound() {
    return (
        <div style={{ color: '#fff', textAlign: 'center', padding: '2rem', fontFamily: "'Cinzel', serif" }}>
            404 — Page non trouvée
        </div>
    );
}

function HomeScreenWrapper() {
    const navigate = useNavigate();
    return <HomeScreen onStart={() => navigate('/levels')} />;
}

function LevelsScreenWrapper() {
    const navigate = useNavigate();
    return (
        <LevelsScreen
            onSelectLevel={(level) => navigate(`/cinematic?level=${level.id}`)}
            onBack={() => navigate('/launch')}
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
            <Route path="/" element={<Outlet />}>
                <Route index element={<Intro />} />
                <Route path="signin" element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="launch" element={<HomeScreenWrapper />} />
                <Route path="home" element={<Home />} />
                <Route path="levels" element={<LevelsScreenWrapper />} />
                <Route path="cinematic" element={<CinematicWrapper />} />
                <Route path="playground" element={<Playground />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};