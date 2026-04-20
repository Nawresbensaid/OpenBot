// src/components/levels/LevelsScreen.jsx
import { LEVELS } from '../../data/levels';

const diffColor = { 'Débutant': '#4caf50', 'Intermédiaire': '#f0a500', 'Avancé': '#e53935' };

const Stars = ({ count }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3].map(i => (
            <span key={i} style={{ fontSize: '.72rem', color: i <= count ? '#ffd700' : 'rgba(255,215,0,.18)' }}>★</span>
        ))}
    </div>
);

const LevelCard = ({ level, onClick, isCompleted, isActive }) => {
    const isLocked = !level.unlocked && level.id !== 1 && !isCompleted;
    const col = diffColor[level.difficulty] || '#f0a500';

    return (
        <div
            onClick={() => !isLocked && onClick(level)}
            style={{
                position: 'relative',
                background: isActive
                    ? 'linear-gradient(145deg,rgba(240,165,0,.18),rgba(240,165,0,.08))'
                    : isLocked
                        ? 'rgba(8,12,24,.88)'
                        : 'linear-gradient(145deg,rgba(14,20,44,.95),rgba(8,12,28,.98))',
                border: `1.5px solid ${isActive ? '#f0a500' : isLocked ? 'rgba(240,165,0,.18)' : 'rgba(240,165,0,.55)'}`,
                borderRadius: 6,
                overflow: 'hidden',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? .5 : 1,
                transition: 'all .25s',
                boxShadow: isLocked ? 'none' : `0 0 16px rgba(240,165,0,.12)`,
            }}
            onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(240,165,0,.28)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLocked ? 'none' : '0 0 16px rgba(240,165,0,.12)'; }}
        >
            {/* Coins */}
            {[
                { top: 0, left: 0, borderTop: '2px solid #f0a500', borderLeft: '2px solid #f0a500' },
                { top: 0, right: 0, borderTop: '2px solid #f0a500', borderRight: '2px solid #f0a500' },
                { bottom: 0, left: 0, borderBottom: '2px solid #f0a500', borderLeft: '2px solid #f0a500' },
                { bottom: 0, right: 0, borderBottom: '2px solid #f0a500', borderRight: '2px solid #f0a500' },
            ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 10, height: 10, ...s }} />)}

            {/* Badge level */}
            <div style={{
                position: 'absolute', top: 8, left: 8, zIndex: 2,
                background: 'linear-gradient(135deg,rgba(240,165,0,.2),rgba(240,165,0,.08))',
                border: '1px solid rgba(240,165,0,.5)',
                padding: '2px 7px', borderRadius: 2,
            }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.55rem', color: 'rgba(255,200,80,.75)', letterSpacing: '.15em' }}>
                    LEVEL {level.id}
                </span>
            </div>

            {isLocked && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '.9rem', opacity: .45, zIndex: 2 }}>🔒</div>}
            {isActive && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '.7rem', color: '#f0a500', fontFamily: "'Cinzel',serif", zIndex: 2 }}>▶ EN COURS</div>}

            {/* Image */}
            <div style={{
                height: 110,
                backgroundImage: level.image ? `url(${level.image})` : 'none',
                backgroundColor: 'rgba(240,165,0,.05)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: '1px solid rgba(240,165,0,.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
                <span style={{ fontSize: '3rem', position: 'relative', zIndex: 1, filter: isLocked ? 'grayscale(1)' : 'none' }}>
                    {level.emoji}
                </span>
            </div>

            {/* Contenu */}
            <div style={{ padding: '10px 12px 12px' }}>
                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: '.78rem', fontWeight: 700,
                    color: isLocked ? 'rgba(255,200,80,.35)' : '#ffd700',
                    letterSpacing: '.07em', marginBottom: 2, textTransform: 'uppercase',
                }}>{level.name}</div>

                {level.nameAr && (
                    <div style={{ fontFamily: "'Amiri',serif", fontSize: '.72rem', color: 'rgba(255,200,80,.35)', direction: 'rtl', marginBottom: 4 }}>
                        {level.nameAr}
                    </div>
                )}

                <div style={{
                    fontFamily: "'Nunito',sans-serif", fontSize: '.62rem',
                    color: 'rgba(255,200,80,.45)', marginBottom: 8, lineHeight: 1.4,
                }}>{level.description}</div>

                {level.theme && (
                    <div style={{
                        fontFamily: "'Cinzel',serif", fontSize: '.5rem',
                        color: `${col}cc`, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6,
                    }}>{level.theme}</div>
                )}

                <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(240,165,0,.25),transparent)', marginBottom: 8 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontFamily: "'Nunito',sans-serif", fontSize: '.58rem',
                        color: col, letterSpacing: '.12em', fontWeight: 700, textTransform: 'uppercase',
                    }}>{level.difficulty}</span>
                    <Stars count={level.stars} />
                </div>

                {isCompleted && (
                    <div style={{ marginTop: 6, fontSize: '.55rem', color: '#4caf50', fontFamily: "'Cinzel',serif", letterSpacing: 1 }}>✅ COMPLÉTÉ</div>
                )}

                <div style={{
                    marginTop: 6, fontFamily: "'Nunito',sans-serif", fontSize: '.55rem',
                    color: 'rgba(255,200,80,.28)', fontStyle: 'italic',
                }}>💡 {level.hint}</div>
            </div>
        </div>
    );
};

