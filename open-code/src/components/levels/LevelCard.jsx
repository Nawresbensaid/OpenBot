// src/components/levels/LevelCard.jsx

function LevelCard({ level, isActive, onSelect, isCompleted }) {
    const isLocked = !level.unlocked;
    const diffColor = { 'Débutant': '#4caf50', 'Intermédiaire': '#f0a500', 'Avancé': '#e53935' };
    const col = diffColor[level.difficulty] || '#f0a500';

    return (
        <div
            onClick={() => !isLocked && onSelect(level)}
            style={{
                position: 'relative',
                borderRadius: 6,
                overflow: 'hidden',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.6 : 1,
                transition: 'all .25s',
                border: `1.5px solid ${isActive ? '#f0a500' : isLocked ? 'rgba(240,165,0,.18)' : 'rgba(240,165,0,.55)'}`,
                boxShadow: isLocked ? 'none' : '0 0 16px rgba(240,165,0,.12)',
                minHeight: 180,
            }}
            onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(240,165,0,.35)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLocked ? 'none' : '0 0 16px rgba(240,165,0,.12)'; }}
        >
            {/* Overlay semi-transparent */}
            <div style={{
                position: 'absolute', inset: 0,
                background: isActive
                    ? 'rgba(240,165,0,.15)'
                    : isLocked
                        ? 'rgba(0,0,0,.55)'
                        : 'rgba(0,0,0,.35)',
                backdropFilter: 'blur(2px)',
            }} />

            {/* Coins décoratifs */}
            {[
                { top: 0, left: 0, borderTop: '2px solid #f0a500', borderLeft: '2px solid #f0a500' },
                { top: 0, right: 0, borderTop: '2px solid #f0a500', borderRight: '2px solid #f0a500' },
                { bottom: 0, left: 0, borderBottom: '2px solid #f0a500', borderLeft: '2px solid #f0a500' },
                { bottom: 0, right: 0, borderBottom: '2px solid #f0a500', borderRight: '2px solid #f0a500' },
            ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 10, height: 10, zIndex: 2, ...s }} />)}

            {/* Contenu */}
            <div style={{ position: 'relative', zIndex: 1, padding: '10px 12px 12px', background: 'rgba(0,0,0,.45)' }}>

                {/* Badge level + lock */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{
                        fontFamily: "'Cinzel',serif", fontSize: '.55rem',
                        color: 'rgba(255,200,80,.75)', letterSpacing: '.15em',
                        background: 'rgba(240,165,0,.15)', border: '1px solid rgba(240,165,0,.4)',
                        padding: '2px 7px', borderRadius: 2,
                    }}>LEVEL {level.id}</span>
                    {isLocked && <span style={{ fontSize: '.85rem', opacity: .6 }}>🔒</span>}
                    {isActive && <span style={{ fontSize: '.6rem', color: '#f0a500', fontFamily: "'Cinzel',serif" }}>▶ EN COURS</span>}
                    {isCompleted && <span style={{ fontSize: '.6rem', color: '#4caf50', fontFamily: "'Cinzel',serif" }}>✅</span>}
                </div>

                {/* Image + emoji */}
                <div style={{
                    height: 110,
                    backgroundImage: level.image ? `url(${level.image})` : 'none',
                    background: level.image ? undefined : 'rgba(240,165,0,.05)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottom: '1px solid rgba(240,165,0,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }} />
                    <span style={{
                        fontSize: '2rem', zIndex: 1,
                        filter: isLocked ? 'grayscale(1)' : 'none'
                    }}>
                        {level.emoji}
                    </span>
                </div>

                {/* Nom */}
                <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: '.78rem', fontWeight: 700,
                    color: isLocked ? 'rgba(255,200,80,.35)' : '#ffd700',
                    letterSpacing: '.07em', marginBottom: 2, textTransform: 'uppercase',
                }}>{level.name}</div>

                {/* Nom arabe */}
                {level.nameAr && (
                    <div style={{ fontFamily: "'Amiri',serif", fontSize: '.7rem', color: 'rgba(255,200,80,.4)', direction: 'rtl', marginBottom: 4 }}>
                        {level.nameAr}
                    </div>
                )}

                {/* Description */}
                <div style={{
                    fontFamily: "'Nunito',sans-serif", fontSize: '.58rem',
                    color: 'rgba(255,200,80,.5)', marginBottom: 6, lineHeight: 1.4,
                }}>{level.description}</div>

                {/* Theme */}
                {level.theme && (
                    <div style={{
                        fontFamily: "'Cinzel',serif", fontSize: '.48rem',
                        color: `${col}cc`, letterSpacing: '.1em',
                        textTransform: 'uppercase', marginBottom: 6,
                    }}>{level.theme}</div>
                )}

                <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(240,165,0,.3),transparent)', marginBottom: 6 }} />

                {/* Difficulté + étoiles */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontFamily: "'Nunito',sans-serif", fontSize: '.55rem',
                        color: col, letterSpacing: '.1em', fontWeight: 700, textTransform: 'uppercase',
                    }}>{level.difficulty}</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3].map(i => (
                            <span key={i} style={{ fontSize: '.7rem', color: i <= level.stars ? '#ffd700' : 'rgba(255,215,0,.18)' }}>★</span>
                        ))}
                    </div>
                </div>

                {/* Hint */}
                <div style={{ marginTop: 5, fontSize: '.52rem', color: 'rgba(255,200,80,.3)', fontStyle: 'italic' }}>
                    💡 {level.hint}
                </div>
            </div>
        </div>
    );
}

export default LevelCard;