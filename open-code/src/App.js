// src/App.js
import './App.css';
import StoreProvider from './context/context';
import { createContext, useEffect, useState } from "react";
import { googleSignOut } from "./services/firebase";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { RouterComponent } from "./components/router/router";

export const ThemeContext = createContext(null);

const generateStars = (count) => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 4,
}));

const STARS = generateStars(150);
const STARS_BIG = generateStars(30);

function App() {
    const [internetOn, setInternetOn] = useState(window.navigator.onLine);
    const [user, setUser] = useState();
    const [isSessionExpireModal, setIsSessionExpireModal] = useState(false);
    const [isSessionExpire, setIsSessionExpire] = useState(false);
    const [isTimeoutId, setTimeoutId] = useState(false);

    const theme = 'dark';
    const toggleTheme = () => { };

    useEffect(() => {
        window.addEventListener('online', () => setInternetOn(true));
        window.addEventListener('offline', () => setInternetOn(false));
        document.body.style.backgroundColor = '#030714';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
    }, []);

    useEffect(() => {
        if (isSessionExpire) {
            alert('Your session has expired. You have been signed out.');
            googleSignOut().then();
            setIsSessionExpire(false);
        }
    }, [isSessionExpire]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <StoreProvider
                isOnline={internetOn}
                isSessionExpireModal={isSessionExpireModal}
                setIsSessionExpireModal={setIsSessionExpireModal}
                user={user}
                setUser={setUser}
                setIsSessionExpire={setIsSessionExpire}
                isTimeoutId={isTimeoutId}
                setTimeoutId={setTimeoutId}
            >
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'radial-gradient(ellipse at 20% 50%, #0a1628 0%, #030714 40%, #000008 100%)',
                    zIndex: -2,
                }}>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <defs>
                            <style>{`@keyframes twinkle{0%,100%{opacity:var(--op)}50%{opacity:calc(var(--op)*0.3)}}`}</style>
                        </defs>
                        {STARS.map(s => (
                            <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white"
                                style={{ '--op': s.opacity, opacity: s.opacity, animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite` }} />
                        ))}
                        {STARS_BIG.map(s => (
                            <circle key={`big-${s.id}`} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size + 1} fill="#6cbefd"
                                style={{ '--op': s.opacity * 0.6, opacity: s.opacity * 0.6, animation: `twinkle ${s.duration + 1}s ${s.delay}s ease-in-out infinite` }} />
                        ))}
                    </svg>
                </div>

                <div id="dark" style={{ position: 'relative', zIndex: 1, height: '100vh' }}>
                    <BrowserRouter>
                        <RouterComponent />
                    </BrowserRouter>
                </div>

                <ToastContainer autoClose={5000} theme="dark" style={{ zIndex: 9999 }} />
            </StoreProvider>
        </ThemeContext.Provider>
    );
}

export default App;