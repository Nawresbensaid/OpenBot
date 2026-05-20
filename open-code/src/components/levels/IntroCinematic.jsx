// ═══════════════════════════════════════════════════════════════
// src/components/homeComponents/levels/IntroCinematic.jsx
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import introVideo from '../../assets/videos/intro.mp4';

// ── Component phases ─────────────────────────────────────────
// 'loading' → loading screen (while video buffers)
// 'video'   → fullscreen video → navigate('/launch')
// ────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
    'Initializing the Nomadverse...',
    'Loading ancient maps...',
    'Connecting to Sultanate servers...',
    'Verifying identities...',
    'Opening the gates...',
];

export default function IntroCinematic() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const doneRef = useRef(false);

    const [phase, setPhase] = useState('loading'); // 'loading' | 'video'
    const [progress, setProgress] = useState(0);
    const [msgIdx, setMsgIdx] = useState(0);

    // ── 1. Fake progress bar (while video buffers) ───────────
    useEffect(() => {
        if (phase !== 'loading') return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 3 + 1;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setPhase('video'), 400);
                    return 100;
                }
                setMsgIdx(Math.min(
                    Math.floor((next / 100) * LOADING_MESSAGES.length),
                    LOADING_MESSAGES.length - 1
                ));
                return next;
            });
        }, 80);

        return () => clearInterval(interval);
    }, [phase]);

    // ── 2. Play video when phase switches to 'video' ─────────
    useEffect(() => {
        if (phase !== 'video') return;
        const video = videoRef.current;
        if (!video) return;

        video.play().catch(() => {
            // Autoplay blocked → user can click SKIP
        });

        return () => {
            video.pause();
            video.src = '';
        };
    }, [phase]);

    // ── 3. Navigate to /launch ────────────────────────────────
    const handleEnter = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        localStorage.setItem('nomadverse_intro_seen', 'true');
        navigate('/launch');
    }, [navigate]);

    // ── Shared styles ─────────────────────────────────────────
    const rootStyle = {
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#0a0804',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Crimson Pro', serif",
        color: '#e8d5a3',
        overflow: 'hidden',
    };

    // ════════════════════════════════════════════════════════
    // PHASE: loading
    // ════════════════════════════════════════════════════════
    if (phase === 'loading') return (
        <div style={rootStyle}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(12px); }
                    to   { opacity:1; transform:translateY(0); }
                }
            `}</style>

            {/* Golden halo */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.12) 0%, transparent 60%)',
            }} />

            <div style={{ textAlign: 'center', zIndex: 2 }}>
                {/* Logo */}
                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 11,
                    letterSpacing: '0.5em', color: '#d4a017',
                    marginBottom: '0.5rem',
                    animation: 'fadeUp 0.8s 0.3s both',
                }}>
                    Welcome to the
                </div>
                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 42, fontWeight: 700,
                    color: '#e8d5a3', letterSpacing: '0.2em',
                    textShadow: '0 0 40px rgba(212,160,23,0.35)',
                    marginBottom: '3rem',
                    animation: 'fadeUp 0.8s 0.6s both',
                }}>
                    NOMADVERSE
                </div>

                {/* Status */}
                <div style={{
                    fontSize: 11, letterSpacing: '0.4em',
                    color: '#8a7a5a', textTransform: 'uppercase',
                    marginBottom: '1rem', minHeight: '1.2em',
                    animation: 'fadeUp 0.6s 1.2s both',
                    transition: 'opacity 0.3s',
                }}>
                    {LOADING_MESSAGES[msgIdx]}
                </div>

                {/* Bar */}
                <div style={{
                    width: 280, height: 1,
                    background: 'rgba(212,160,23,0.2)',
                    position: 'relative', margin: '0 auto',
                    animation: 'fadeUp 0.6s 1.4s both',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg,#8a6a20,#d4a017,#f0c040)',
                        transition: 'width 0.1s linear',
                        position: 'relative',
                    }}>
                        {/* Glowing tip */}
                        <div style={{
                            position: 'absolute', right: 0, top: -3,
                            width: 7, height: 7,
                            background: '#d4a017', borderRadius: '50%',
                            boxShadow: '0 0 8px #d4a017',
                        }} />
                    </div>
                </div>

                {/* Percentage */}
                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 11,
                    color: '#d4a017', marginTop: '0.75rem',
                    letterSpacing: '0.15em',
                    animation: 'fadeUp 0.6s 1.6s both',
                }}>
                    {Math.floor(progress)}%
                </div>
            </div>
        </div>
    );

    // ════════════════════════════════════════════════════════
    // PHASE: video  →  onEnded / SKIP → /launch directement
    // ════════════════════════════════════════════════════════
    return (
        <div style={{ ...rootStyle, background: '#000' }}>
            <video
                ref={videoRef}
                src={introVideo}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onEnded={handleEnter}
                playsInline
            />
            <button
                onClick={handleEnter}
                style={{
                    position: 'absolute', bottom: '1.5rem', right: '1.5rem',
                    background: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: 'rgba(201,168,76,0.7)',
                    fontSize: '0.65rem', padding: '6px 16px',
                    cursor: 'pointer',
                    fontFamily: "'Cinzel',serif", letterSpacing: 2, zIndex: 10,
                }}
            >
                SKIP ▶▶
            </button>
        </div>
    );
}