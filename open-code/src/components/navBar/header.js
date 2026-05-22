import React, { useContext, useState } from 'react';
import { useLocation } from "react-router-dom";
import { StoreContext } from "../../context/context";
import { PathName } from "../../utils/constants";
import { useGameScore } from '../../utils/useGameScore';

const CITATIONS = [
    "Code your robot, explore the world.",
    "Every line of code is a step toward the future.",
    "Robots obey those who dare to program.",
    "Error = learning. Keep coding.",
    "A good algorithm is worth a thousand words.",
    "Think. Code. Test. Repeat.",
    "Your robot is waiting for your instructions.",
    "Perseverance is the best algorithm.",
]

function GameHUD() {
    const { score, level, xp, xpNeeded, scoreAnim } = useGameScore();
    const xpPct = Math.min(100, Math.round((xp / xpNeeded) * 100));
    const G = a => `rgba(232,160,85,${a})`;

    return (
        <div style={{
            display: 'flex', alignItems: 'stretch',
            background: 'rgba(12,6,1,.8)',
            border: `1px solid ${G(.2)}`,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        }}>
            {/* SCORE */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '0 12px',
                borderRight: `1px solid ${G(.12)}`,
                gap: 1,
            }}>
                <span style={{ fontSize: 10, color: G(.4), fontFamily: "'Cinzel',serif", letterSpacing: '.1em' }}>SCORE</span>
                <span style={{
                    fontSize: 20, fontWeight: 400, color: '#e8a055',
                    fontFamily: "'Space Mono',monospace",
                    animation: scoreAnim ? 'hdrBump .35s ease' : 'none',
                }}>
                    {score}
                </span>
            </div>

            {/* LEVEL */}
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '5px 12px', gap: 3, minWidth: 110,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: G(.4), fontFamily: "'Cinzel',serif", letterSpacing: '.1em' }}>LEVEL</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ fontSize: 12, color: i < level ? '#e8a055' : G(.15) }}>★</span>
                        ))}
                    </div>
                    <span style={{ fontSize: 17, color: '#e8a055', fontFamily: "'Space Mono',monospace" }}>{level}</span>
                </div>
                <div style={{ width: '100%', height: 3, background: G(.1), borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#6a3200,#e8a055)', borderRadius: 1, transition: 'width .5s' }} />
                </div>
                <span style={{ fontSize: 9, color: G(.28), fontFamily: "'Space Mono',monospace" }}>{xp} / {xpNeeded} XP</span>
            </div>
        </div>
    );
}

export function Header() {
    const { user } = useContext(StoreContext);
    const location = useLocation();
    const isPlayground = location.pathname === PathName.playGround;

    const [citIdx, setCitIdx] = useState(() => Math.floor(Math.random() * CITATIONS.length));
    const [citKey, setCitKey] = useState(0);
    const nextCit = () => { setCitIdx(i => (i + 1) % CITATIONS.length); setCitKey(k => k + 1); };

    const G = a => `rgba(232,160,85,${a})`;

    const initials = user?.displayName
        ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'N';

    return (
        <div style={{
            height: 58,
            minHeight: 58,
            maxHeight: 58,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
            background: 'rgba(10,5,1,.98)',
            borderBottom: `1px solid ${G(.15)}`,
            position: 'relative',
            zIndex: 20,
            flexShrink: 0,
            margin: 0,
            boxSizing: 'border-box',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Space+Mono:wght@400&family=Nunito:wght@400;600&display=swap');
                @keyframes hdrShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
                @keyframes hdrBlink   { 0%,100%{opacity:1} 50%{opacity:.2} }
                @keyframes hdrCitFade { from{opacity:0;transform:translateY(2px)} to{opacity:1;transform:none} }
                @keyframes hdrBump    { 0%{transform:scale(1)} 40%{transform:scale(1.3)} 100%{transform:scale(1)} }
                html, body, #root {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden;
                    height: 100%;
                    width: 100%;
                    box-sizing: border-box;
                }
                * { box-sizing: border-box; }
            `}</style>

            {/* Ligne dorée bas */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${G(.4)} 30%,${G(.6)} 50%,${G(.4)} 70%,transparent)`, pointerEvents: 'none' }} />

            {/* ── LOGO ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: 'linear-gradient(135deg,#1c0a00,#3d1a00)',
                    border: `1px solid ${G(.25)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17,
                }}>🤖</div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span style={{
                        fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 800,
                        background: `linear-gradient(90deg,#b09060,#e8a055,#f0ddb8,#e8a055,#b09060)`,
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'hdrShimmer 5s linear infinite',
                    }}>NomadVerse</span>
                    <span style={{
                        fontSize: 15, color: G(.28), letterSpacing: '.05em',
                        fontFamily: "'Nunito',sans-serif", marginTop: 2,
                    }}>YOUR CODE · YOUR ROBOT · YOUR WORLD</span>
                </div>
            </div>

            {/* Séparateur */}
            <div style={{ width: 1, height: 22, background: G(.1), flexShrink: 0 }} />

            {/* ── CITATION ── */}
            {isPlayground ? (
                <div style={{
                    flex: 1, minWidth: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '0 4px',
                }}>
                    <span style={{ fontSize: 11, color: G(.25), flexShrink: 0 }}>✦</span>
                    <span key={citKey} style={{
                        fontFamily: "'Cinzel',serif", fontSize: 11, fontStyle: 'italic',
                        color: G(.45), letterSpacing: '.02em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        animation: 'hdrCitFade .35s ease',
                    }}>"{CITATIONS[citIdx]}"</span>
                    <button onClick={nextCit} style={{
                        flexShrink: 0, background: G(.05), border: `1px solid ${G(.1)}`,
                        borderRadius: 5, width: 20, height: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: G(.4), fontSize: 12, transition: 'all .18s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = G(.12); e.currentTarget.style.color = '#e8a055'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = G(.05); e.currentTarget.style.color = G(.35); }}
                    >↻</button>
                </div>
            ) : <div style={{ flex: 1 }} />}

            {/* Séparateur */}
            <div style={{ width: 1, height: 22, background: G(.1), flexShrink: 0 }} />

            {/* ── HUD SCORE + LEVEL ── */}
            {isPlayground && <GameHUD />}

            {/* Séparateur */}
            <div style={{ width: 1, height: 22, background: G(.1), flexShrink: 0 }} />

            {/* ── NOTIF ── */}
            <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: G(.04), border: `1px solid ${G(.1)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 15, position: 'relative', transition: 'all .18s',
            }}
                onMouseEnter={e => e.currentTarget.style.background = G(.12)}
                onMouseLeave={e => e.currentTarget.style.background = G(.04)}
                title="Notifications">
                🔔
                <div style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#e8a055', border: `1.5px solid rgba(10,5,1,.98)`,
                    animation: 'hdrBlink 2.5s ease-in-out infinite',
                }} />
            </div>

            {/* ── AVATAR ── */}
            <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#2a0860,#6a20b0)',
                border: '1.5px solid rgba(150,80,240,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 13, fontWeight: 400, color: '#e0c0ff',
                fontFamily: "'Nunito',sans-serif", overflow: 'hidden',
                transition: 'all .18s',
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180,120,255,.6)'; e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(150,80,240,.3)'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Mon profil">
                {user?.photoURL
                    ? <img src={user.photoURL} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : initials
                }
            </div>
        </div>
    );
}