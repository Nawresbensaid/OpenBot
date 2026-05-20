// ═══════════════════════════════════════════════════════════════
// ScoreLevelHUD.jsx  —  Badges Score + Level actifs pour le Header
// Place ce fichier dans :  src/components/navBar/ScoreLevelHUD.jsx
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { useGameScore } from '../../utils/useGameScore';

// ── Styles injectés une seule fois ──────────────────────────────
const HUD_STYLES = `
@keyframes nvScoreBump {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.45); color: #fff8c0; }
  100% { transform: scale(1); }
}
@keyframes nvStarPop {
  0%   { transform: scale(1) rotate(0deg); }
  50%  { transform: scale(1.8) rotate(18deg); filter: brightness(1.8); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes nvXpFlow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes nvLevelOverlay {
  0%   { opacity: 0; transform: scale(0.82); }
  60%  { transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes nvStarRain {
  0%   { opacity: 0; transform: translateY(-20px) scale(0); }
  50%  { opacity: 1; transform: translateY(0) scale(1.3); }
  100% { opacity: 0; transform: translateY(12px) scale(0.8); }
}
.nv-score-bump { animation: nvScoreBump 0.38s ease !important; }
.nv-star-pop   { animation: nvStarPop 0.5s ease !important; }
`;

let stylesInjected = false;
function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = HUD_STYLES;
    document.head.appendChild(el);
    stylesInjected = true;
}

// ── Composant principal ─────────────────────────────────────────
export function ScoreLevelHUD() {
    injectStyles();
    const { score, level, xp, xpNeeded, scoreAnim } = useGameScore();

    const xpPct = Math.min(100, Math.round((xp / xpNeeded) * 100));
    const G = a => `rgba(201,168,76,${a})`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>

            {/* ── SCORE ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '.4rem',
                background: 'rgba(201,168,76,.07)', border: `1px solid ${G(.25)}`,
                borderRadius: '20px', padding: '4px 14px',
            }}>
                <span style={{ fontSize: '.58rem', color: G(.6), fontFamily: "'Cinzel',serif", letterSpacing: '.08em' }}>SCORE</span>
                <span
                    className={scoreAnim ? 'nv-score-bump' : ''}
                    style={{
                        fontSize: '1rem', fontWeight: 800, color: '#f5c842',
                        fontFamily: "'Space Mono',monospace", minWidth: 32,
                        display: 'inline-block', textAlign: 'center',
                        transition: 'color .2s',
                    }}
                >
                    {score}
                </span>
            </div>

            {/* ── LEVEL ── */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: 'rgba(201,168,76,.07)', border: `1px solid ${G(.25)}`,
                borderRadius: '12px', padding: '4px 12px 6px', gap: '3px', minWidth: 80,
            }}>
                {/* Label + numéro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                    <span style={{ fontSize: '.55rem', color: G(.6), fontFamily: "'Cinzel',serif", letterSpacing: '.08em' }}>LEVEL</span>
                    <span style={{ fontSize: '.85rem', fontWeight: 800, color: '#f5c842', fontFamily: "'Space Mono',monospace" }}>
                        {level}
                    </span>
                </div>

                {/* Étoiles */}
                <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: '.72rem',
                                color: i < level ? '#f5c842' : G(.18),
                                transition: 'color .4s',
                                display: 'inline-block',
                            }}
                        >★</span>
                    ))}
                </div>

                {/* Barre XP */}
                <div style={{
                    width: '100%', height: 3, background: G(.12),
                    borderRadius: 2, overflow: 'hidden', marginTop: 1,
                }}>
                    <div style={{
                        height: '100%', width: `${xpPct}%`,
                        background: 'linear-gradient(90deg,#c9a84c,#f5c842,#c9a84c)',
                        backgroundSize: '200% 100%',
                        animation: 'nvXpFlow 1.5s linear infinite',
                        borderRadius: 2, transition: 'width .5s ease',
                    }} />
                </div>
                <span style={{ fontSize: '.42rem', color: G(.4), fontFamily: "'Space Mono',monospace" }}>
                    {xp} / {xpNeeded} XP
                </span>
            </div>
        </div>
    );
}

// ── Overlay Level Up ────────────────────────────────────────────
// À placer dans le JSX principal (Playground) juste avant </div> final
export function LevelUpOverlay() {
    const { levelUpInfo, dismissLevelUp, level } = useGameScore();
    if (!levelUpInfo) return null;

    const { newLevel } = levelUpInfo;
    const G = a => `rgba(201,168,76,${a})`;

    return (
        <div
            onClick={dismissLevelUp}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'rgba(0,0,0,.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                cursor: 'pointer',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(160deg,#0f0800,#1a0e00)',
                    border: `1px solid ${G(.5)}`,
                    borderRadius: 18, padding: '2.2rem 3rem',
                    textAlign: 'center', minWidth: 280,
                    animation: 'nvLevelOverlay .35s cubic-bezier(.34,1.56,.64,1)',
                    boxShadow: `0 0 60px ${G(.25)}, 0 20px 60px rgba(0,0,0,.8)`,
                    position: 'relative', overflow: 'hidden',
                }}
            >
                {/* Ligne dorée top */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg,transparent,#f5c842 40%,#f0d080 50%,#f5c842 60%,transparent)',
                }} />

                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: '.65rem',
                    color: G(.7), letterSpacing: '.18em', marginBottom: '.5rem',
                }}>
                    NIVEAU ATTEINT !
                </div>

                {/* Badge niveau */}
                <div style={{
                    background: 'linear-gradient(135deg,#7a4500,#c9a84c,#f5e070,#c9a84c,#7a4500)',
                    backgroundSize: '200% auto',
                    animation: 'goldShimmer 3s linear infinite',
                    borderRadius: 12, padding: '1rem 2rem',
                    margin: '.6rem auto', display: 'inline-block',
                }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.55rem', color: '#4a2800', letterSpacing: '.15em' }}>LEVEL</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '3rem', fontWeight: 800, color: '#1a0800', lineHeight: 1 }}>
                        {newLevel}
                    </div>
                </div>

                {/* Étoiles animées */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '.6rem 0' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{
                            fontSize: '1.4rem',
                            color: i < newLevel ? '#f5c842' : G(.2),
                            display: 'inline-block',
                            animation: i < newLevel ? `nvStarRain 0.5s ${i * 0.1}s ease both` : 'none',
                        }}>★</span>
                    ))}
                </div>

                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '.68rem', color: G(.55), marginBottom: '1rem' }}>
                    Continue à coder pour débloquer le niveau suivant !
                </div>

                <button
                    onClick={dismissLevelUp}
                    style={{
                        background: 'linear-gradient(135deg,#7a4500,#c9a84c,#f5e070,#c9a84c,#7a4500)',
                        backgroundSize: '200% auto',
                        animation: 'goldShimmer 3s linear infinite',
                        border: 'none', borderRadius: 8,
                        padding: '.5rem 1.8rem',
                        fontFamily: "'Cinzel',serif", fontSize: '.7rem', fontWeight: 700,
                        color: '#1a0800', cursor: 'pointer', letterSpacing: '.08em',
                        transition: 'transform .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Continuer ▶
                </button>

                {/* Ligne dorée bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg,transparent,#f5c842 40%,#f0d080 50%,#f5c842 60%,transparent)',
                }} />
            </div>
        </div>
    );
}