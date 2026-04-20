import { useState, useEffect } from "react";

function HomeScreen({ onStart }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: '#0a0600',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            overflow: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Nunito:wght@400;700;900&display=swap');
                @keyframes hs-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
                @keyframes hs-glow    { 0%,100%{box-shadow:0 0 18px #f0a500aa} 50%{box-shadow:0 0 40px #f0a500,0 0 80px #f0a500aa} }
                @keyframes hs-scan    { 0%{top:-5%} 100%{top:105%} }
                @keyframes hs-flicker { 0%,100%{opacity:1} 93%{opacity:.82} 94%{opacity:1} 97%{opacity:.9} 98%{opacity:1} }
                .hs-btn {
                    font-family:'Cinzel',serif; font-weight:700;
                    font-size:1.05rem; letter-spacing:.2em;
                    padding:.95rem 3.5rem;
                    border:2px solid #f0a500; border-radius:2px;
                    background:linear-gradient(135deg,rgba(240,165,0,.16),rgba(240,165,0,.05));
                    color:#ffd700; cursor:pointer;
                    text-transform:uppercase;
                    transition:all .3s;
                    animation:hs-fadeUp .7s .85s ease both, hs-glow 3s 1.8s ease-in-out infinite;
                    clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);
                }
                .hs-btn:hover {
                    background:linear-gradient(135deg,rgba(240,165,0,.38),rgba(240,165,0,.16));
                    transform:scale(1.05); letter-spacing:.26em;
                }
                .hs-scan {
                    position:absolute; left:0; right:0; height:3px;
                    background:linear-gradient(transparent,rgba(240,165,0,.08),transparent);
                    animation:hs-scan 7s linear infinite; pointer-events:none;
                }
            `}</style>

            {/* ── Background image ── */}
            <img
                src={require("../../assets/images/nomadverse_hero.jpg")}
                alt=""
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 1.4s ease',
                    filter: 'brightness(.7) contrast(1.1)',
                }}
                onError={e => e.target.style.display = 'none'}
            />

            {/* Fallback si image absente */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: -1,
                background: 'linear-gradient(160deg,#1a0e00,#2d1400 30%,#0a0600 70%,#000)',
            }} />

            {/* Overlay bas */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom,rgba(0,0,0,.05) 0%,rgba(0,0,0,.15) 45%,rgba(0,0,0,.9) 100%)',
            }} />

            {/* Coins */}
            {[
                { top: 14, left: 14, borderTop: '2px solid #f0a50077', borderLeft: '2px solid #f0a50077' },
                { top: 14, right: 14, borderTop: '2px solid #f0a50077', borderRight: '2px solid #f0a50077' },
                { bottom: 14, left: 14, borderBottom: '2px solid #f0a50077', borderLeft: '2px solid #f0a50077' },
                { bottom: 14, right: 14, borderBottom: '2px solid #f0a50077', borderRight: '2px solid #f0a50077' },
            ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 32, height: 32, zIndex: 5, ...s }} />)}

            <div className="hs-scan" />

            {/* Contenu */}
            <div style={{
                position: 'relative', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem',
                padding: '0 2rem 6%', textAlign: 'center',
                opacity: loaded ? 1 : 0, transition: 'opacity .5s .4s ease',
            }}>
                <h1 style={{
                    fontFamily: "'Cinzel',serif", fontWeight: 900, margin: 0,
                    fontSize: 'clamp(1.8rem,4.5vw,3rem)', letterSpacing: '.15em',
                    background: 'linear-gradient(180deg,#ffd700 0%,#f0a500 50%,#c8860a 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    animation: 'hs-fadeUp .7s .1s ease both, hs-flicker 8s 2s infinite',
                }}>NOMADVERSE</h1>

                <p style={{
                    fontFamily: "'Cinzel',serif", margin: 0,
                    fontSize: 'clamp(.78rem,2vw,1.05rem)', color: 'rgba(255,220,100,.7)', letterSpacing: '.35em',
                    animation: 'hs-fadeUp .7s .3s ease both',
                }}>OMAN STORIES</p>

                <p style={{
                    fontFamily: "'Cinzel',serif", margin: 0,
                    fontSize: 'clamp(.65rem,1.5vw,.9rem)', color: 'rgba(255,200,80,.38)', letterSpacing: '.2em',
                    animation: 'hs-fadeUp .7s .5s ease both',
                }}>قصص عُمان • الرحال الرقمي</p>

                <div style={{ display: 'flex', gap: '2.5rem', margin: '.2rem 0', animation: 'hs-fadeUp .7s .6s ease both' }}>
                    {[{ v: '6', l: 'MISSIONS' }, { v: 'NOVA-1', l: 'ROBOT' }, { v: 'OMAN', l: 'MONDE' }].map(({ v, l }) => (
                        <div key={l} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '1.15rem', color: '#ffd700', fontWeight: 700 }}>{v}</div>
                            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '.56rem', color: 'rgba(255,200,80,.42)', letterSpacing: '.2em' }}>{l}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: 340 }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(240,165,0,.5))' }} />
                    <div style={{ width: 6, height: 6, background: '#f0a500', transform: 'rotate(45deg)' }} />
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(240,165,0,.5),transparent)' }} />
                </div>

                {/* ── BOUTON : appelle onStart, JAMAIS navigate ── */}
                <button className="hs-btn" onClick={onStart}>
                    ⚡ LAUNCH MISSION // إطلاق المهمة
                </button>

                <p style={{
                    fontFamily: "'Nunito',sans-serif", margin: 0,
                    fontSize: '.58rem', color: 'rgba(255,200,80,.22)', letterSpacing: '.3em',
                    animation: 'hs-fadeUp .7s 1s ease both',
                }}>UN MONDE D'IA ET D'HISTOIRE</p>
            </div>
        </div>
    );
}

export default HomeScreen;