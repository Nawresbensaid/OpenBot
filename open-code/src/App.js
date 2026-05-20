import './App.css';
import StoreProvider from './context/context';
import { createContext, useEffect, useState } from "react";
import { auth, googleSignOut, onAuthStateChanged } from "./services/firebase";
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
    const [internetOn, setInternetOn] = useState(true);
    const [user, setUser] = useState(null);
    const [isSessionExpireModal, setIsSessionExpireModal] = useState(false);
    const [isSessionExpire, setIsSessionExpire] = useState(false);
    const [isTimeoutId, setTimeoutId] = useState(false);
    const theme = 'dark';
    const toggleTheme = () => { };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                console.log("✅ Connecté :", firebaseUser.email);
                setUser(firebaseUser);
                localStorage.setItem("isSigIn", "true");
            } else {
                console.log("❌ Non connecté");
                setUser(null);
                localStorage.setItem("isSigIn", "false");
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const goOnline = () => setInternetOn(true);
        const goOffline = () => setInternetOn(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        // ── Amber Doux background ──
        document.body.style.backgroundColor = '#0e0905';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
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
                {/* ── Fond étoilé Amber Doux ── */}
                <div style={{
                    position: 'fixed', inset: 0,
                    background: `
                        radial-gradient(ellipse at 50% 105%, rgba(196,120,64,.55) 0%, transparent 48%),
                        radial-gradient(ellipse at 20% 50%,  rgba(42,22,8,.9)     0%, transparent 60%),
                        radial-gradient(ellipse at 80% 10%,  rgba(30,16,5,.8)     0%, transparent 50%),
                        linear-gradient(180deg, #080401 0%, #0e0905 50%, #1a0e05 100%)
                    `,
                    zIndex: -2,
                }}>
                    {/* ── Halo amber bas ── */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-8%', left: '15%',
                        width: '70%', height: '35%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(196,120,64,.22) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                    }} />

                    {/* ── Halo or gauche ── */}
                    <div style={{
                        position: 'absolute',
                        top: '20%', left: '-5%',
                        width: '40%', height: '40%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(212,168,92,.08) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }} />

                    {/* ── Halo violet discret droite ── */}
                    <div style={{
                        position: 'absolute',
                        top: '-5%', right: '-5%',
                        width: '45%', height: '45%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(60,30,100,.15) 0%, transparent 70%)',
                        filter: 'blur(90px)',
                        pointerEvents: 'none',
                    }} />

                    {/* ── Étoiles SVG ── */}
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <defs>
                            <style>{`
                                @keyframes twinkle {
                                    0%, 100% { opacity: var(--op); }
                                    50%       { opacity: calc(var(--op) * 0.25); }
                                }
                                @keyframes twinkleBig {
                                    0%, 100% { opacity: var(--op); transform: scale(1); }
                                    50%       { opacity: calc(var(--op) * 0.4); transform: scale(1.3); }
                                }
                            `}</style>
                        </defs>

                        {/* Petites étoiles — crème chaud */}
                        {STARS.map(s => (
                            <circle
                                key={s.id}
                                cx={`${s.x}%`} cy={`${s.y}%`}
                                r={s.size}
                                fill="#f5e6d0"
                                style={{
                                    '--op': s.opacity * 0.75,
                                    opacity: s.opacity * 0.75,
                                    animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
                                }}
                            />
                        ))}

                        {/* Grandes étoiles — or amber avec halo */}
                        {STARS_BIG.map(s => (
                            <g key={`big-${s.id}`}>
                                {/* halo doux */}
                                <circle
                                    cx={`${s.x}%`} cy={`${s.y}%`}
                                    r={s.size + 3}
                                    fill="#d4a85c"
                                    style={{
                                        '--op': s.opacity * 0.12,
                                        opacity: s.opacity * 0.12,
                                        animation: `twinkleBig ${s.duration + 1}s ${s.delay}s ease-in-out infinite`,
                                    }}
                                />
                                {/* étoile principale */}
                                <circle
                                    cx={`${s.x}%`} cy={`${s.y}%`}
                                    r={s.size + 0.8}
                                    fill="#d4a85c"
                                    style={{
                                        '--op': s.opacity * 0.55,
                                        opacity: s.opacity * 0.55,
                                        animation: `twinkleBig ${s.duration + 1}s ${s.delay}s ease-in-out infinite`,
                                    }}
                                />
                            </g>
                        ))}

                        {/* Quelques étoiles orange accent */}
                        {STARS.filter((_, i) => i % 15 === 0).map(s => (
                            <circle
                                key={`accent-${s.id}`}
                                cx={`${(s.x + 5) % 100}%`} cy={`${(s.y + 8) % 100}%`}
                                r={s.size * 0.7}
                                fill="#e8955a"
                                style={{
                                    '--op': s.opacity * 0.45,
                                    opacity: s.opacity * 0.45,
                                    animation: `twinkle ${s.duration * 1.3}s ${s.delay * 0.8}s ease-in-out infinite`,
                                }}
                            />
                        ))}
                    </svg>

                    {/* ── Texture sable subtile ── */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`,
                        backgroundSize: '260px 260px',
                        opacity: 0.04,
                        pointerEvents: 'none',
                    }} />
                </div>

                {/* ── Contenu principal ── */}
                <div id="dark" style={{ position: 'relative', zIndex: 1, height: '100vh' }}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <RouterComponent />
                    </BrowserRouter>
                </div>

                <ToastContainer autoClose={5000} theme="dark" style={{ zIndex: 9999 }} />
            </StoreProvider>
        </ThemeContext.Provider>
    );
}

export default App;