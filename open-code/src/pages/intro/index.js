import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState(0);
    const [muted, setMuted] = useState(false);
    const [entered, setEntered] = useState(false);
    const [welcomePhase, setWelcomePhase] = useState(0);
    // 0 = hidden, 1 = letterbox in, 2 = text reveal, 3 = text hold, 4 = fade out
    const audioRef = useRef(null);
    const timersRef = useRef([]);

    useEffect(() => {
        const unlockAudio = () => {
            if (!audioRef.current) {
                const audio = new Audio("/ambiance.mp3");
                audio.loop = true;
                audio.volume = 0.4;
                audio.play().catch(() => { });
                audioRef.current = audio;
            }
            document.removeEventListener("click", unlockAudio);
        };

        document.addEventListener("click", unlockAudio);

        timersRef.current = [
            setTimeout(() => setPhase(1), 800),
            setTimeout(() => setPhase(2), 2000),
            setTimeout(() => setPhase(3), 3500),
            setTimeout(() => setPhase(4), 5000),
            setTimeout(() => setPhase(5), 6500),
        ];

        return () => {
            timersRef.current.forEach(clearTimeout);
            document.removeEventListener("click", unlockAudio);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleEnter = () => {
        setEntered(true);

        // Fade out audio progressively
        if (audioRef.current) {
            const fadeOut = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.05) {
                    audioRef.current.volume -= 0.05;
                } else {
                    clearInterval(fadeOut);
                    if (audioRef.current) audioRef.current.pause();
                }
            }, 80);
        }

        // Séquence cinématique :
        // t=300ms  → letterbox apparaît (phase 1)
        // t=900ms  → texte se révèle (phase 2)
        // t=3200ms → début fade out (phase 3)
        // t=4000ms → navigate vers /signup
        setTimeout(() => setWelcomePhase(1), 300);
        setTimeout(() => setWelcomePhase(2), 900);
        setTimeout(() => setWelcomePhase(3), 3200);
        setTimeout(() => navigate("/signup"), 4000);
    };

    const handleSignIn = () => {
        setEntered(true);

        if (audioRef.current) {
            const fadeOut = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.05) {
                    audioRef.current.volume -= 0.05;
                } else {
                    clearInterval(fadeOut);
                    if (audioRef.current) audioRef.current.pause();
                }
            }, 80);
        }

        setTimeout(() => setWelcomePhase(1), 300);
        setTimeout(() => setWelcomePhase(2), 900);
        setTimeout(() => setWelcomePhase(3), 3200);
        setTimeout(() => navigate("/signin"), 4000);
    };

    const toggleMute = () => {
        setMuted(m => {
            const newMuted = !m;
            if (audioRef.current) audioRef.current.muted = newMuted;
            return newMuted;
        });
    };

    return (
        <div style={styles.page}>

            {/* ── Vidéo plein écran ── */}
            <div style={{
                ...styles.videoContainer,
                opacity: phase >= 1 ? 1 : 0,
                transition: "opacity 2.5s ease",
            }}>
                <video autoPlay loop muted playsInline style={styles.video}>
                    <source src="/video.mp4" type="video/mp4" />
                </video>
                <div style={styles.videoOverlay} />
                <div style={styles.vignette} />
            </div>

            {/* ── Arabesque ── */}
            <div style={styles.arabesqueOverlay} />

            {/* ── Nébuleuses ── */}
            <div style={{
                ...styles.nebulaGold,
                opacity: phase >= 1 ? 1 : 0,
                transition: "opacity 2s ease",
            }} />
            <div style={{
                ...styles.nebulaBlue,
                opacity: phase >= 1 ? 1 : 0,
                transition: "opacity 2s ease",
            }} />

            {/* ── Particules ── */}
            {[...Array(15)].map((_, i) => (
                <div key={i} style={{
                    ...styles.particle,
                    left: `${5 + i * 6.5}%`,
                    top: `${20 + (i % 5) * 15}%`,
                    width: `${i % 3 === 0 ? 5 : 3}px`,
                    height: `${i % 3 === 0 ? 5 : 3}px`,
                    animationDelay: `${i * 0.35}s`,
                    animationDuration: `${4 + i * 0.25}s`,
                    opacity: welcomePhase > 0 ? 0 : phase >= 2 ? 0.7 : 0,
                    transition: `opacity 0.3s ease`,
                }} />
            ))}

            {/* ── SVG étoiles ── */}
            <svg style={{
                ...styles.svgBg,
                opacity: phase >= 1 ? 1 : 0,
                transition: "opacity 3s ease",
            }} viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
                {[[120, 80], [300, 200], [900, 60], [1100, 150], [1350, 300],
                [200, 700], [1300, 700], [650, 30], [450, 800], [1050, 820]].map(([x, y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r="1.5" fill="rgba(201,168,76,0.8)" />
                        <circle cx={x} cy={y} r="5" fill="none"
                            stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
                    </g>
                ))}
                {[[500, 120], [800, 200], [1200, 80], [350, 350],
                [1050, 400], [180, 500], [1380, 150], [750, 750]].map(([x, y], i) => (
                    <circle key={`w${i}`} cx={x} cy={y} r="1"
                        fill="rgba(255,255,255,0.4)" />
                ))}
                {[[150, 600], [1300, 200], [700, 850]].map(([x, y], i) => (
                    <g key={`c${i}`} stroke="rgba(201,168,76,0.2)" strokeWidth="0.8">
                        <line x1={x - 6} y1={y} x2={x + 6} y2={y} />
                        <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
                    </g>
                ))}
            </svg>

            {/* ── Dunes ── */}
            <svg style={{
                ...styles.dune,
                opacity: welcomePhase > 0 ? 0 : phase >= 1 ? 1 : 0,
                transition: "opacity 0.3s ease",
            }} viewBox="0 0 1440 300"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none">
                <path
                    d="M0,220 C180,140 360,260 540,190 C720,120 900,240 1080,170 C1200,130 1340,200 1440,160 L1440,300 L0,300 Z"
                    fill="rgba(201,168,76,0.06)" />
                <path
                    d="M0,220 C180,140 360,260 540,190 C720,120 900,240 1080,170 C1200,130 1340,200 1440,160"
                    stroke="rgba(201,168,76,0.12)" strokeWidth="1" fill="none" />
                <path
                    d="M0,260 C300,200 500,280 750,240 C950,210 1150,265 1440,230 L1440,300 L0,300 Z"
                    fill="rgba(180,130,40,0.07)" />
                <path
                    d="M0,260 C300,200 500,280 750,240 C950,210 1150,265 1440,230"
                    stroke="rgba(201,168,76,0.08)" strokeWidth="1" fill="none" />
            </svg>

            {/* ── Contenu cinématique ── */}
            <div style={{
                ...styles.center,
                opacity: welcomePhase > 0 ? 0 : 1,
                transition: "opacity 0.3s ease",
                pointerEvents: welcomePhase > 0 ? "none" : "auto",
            }}>

                <div style={{
                    ...styles.topLine,
                    opacity: phase >= 2 ? 1 : 0,
                    transform: phase >= 2 ? "scaleX(1)" : "scaleX(0)",
                    transition: "all 1.5s ease",
                }} />

                <p style={{
                    ...styles.line1,
                    opacity: phase >= 2 ? 1 : 0,
                    transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
                    transition: "all 1s ease",
                }}>
                    IN A WORLD WHERE CODE MEETS HISTORY
                </p>

                <h1 style={{
                    ...styles.mainTitle,
                    opacity: phase >= 3 ? 1 : 0,
                    transform: phase >= 3
                        ? "translateY(0) scale(1)"
                        : "translateY(50px) scale(0.9)",
                    transition: "all 1.5s ease",
                }}>
                    <span style={styles.titleN}>N</span>OMAD
                    <span style={styles.titleVerse}>VERSE</span>
                </h1>

                <p style={{
                    ...styles.subtitle,
                    opacity: phase >= 4 ? 1 : 0,
                    transform: phase >= 4 ? "translateY(0)" : "translateY(20px)",
                    transition: "all 1s ease",
                }}>
                    "Dive into this magnificent Arabesque world"
                </p>

                <div style={{
                    ...styles.bottomLine,
                    opacity: phase >= 4 ? 1 : 0,
                    transform: phase >= 4 ? "scaleX(1)" : "scaleX(0)",
                    transition: "all 1.5s ease 0.3s",
                }} />

                {/* ── Bouton ENTER ── */}
                <div style={{
                    ...styles.btnWrapper,
                    opacity: phase >= 5 ? 1 : 0,
                    transform: phase >= 5 ? "translateY(0)" : "translateY(30px)",
                    transition: "all 1s ease",
                }}>
                    <button
                        style={{
                            ...styles.enterBtn,
                            transform: entered ? "scale(20)" : "scale(1)",
                            opacity: entered ? 0 : 1,
                            transition: entered
                                ? "transform 1.5s ease, opacity 0.8s ease"
                                : "transform 0.3s, box-shadow 0.3s, letter-spacing 0.3s",
                        }}
                        onClick={handleEnter}
                        onMouseEnter={e => {
                            if (!entered) {
                                e.currentTarget.style.boxShadow =
                                    "0 0 80px rgba(201,168,76,1), 0 0 150px rgba(201,168,76,0.5)";
                                e.currentTarget.style.letterSpacing = "10px";
                            }
                        }}
                        onMouseLeave={e => {
                            if (!entered) {
                                e.currentTarget.style.boxShadow =
                                    "0 0 40px rgba(201,168,76,0.6), 0 0 80px rgba(201,168,76,0.3)";
                                e.currentTarget.style.letterSpacing = "6px";
                            }
                        }}
                    >
                        ⚔ ENTER THE WORLD
                    </button>

                    <p style={styles.hint}>
                        Already a Nomad?{" "}
                        <span
                            style={styles.hintLink}
                            onClick={handleSignIn}
                        >
                            Sign In
                        </span>
                    </p>
                </div>

            </div>

            {/* ── Portail ── */}
            {entered && (
                <div style={styles.portal}>
                    <div style={styles.portalRing1} />
                    <div style={styles.portalRing2} />
                    <div style={styles.portalRing3} />
                    <div style={styles.portalCore} />
                </div>
            )}

            {/* ══════════════════════════════════════════
                ── WELCOME NOMAD — Transition cinématique ──
            ══════════════════════════════════════════ */}
            {welcomePhase > 0 && (
                <div style={{
                    ...styles.welcomeOverlay,
                    opacity: welcomePhase === 3 ? 0 : 1,
                    transition: welcomePhase === 3
                        ? "opacity 0.8s ease"
                        : "opacity 0.6s ease",
                }}>

                    {/* Barres letterbox cinéma */}
                    <div style={{
                        ...styles.letterboxTop,
                        height: welcomePhase >= 1 ? "15%" : "0%",
                        transition: "height 0.8s cubic-bezier(0.76,0,0.24,1)",
                    }} />
                    <div style={{
                        ...styles.letterboxBottom,
                        height: welcomePhase >= 1 ? "15%" : "0%",
                        transition: "height 0.8s cubic-bezier(0.76,0,0.24,1)",
                    }} />



                    {/* Lignes horizontales scintillantes */}
                    {/* supprimées — trop chargées sur la vidéo */}

                    {/* Contenu central */}
                    <div style={styles.welcomeCenter}>

                        {/* Ligne fine au-dessus */}
                        <div style={{
                            ...styles.welcomeLineTop,
                            width: welcomePhase >= 2 ? "300px" : "0px",
                            transition: "width 1.2s ease 0.2s",
                        }} />

                        {/* Sous-titre */}
                        <p style={{
                            ...styles.welcomeEyebrow,
                            opacity: welcomePhase >= 2 ? 1 : 0,
                            transform: welcomePhase >= 2 ? "translateY(0)" : "translateY(10px)",
                            transition: "all 0.9s ease 0.4s",
                        }}>
                            THE DESERT AWAITS
                        </p>

                        {/* WELCOME NOMAD */}
                        <h2 style={{
                            ...styles.welcomeTitle,
                            opacity: welcomePhase >= 2 ? 1 : 0,
                            transform: welcomePhase >= 2
                                ? "translateY(0) scale(1)"
                                : "translateY(30px) scale(0.95)",
                            transition: "all 1.1s ease 0.6s",
                        }}>
                            WELCOME{" "}
                            <span style={styles.welcomeGold}>NOMAD</span>
                        </h2>

                        {/* Séparateur diamant */}
                        <div style={{
                            ...styles.welcomeDivider,
                            opacity: welcomePhase >= 2 ? 1 : 0,
                            transition: "opacity 0.8s ease 1s",
                        }}>
                            <div style={styles.dividerLine} />
                            <div style={styles.dividerDiamond} />
                            <div style={styles.dividerLine} />
                        </div>

                        {/* Citation */}
                        <p style={{
                            ...styles.welcomeQuote,
                            opacity: welcomePhase >= 2 ? 1 : 0,
                            transform: welcomePhase >= 2 ? "translateY(0)" : "translateY(15px)",
                            transition: "all 0.9s ease 1.1s",
                        }}>
                            "Your journey begins now"
                        </p>

                        {/* Ligne fine en-dessous */}
                        <div style={{
                            ...styles.welcomeLineTop,
                            width: welcomePhase >= 2 ? "300px" : "0px",
                            transition: "width 1.2s ease 1.3s",
                            marginTop: "28px",
                        }} />

                    </div>




                    {/* Ornements coins */}
                    {["tl", "tr", "bl", "br"].map(pos => (
                        <div key={pos} style={{
                            ...styles.welcomeCorner,
                            top: pos.startsWith("t") ? "18%" : "auto",
                            bottom: pos.startsWith("b") ? "18%" : "auto",
                            left: pos.endsWith("l") ? "40px" : "auto",
                            right: pos.endsWith("r") ? "40px" : "auto",
                            borderTopWidth: pos.startsWith("t") ? "1px" : "0",
                            borderBottomWidth: pos.startsWith("b") ? "1px" : "0",
                            borderLeftWidth: pos.endsWith("l") ? "1px" : "0",
                            borderRightWidth: pos.endsWith("r") ? "1px" : "0",
                            opacity: welcomePhase >= 1 ? 1 : 0,
                            transition: "opacity 0.8s ease 0.3s",
                        }} />
                    ))}

                </div>
            )}
            {/* ══════════════════════════════════════════ */}

            {/* ── HUD coins ── */}
            <div style={{
                ...styles.hudTL,
                opacity: welcomePhase > 0 ? 0 : phase >= 1 ? 1 : 0,
                transition: "opacity 0.3s ease",
            }} />
            <div style={{
                ...styles.hudTR,
                opacity: welcomePhase > 0 ? 0 : phase >= 1 ? 1 : 0,
                transition: "opacity 0.3s ease",
            }} />
            <div style={{
                ...styles.hudBL,
                opacity: welcomePhase > 0 ? 0 : phase >= 1 ? 1 : 0,
                transition: "opacity 0.3s ease",
            }} />
            <div style={{
                ...styles.hudBR,
                opacity: welcomePhase > 0 ? 0 : phase >= 1 ? 1 : 0,
                transition: "opacity 0.3s ease",
            }} />

            {/* ── Logo bas gauche ── */}
            <div style={{
                ...styles.bottomLogo,
                opacity: welcomePhase > 0 ? 0 : phase >= 5 ? 1 : 0,
                transition: "opacity 0.3s ease",
            }}>
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                    <polygon points="11,1 21,6 21,16 11,21 1,16 1,6"
                        stroke="#c9a84c" strokeWidth="1.2" fill="none" />
                    <circle cx="11" cy="11" r="2" fill="#c9a84c" />
                </svg>
                <span><span style={{ color: "#c9a84c" }}>N</span>OMADVERSE · 2026</span>
            </div>

            {/* ── Bouton mute ── */}
            <button
                style={{
                    ...styles.muteBtn,
                    opacity: welcomePhase > 0 ? 0 : phase >= 1 ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: welcomePhase > 0 ? "none" : "auto",
                }}
                onClick={toggleMute}
            >
                {muted ? "🔇" : "🔊"}
            </button>

            {/* ── Barre de progression ── */}
            <div style={styles.progressBar}>
                <div style={{
                    ...styles.progressFill,
                    width: `${Math.min((phase / 5) * 100, 100)}%`,
                    opacity: phase > 0 && phase < 5 ? 1 : 0,
                    transition: "width 1.5s ease, opacity 1s ease",
                }} />
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@1,300&display=swap');

                @keyframes floatParticle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-30px) rotate(120deg); }
                    66% { transform: translateY(-15px) rotate(240deg); }
                }
                @keyframes pulseRing {
                    0% { transform: translate(-50%,-50%) scale(0.8); opacity: 1; }
                    100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
                }
                @keyframes portalCore {
                    0%, 100% { box-shadow: 0 0 40px #c9a84c, 0 0 80px #c9a84c; }
                    50% { box-shadow: 0 0 80px #f0d080, 0 0 160px #f0d080; }
                }
                @keyframes shimmerBtn {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes hudPulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @keyframes sandDrift {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(8px); }
                }
                @keyframes welcomeSand {
                    0%   { transform: translate(0, 0);    opacity: 0; }
                    15%  { opacity: 1; }
                    80%  { opacity: 0.6; }
                    100% { transform: translate(var(--tx, 20px), -70px); opacity: 0; }
                }
                @keyframes scanMove {
                    0%   { background-position: 0 0; }
                    100% { background-position: 0 100px; }
                }
            `}</style>

        </div>
    );
}

const styles = {

    page: {
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Cinzel, serif",
    },

    videoContainer: {
        position: "absolute",
        inset: 0,
        zIndex: 0,
    },

    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "brightness(0.45) saturate(1.3)",
    },

    videoOverlay: {
        position: "absolute",
        inset: 0,
        background: `
            linear-gradient(to bottom,
                rgba(0,0,0,0.75) 0%,
                rgba(4,8,15,0.2) 35%,
                rgba(4,8,15,0.2) 65%,
                rgba(0,0,0,0.9) 100%
            )
        `,
    },

    vignette: {
        position: "absolute",
        inset: 0,
        background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)",
    },

    arabesqueOverlay: {
        position: "absolute",
        inset: 0,
        backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`,
        backgroundSize: "280px 280px",
        opacity: 0.06,
        pointerEvents: "none",
        zIndex: 1,
    },

    nebulaGold: {
        position: "absolute",
        top: "5%", left: "-5%",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: 1,
    },

    nebulaBlue: {
        position: "absolute",
        top: "0%", right: "-5%",
        width: "600px", height: "500px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(30,80,180,0.08) 0%, transparent 70%)",
        filter: "blur(70px)",
        pointerEvents: "none",
        zIndex: 1,
    },

    particle: {
        position: "absolute",
        borderRadius: "50%",
        background: "#c9a84c",
        animation: "floatParticle 5s ease-in-out infinite",
        pointerEvents: "none",
        zIndex: 2,
    },

    svgBg: {
        position: "absolute",
        inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 2,
    },

    dune: {
        position: "absolute",
        bottom: 0, left: 0,
        width: "100%", height: "300px",
        pointerEvents: "none",
        zIndex: 2,
        animation: "sandDrift 10s ease-in-out infinite",
    },

    center: {
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "22px",
        textAlign: "center",
        padding: "0 40px",
    },

    topLine: {
        width: "350px",
        height: "1px",
        background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
        transformOrigin: "center",
    },

    line1: {
        fontSize: "clamp(0.65rem, 1vw, 0.85rem)",
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "6px",
        margin: 0,
        fontFamily: "Poppins, sans-serif",
        fontWeight: "300",
    },

    mainTitle: {
        fontSize: "clamp(4.5rem, 11vw, 10rem)",
        fontWeight: "900",
        margin: 0,
        lineHeight: 1,
        textShadow: "0 0 80px rgba(201,168,76,0.3)",
        color: "white",
    },

    titleN: {
        color: "#c9a84c",
        textShadow: "0 0 50px rgba(201,168,76,0.9)",
    },

    titleVerse: {
        background: "linear-gradient(135deg, #f0d080, #c9a84c)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },

    subtitle: {
        fontFamily: "Amiri, serif",
        fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
        color: "rgba(255,255,255,0.55)",
        fontStyle: "italic",
        margin: 0,
        letterSpacing: "1px",
    },

    bottomLine: {
        width: "350px",
        height: "1px",
        background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
        transformOrigin: "center",
    },

    btnWrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        marginTop: "10px",
    },

    enterBtn: {
        padding: "18px 65px",
        background:
            "linear-gradient(135deg, #b8860b, #c9a84c, #f0d080, #c9a84c, #b8860b)",
        backgroundSize: "200% auto",
        border: "1px solid rgba(201,168,76,0.4)",
        borderRadius: "4px",
        color: "#000",
        fontWeight: "900",
        letterSpacing: "6px",
        cursor: "pointer",
        fontSize: "clamp(0.8rem, 1.3vw, 1rem)",
        fontFamily: "Cinzel, serif",
        boxShadow:
            "0 0 40px rgba(201,168,76,0.6), 0 0 80px rgba(201,168,76,0.3)",
        animation: "shimmerBtn 3s linear infinite",
        transformOrigin: "center",
    },

    hint: {
        fontSize: "12px",
        color: "rgba(255,255,255,0.25)",
        margin: 0,
        letterSpacing: "1px",
        fontFamily: "Poppins, sans-serif",
    },

    hintLink: {
        color: "#c9a84c",
        cursor: "pointer",
        fontWeight: "600",
        textDecoration: "underline",
    },

    portal: {
        position: "fixed",
        top: "50%", left: "50%",
        zIndex: 100,
        pointerEvents: "none",
    },

    portalRing1: {
        position: "absolute",
        width: "200px", height: "200px",
        borderRadius: "50%",
        border: "2px solid rgba(201,168,76,0.9)",
        top: "50%", left: "50%",
        animation: "pulseRing 1s ease-out forwards",
    },

    portalRing2: {
        position: "absolute",
        width: "200px", height: "200px",
        borderRadius: "50%",
        border: "2px solid rgba(201,168,76,0.6)",
        top: "50%", left: "50%",
        animation: "pulseRing 1s ease-out 0.25s forwards",
    },

    portalRing3: {
        position: "absolute",
        width: "200px", height: "200px",
        borderRadius: "50%",
        border: "2px solid rgba(201,168,76,0.3)",
        top: "50%", left: "50%",
        animation: "pulseRing 1s ease-out 0.5s forwards",
    },

    portalCore: {
        position: "absolute",
        width: "24px", height: "24px",
        borderRadius: "50%",
        background: "#f0d080",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        animation: "portalCore 0.4s ease-in-out infinite",
    },

    hudTL: {
        position: "fixed", top: "20px", left: "20px",
        width: "32px", height: "32px",
        borderTop: "1.5px solid rgba(201,168,76,0.7)",
        borderLeft: "1.5px solid rgba(201,168,76,0.7)",
        animation: "hudPulse 2s infinite",
        zIndex: 10,
    },
    hudTR: {
        position: "fixed", top: "20px", right: "20px",
        width: "32px", height: "32px",
        borderTop: "1.5px solid rgba(201,168,76,0.7)",
        borderRight: "1.5px solid rgba(201,168,76,0.7)",
        animation: "hudPulse 2s infinite 0.5s",
        zIndex: 10,
    },
    hudBL: {
        position: "fixed", bottom: "20px", left: "20px",
        width: "32px", height: "32px",
        borderBottom: "1.5px solid rgba(201,168,76,0.7)",
        borderLeft: "1.5px solid rgba(201,168,76,0.7)",
        animation: "hudPulse 2s infinite 1s",
        zIndex: 10,
    },
    hudBR: {
        position: "fixed", bottom: "20px", right: "20px",
        width: "32px", height: "32px",
        borderBottom: "1.5px solid rgba(201,168,76,0.7)",
        borderRight: "1.5px solid rgba(201,168,76,0.7)",
        animation: "hudPulse 2s infinite 1.5s",
        zIndex: 10,
    },

    bottomLogo: {
        position: "fixed",
        bottom: "28px", left: "40px",
        display: "flex", alignItems: "center", gap: "8px",
        fontSize: "10px", letterSpacing: "3px",
        color: "rgba(255,255,255,0.25)",
        fontFamily: "Cinzel, serif",
        zIndex: 10,
    },

    muteBtn: {
        position: "fixed",
        bottom: "22px", right: "40px",
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "50%",
        width: "42px", height: "42px",
        fontSize: "16px", cursor: "pointer",
        color: "white", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
    },

    progressBar: {
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "2px",
        background: "rgba(255,255,255,0.05)",
        zIndex: 20,
    },

    progressFill: {
        height: "100%",
        background: "linear-gradient(to right, #c9a84c, #f0d080)",
    },

    // ── Welcome overlay styles ──
    welcomeOverlay: {
        position: "fixed",
        inset: 0,
        background: "transparent",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
    },

    letterboxTop: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        background: "#000",
        zIndex: 1,
    },

    letterboxBottom: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        background: "#000",
        zIndex: 1,
    },

    welcomeCenter: {
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
    },

    welcomeLineTop: {
        height: "1px",
        background: "linear-gradient(to right, transparent, rgba(201,168,76,0.8), transparent)",
        overflow: "hidden",
    },

    welcomeEyebrow: {
        fontFamily: "Cinzel, serif",
        fontSize: "11px",
        letterSpacing: "0.5em",
        color: "rgba(201,168,76,0.85)",
        margin: 0,
        textTransform: "uppercase",
        textShadow: "0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.9)",
    },

    welcomeTitle: {
        fontFamily: "Cinzel, serif",
        fontSize: "clamp(3rem, 7vw, 6rem)",
        fontWeight: "900",
        color: "#fff",
        margin: 0,
        lineHeight: 1.1,
        letterSpacing: "0.06em",
        textShadow: "0 0 60px rgba(0,0,0,0.9), 0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(201,168,76,0.2)",
    },

    welcomeGold: {
        color: "#c9a84c",
        textShadow: "0 0 40px rgba(201,168,76,0.7)",
    },

    welcomeDivider: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        margin: "4px 0",
    },

    dividerLine: {
        width: "80px",
        height: "1px",
        background: "rgba(201,168,76,0.5)",
    },

    dividerDiamond: {
        width: "7px",
        height: "7px",
        background: "#c9a84c",
        transform: "rotate(45deg)",
    },

    welcomeQuote: {
        fontFamily: "Cormorant Garamond, serif",
        fontStyle: "italic",
        fontSize: "clamp(0.95rem, 1.5vw, 1.2rem)",
        color: "rgba(255,255,255,0.6)",
        margin: 0,
        letterSpacing: "0.05em",
        textShadow: "0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.9)",
    },

    welcomeScanLine: {
        position: "absolute",
        inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(201,168,76,0.03) 3px, rgba(201,168,76,0.03) 4px)",
        animation: "scanMove 4s linear infinite",
        pointerEvents: "none",
        zIndex: 1,
    },

    welcomeCorner: {
        position: "absolute",
        width: "28px",
        height: "28px",
        borderColor: "rgba(201,168,76,0.45)",
        borderStyle: "solid",
        zIndex: 3,
    },
};