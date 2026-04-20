import React, { useEffect, useRef, useState, useCallback } from 'react';

const getVideo = (levelId) => {
    try {
        return require(`../../assets/videos/level${levelId}.mp4`);
    } catch {
        return null;
    }
};

export default function MissionCinematic({ level, onComplete }) {
    const [phase, setPhase] = useState('video');
    const [videoEnded, setVideoEnded] = useState(false);
    const [pct, setPct] = useState(0);
    const [tagVisible, setTagVisible] = useState(false);
    const [starsLit, setStarsLit] = useState([false, false, false]);
    const [storyText, setStoryText] = useState('');
    const [typingDone, setTypingDone] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const timerRef = useRef(null);
    const intervalRef = useRef(null);
    const rafRef = useRef(null);
    const loadingLineRef = useRef(0);
    const [loadingLine, setLoadingLine] = useState('DÉROULEMENT DU PARCHEMIN...');

    const LOADING_LINES = [
        'DÉROULEMENT DU PARCHEMIN...',
        'SCEAU DU SULTANAT APPOSÉ...',
        'LECTURE DE LA MISSIVE...',
        'DÉCRYPTAGE DES ARABESQUES...',
        'PARCHEMIN PRÊT',
    ];

    const videoSrc = getVideo(level.id);

    useEffect(() => {
        if (phase === 'video') return;
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const particles = Array.from({ length: 70 }, () => ({
            x: Math.random(), y: Math.random(),
            r: Math.random() * 1.4 + 0.3,
            op: Math.random() * 0.4 + 0.1,
            tw: Math.random() * Math.PI * 2,
            sp: Math.random() * 0.012 + 0.003,
            col: Math.random() > 0.5 ? '#c9a84c' : '#d4b483',
        }));
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize(); window.addEventListener('resize', resize);
        const draw = () => {
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            for (const p of particles) {
                p.tw += p.sp;
                const a = p.op * (0.3 + 0.7 * (Math.sin(p.tw) * 0.5 + 0.5));
                ctx.globalAlpha = a; ctx.fillStyle = p.col;
                ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            rafRef.current = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'video') return;
        if (!videoSrc) {
            timerRef.current = setTimeout(() => setPhase('loading'), 100);
            return;
        }
        const vid = videoRef.current; if (!vid) return;
        vid.play().catch(() => { });
        return () => clearTimeout(timerRef.current);
    }, [phase, videoSrc]);

    const handleVideoEnd = () => {
        setVideoEnded(true);
        timerRef.current = setTimeout(() => setPhase('loading'), 300);
    };

    const skipVideo = () => {
        clearTimeout(timerRef.current);
        if (videoRef.current) videoRef.current.pause();
        setPhase('loading');
    };

    useEffect(() => {
        if (phase !== 'loading') return;
        setPct(0); setTagVisible(false);
        loadingLineRef.current = 0;
        setLoadingLine(LOADING_LINES[0]);
        let p = 0;
        intervalRef.current = setInterval(() => {
            p += 1.4; setPct(Math.min(p, 100));
            const li = Math.floor(p / 22);
            if (li !== loadingLineRef.current && li < LOADING_LINES.length) {
                loadingLineRef.current = li;
                setLoadingLine(LOADING_LINES[li]);
            }
            if (p >= 55) setTagVisible(true);
            if (p >= 100) {
                clearInterval(intervalRef.current);
                timerRef.current = setTimeout(() => setPhase('identity'), 400);
            }
        }, 28);
        return () => { clearInterval(intervalRef.current); clearTimeout(timerRef.current); };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'identity') return;
        setStarsLit([false, false, false]);
        const t1 = setTimeout(() => setStarsLit([true, false, false]), 350);
        const t2 = setTimeout(() => setStarsLit([true, true, false]), 650);
        const t3 = setTimeout(() => setStarsLit([true, true, true]), 950);
        timerRef.current = setTimeout(() => setPhase('briefing'), 2900);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(timerRef.current); };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'briefing') return;
        setStoryText(''); setTypingDone(false);
        const text = level.briefing || '';
        let i = 0;
        intervalRef.current = setInterval(() => {
            i++; setStoryText(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(intervalRef.current);
                setTypingDone(true);
                timerRef.current = setTimeout(() => setPhase('objective'), 1400);
            }
        }, 24);
        return () => { clearInterval(intervalRef.current); clearTimeout(timerRef.current); };
    }, [phase, level]);

    const skipToEnd = useCallback(() => {
        clearInterval(intervalRef.current); clearTimeout(timerRef.current);
        if (videoRef.current) videoRef.current.pause();
        setStoryText(level.briefing || '');
        setTypingDone(true);
        setStarsLit([true, true, true]);
        setPhase('objective');
    }, [level]);

    const starsToShow = Array.from({ length: 3 }, (_, i) => i < level.stars);

    const S = {
        wrap: { position: 'fixed', inset: 0, zIndex: 300, background: '#0a0600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel','Georgia',serif", overflow: 'hidden' },
        canvas: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
        geo: { position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none', zIndex: 1 },
        vignette: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.85)100%)', zIndex: 2, pointerEvents: 'none' },
        content: { position: 'relative', zIndex: 10, width: '100%', maxWidth: 620, padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' },
        tag: { fontSize: 10, letterSpacing: 4, color: '#c9a84c88', textTransform: 'uppercase', border: '1px solid #c9a84c33', padding: '4px 16px' },
        title: { fontFamily: "'Cinzel',serif", fontSize: '1.6rem', color: '#c9a84c', letterSpacing: 3, textShadow: '0 0 40px #c9a84c55' },
        arabic: { fontFamily: "'Amiri','Arial',serif", fontSize: '1.1rem', color: '#d4b483', direction: 'rtl' },
        divider: { width: '100%', height: 1, background: 'linear-gradient(90deg,transparent,#c9a84c55,transparent)' },
        storyText: { fontFamily: "'Amiri','Georgia',serif", fontSize: '0.95rem', color: 'rgba(212,180,131,0.85)', lineHeight: 2, maxWidth: 460, textAlign: 'center', fontStyle: 'italic' },
        objBox: { background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.25)', padding: '1rem 1.4rem', width: '100%', maxWidth: 420, position: 'relative' },
        objLabel: { fontSize: 9, letterSpacing: 3, color: '#c9a84c77', textTransform: 'uppercase', marginBottom: '0.4rem' },
        objVal: { fontFamily: "'Amiri','Georgia',serif", fontSize: '0.9rem', color: 'rgba(212,180,131,0.9)', lineHeight: 1.7 },
        hintBox: { background: 'rgba(139,90,43,0.08)', border: '1px solid rgba(201,168,76,0.15)', padding: '0.6rem 1.1rem', width: '100%', maxWidth: 420, fontFamily: "'Amiri','Georgia',serif", fontSize: '0.82rem', color: 'rgba(212,180,131,0.65)', textAlign: 'center' },
        progressWrap: { width: 220, height: 2, background: 'rgba(201,168,76,0.1)' },
        progressFill: { height: '100%', background: 'linear-gradient(90deg,#8b5a2b,#c9a84c,#8b5a2b)', transition: 'width 0.08s linear' },
        transLine: { fontSize: '0.65rem', letterSpacing: 3, color: '#c9a84c44' },
        btnLaunch: { marginTop: '0.3rem', padding: '0.7rem 2.5rem', background: 'linear-gradient(135deg,rgba(201,168,76,0.12),rgba(139,90,43,0.12))', border: '1px solid rgba(201,168,76,0.45)', color: '#c9a84c', fontFamily: "'Cinzel',serif", fontSize: '0.85rem', cursor: 'pointer', letterSpacing: 3 },
        skipBtn: { position: 'absolute', bottom: '1rem', right: '1.2rem', zIndex: 20, background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(212,180,131,0.3)', fontSize: '0.6rem', padding: '3px 9px', cursor: 'pointer', fontFamily: "'Cinzel',serif", letterSpacing: 2 },
    };

    const StarIcon = ({ lit }) => (
        <span style={{ fontSize: '1.3rem', color: lit ? '#c9a84c' : '#2a1f00', textShadow: lit ? '0 0 12px #c9a84c88' : 'none', transition: 'color 0.4s,text-shadow 0.4s' }}>★</span>
    );

    return (
        <div style={S.wrap}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;600&display=swap');
                @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
                @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                @keyframes spinR{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
            `}</style>

            {phase === 'video' && videoSrc && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video ref={videoRef} src={videoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onEnded={handleVideoEnd} muted={false} playsInline />
                    <button onClick={skipVideo} style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(201,168,76,0.3)', color: 'rgba(201,168,76,0.6)', fontSize: '0.65rem', padding: '5px 14px', cursor: 'pointer', fontFamily: "'Cinzel',serif", letterSpacing: 2, zIndex: 10 }}>
                        PASSER ▶▶
                    </button>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '3rem', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(0.7rem,2vw,1rem)', color: 'rgba(201,168,76,0.7)', letterSpacing: 4, textTransform: 'uppercase' }}>
                            LEVEL {level.id} — {level.name}
                        </div>
                    </div>
                </div>
            )}

            {phase !== 'video' && (
                <>
                    <canvas ref={canvasRef} style={S.canvas} />
                    <svg style={S.geo} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
                        <defs>
                            <pattern id="arabesque-cm" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
                                <circle cx="20" cy="20" r="3" fill="none" stroke="#c9a84c" strokeWidth="0.3" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#arabesque-cm)" />
                    </svg>
                    <div style={S.vignette} />
                    <div style={S.content}>
                        {phase === 'loading' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', animation: 'fadeIn 0.7s ease' }}>
                                <div style={{ color: '#c9a84c66', fontSize: '1.1rem', letterSpacing: 8 }}>✦ ✦ ✦</div>
                                <div style={S.transLine}>{loadingLine}</div>
                                <div style={S.progressWrap}><div style={{ ...S.progressFill, width: `${pct}%` }} /></div>
                                <div style={{ ...S.tag, opacity: tagVisible ? 1 : 0, transition: 'opacity 0.5s' }}>SULTANAT DE NOMADVERSE</div>
                            </div>
                        )}
                        {phase === 'identity' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', animation: 'fadeIn 0.7s ease' }}>
                                <div style={S.tag}>MISSIVE OFFICIELLE — NIVEAU {String(level.id).padStart(2, '0')}</div>
                                <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 90 90" width="90" height="90" style={{ position: 'absolute', animation: 'spin 18s linear infinite' }}>
                                        <circle cx="45" cy="45" r="40" fill="none" stroke="#c9a84c" strokeWidth="0.8" strokeDasharray="4 3" />
                                    </svg>
                                    <span style={{ fontSize: '2.2rem', position: 'absolute', zIndex: 2 }}>{level.emoji}</span>
                                </div>
                                {level.nameAr && <div style={S.arabic}>{level.nameAr}</div>}
                                <div style={S.title}>{level.name.toUpperCase()}</div>
                                <div style={S.divider} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {starsLit.map((lit, i) => <StarIcon key={i} lit={lit} />)}
                                </div>
                                <div style={{ fontSize: '0.65rem', letterSpacing: 4, color: '#c9a84c66' }}>— {level.difficulty.toUpperCase()} —</div>
                            </div>
                        )}
                        {phase === 'briefing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', animation: 'fadeIn 0.7s ease' }}>
                                <div style={S.tag}>PAROLE DU GRAND VIZIR</div>
                                <div style={S.divider} />
                                <div style={S.storyText}>
                                    {storyText}
                                    {!typingDone && <span style={{ color: '#c9a84c', animation: 'blink 0.8s step-end infinite' }}>|</span>}
                                </div>
                                <div style={S.divider} />
                            </div>
                        )}
                        {phase === 'objective' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', animation: 'fadeIn 0.7s ease' }}>
                                <div style={S.tag}>DÉCRET DE MISSION</div>
                                <div style={S.objBox}>
                                    <div style={S.objLabel}>Directive Principale</div>
                                    <div style={S.objVal}>{level.description} — <strong style={{ color: '#c9a84c' }}>{level.hint}</strong></div>
                                </div>
                                <div style={S.hintBox}>✦ Indice : {level.hint}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {starsToShow.map((lit, i) => <StarIcon key={i} lit={lit} />)}
                                </div>
                                <button style={S.btnLaunch} onClick={onComplete}>
                                    ✦ ACCEPTER LA MISSION ✦
                                </button>
                            </div>
                        )}
                    </div>
                    {phase !== 'objective' && (
                        <button style={S.skipBtn} onClick={skipToEnd}>PASSER ▶▶</button>
                    )}
                </>
            )}
        </div>
    );
}