function LevelsScreen({ onSelectLevel, onBack, completedLevels = [], activeMission = null }) {
    const isUnlocked = (level) =>
        level.unlocked || level.id === 1 || completedLevels.includes(level.id - 1);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            overflow: 'auto', fontFamily: "'Nunito',sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@400;700;900&family=Nunito:wght@400;700;900&display=swap');
                @keyframes ls-fadeIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes ls-glow   { 0%,100%{text-shadow:0 0 18px rgba(240,165,0,.35)} 50%{text-shadow:0 0 36px rgba(240,165,0,.75),0 0 70px rgba(240,165,0,.25)} }
                @keyframes ls-scan   { 0%{top:-5%} 100%{top:105%} }
                ::-webkit-scrollbar{width:5px}
                ::-webkit-scrollbar-track{background:#080c1a}
                ::-webkit-scrollbar-thumb{background:rgba(240,165,0,.35);border-radius:3px}
            `}</style>

            {/* Fallback background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: -1,
                background: 'linear-gradient(160deg,#080c1a 0%,#0d1528 50%,#060a14 100%)',
            }} />

            {/* Grille de fond */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(240,165,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(240,165,0,.025) 1px,transparent 1px)',
                backgroundSize: '44px 44px',
            }} />

            {/* Overlay */}
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', pointerEvents: 'none' }} />

            {/* Scanline */}
            <div style={{
                position: 'fixed', left: 0, right: 0, height: 3,
                background: 'linear-gradient(transparent,rgba(240,165,0,.07),transparent)',
                animation: 'ls-scan 8s linear infinite', pointerEvents: 'none', zIndex: 10,
            }} />

            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '36px 28px 56px', position: 'relative' }}>

                {/* Bouton retour */}
                <button onClick={onBack} style={{
                    position: 'absolute', left: 28, top: 0,
                    background: 'transparent', border: '1px solid rgba(240,165,0,.4)',
                    color: '#f0a500', fontFamily: "'Cinzel',serif",
                    fontSize: '.68rem', letterSpacing: '.15em',
                    padding: '5px 13px', cursor: 'pointer', borderRadius: 2,
                }}>← RETOUR</button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{
                        fontFamily: "'Cinzel',serif", fontWeight: 900, margin: 0,
                        fontSize: 'clamp(1.4rem,3.5vw,2.4rem)', letterSpacing: '.2em',
                        background: 'linear-gradient(180deg,#ffd700 0%,#f0a500 50%,#c8860a 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: 'ls-glow 4s ease-in-out infinite',
                    }}>NOMADVERSE: OMAN STORIES</h1>
                    <p style={{
                        fontFamily: "'Cinzel',serif", fontSize: '.7rem',
                        color: 'rgba(255,200,80,.38)', letterSpacing: '.4em',
                        marginTop: 8, textTransform: 'uppercase',
                    }}>UN MONDE D'IA ET D'HISTOIRE</p>
                </div>

                {/* Grille 3x2 levels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                    {LEVELS.map((level, i) => (
                        <div key={level.id} style={{ animation: `ls-fadeIn .45s ${i * .08}s ease both` }}>
                            <LevelCard
                                level={level}
                                onClick={onSelectLevel}
                                isCompleted={completedLevels.includes(level.id)}
                                isActive={activeMission?.id === level.id}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LevelsScreen;