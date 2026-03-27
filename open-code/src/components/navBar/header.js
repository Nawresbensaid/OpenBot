import React, { useContext, useState } from 'react';
import { ThemeContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/context";
import { PathName } from "../../utils/constants";

export function Header() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { projectName, setProjectName, user } = useContext(StoreContext);
    const [open, setOpen] = useState(false);
    const location = useLocation();

    return (
        <div style={{
            height: '4.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            background: 'rgba(2,5,16,.92)',
            borderBottom: '1px solid rgba(108,190,255,.15)',
            backdropFilter: 'blur(24px)',
            position: 'relative',
            zIndex: 20,
            flexShrink: 0,
        }}>
            <style>{`
                @keyframes logo-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .nav-icon-btn:hover { background:rgba(108,190,255,.22)!important; transform:translateY(-1px); }
                .nav-sign-btn:hover { transform:translateY(-2px); box-shadow:0 6px 25px rgba(108,190,255,.55)!important; }
                .nav-project:hover { background:rgba(251,191,36,.12)!important; border-color:rgba(251,191,36,.35)!important; }
            `}</style>

            {/* ── GAUCHE : Logo ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #6cbefd, #a78bfa, #f472b6, #6cbefd)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 18px rgba(108,190,255,.5)',
                    animation: 'logo-spin 8s linear infinite',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '1.3rem', animation: 'logo-spin 8s linear infinite reverse' }}>🤖</span>
                </div>
                <div>
                    <div style={{
                        fontFamily: "'Fredoka One',cursive",
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg,#6cbefd,#a78bfa,#f472b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '.06em',
                        lineHeight: 1,
                    }}>NomadVerse</div>
                    <div style={{
                        fontSize: '.58rem',
                        color: 'rgba(200,221,240,.4)',
                        letterSpacing: '.15em',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                    }}>Your code. Your robot. Your world</div>
                </div>
            </div>

            {/* ── CENTRE : Nom du projet ── */}
            {location.pathname === PathName.playGround && (
                <div
                    onClick={() => setOpen(!open)}
                    className="nav-project"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '.5rem',
                        fontFamily: "'Fredoka One',cursive", fontSize: '1.05rem',
                        color: '#fbbf24',
                        textShadow: '0 0 18px rgba(251,191,36,.4)',
                        letterSpacing: '.08em',
                        background: 'rgba(251,191,36,.07)',
                        border: '1px solid rgba(251,191,36,.18)',
                        padding: '.35rem 1.2rem', borderRadius: '50px',
                        cursor: 'pointer', transition: 'all .2s',
                    }}
                >
                    🪐 <span>{projectName || 'mon-projet'}</span>
                    <span style={{ fontSize: '.8rem', opacity: .5 }}>▾</span>
                </div>
            )}

            {/* ── DROITE : Score + Niveau ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>

                {/* Score */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    padding: '.35rem 1.1rem', borderRadius: '20px',
                    background: 'rgba(52,211,153,.08)',
                    border: '1px solid rgba(52,211,153,.22)',
                }}>
                    <span style={{ fontSize: '1.1rem' }}>🏆</span>
                    <div>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.65rem', color: 'rgba(200,221,240,.4)', letterSpacing: '.1em' }}>SCORE:</div>
                    </div>
                </div>

                {/* Niveau avec étoiles dynamiques */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    padding: '.35rem 1.1rem', borderRadius: '20px',
                    background: 'rgba(251,191,36,.08)',
                    border: '1px solid rgba(251,191,36,.22)',
                }}>
                    <span style={{ fontSize: '1.1rem' }}>🌟</span>
                    <div>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.65rem', color: 'rgba(200,221,240,.4)', letterSpacing: '.1em' }}>LEVEL</div>
                        <div style={{ display: 'flex', gap: '1px' }}>
                            {['⭐', '☆', '☆', '☆', '☆'].map((s, i) => (
                                <span key={i} style={{ fontSize: '.7rem', lineHeight: 1 }}>{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Avatar / profil */}
                {user?.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt="profil"
                        style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            border: '2px solid rgba(108,190,255,.4)',
                            cursor: 'pointer',
                            boxShadow: '0 0 12px rgba(108,190,255,.3)',
                        }}
                    />
                ) : (
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'linear-gradient(135deg,#6cbefd,#a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', cursor: 'pointer',
                        boxShadow: '0 0 12px rgba(108,190,255,.3)',
                    }}>👨‍🚀</div>
                )}
            </div>
        </div>
    );
}