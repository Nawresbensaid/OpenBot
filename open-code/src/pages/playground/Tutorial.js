import React, { useState, useEffect, useCallback, useRef } from 'react';

const CARD_W = 420;
const GAP = 20;

const vw = () => (typeof window !== 'undefined' ? window.innerWidth || 1280 : 1280);
const vh = () => (typeof window !== 'undefined' ? window.innerHeight || 800 : 800);

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to NomadVerse! 🤖',
        desc: 'Here you program your robot with blocks, see the generated code in real time, and send it directly to your physical robot. This guide covers 6 key areas.',
        icon: '🌟',
        selector: null,
        cardSide: 'center',
        highlight: null,
    },
    {
        id: 'toolbox',
        title: 'Block Library',
        desc: 'Click a category (Control, Movement, Loops, Sensors…) to show its blocks. Drag any block onto the canvas to start programming your robot.',
        icon: '🧩',
        selector: '.blocklyToolboxDiv',
        cardSide: 'right',
        highlight: 'Block categories',
    },
    {
        id: 'canvas',
        title: 'Programming Canvas',
        desc: 'Assemble your blocks here. The "start" and "forever" blocks are entry points. JS and PY code is generated automatically on the right panel.',
        icon: '🎨',
        selector: '.injectionDiv',
        cardSide: 'bottom-right',
        highlight: 'Block canvas',
    },
    {
        id: 'editor',
        title: 'Code Editor + QR',
        desc: 'The code from your blocks appears here in JavaScript or Python. Click ▶ Run to test it, or 📱 QR to generate a scannable QR code for the OpenBot app.',
        icon: '⚡',
        selector: '[data-tut="editor"]',
        cardSide: 'left',
        highlight: 'Code editor',
    },
    {
        id: 'simulator',
        title: 'Robot Simulator',
        desc: 'Connect your robot via WebSocket (ws://…) or use the live video feed. Click ⛶ to open the scene view in a draggable floating window.',
        icon: '🤖',
        selector: '[data-tut="simulator"]',
        cardSide: 'left',
        highlight: 'Robot simulator',
    },
    {
        id: 'qr',
        title: 'QR Code — OpenBot',
        desc: 'Click 📱 QR in the editor header to generate a QR code. A draggable floating window appears — move it anywhere, then scan it with the OpenBot app to run your code on the robot!',
        icon: '📱',
        selector: null,
        cardSide: 'center',
        highlight: null,
        showQrHint: true,
    },
];

function safe(n, fallback = 0) {
    return Number.isFinite(n) ? n : fallback;
}

function placeCard(side, r, cardH) {
    const W = vw(), H = vh();
    const safeH = safe(cardH, 300);

    if (!r || side === 'center') {
        return {
            top: safe(H / 2 - safeH / 2, 100),
            left: safe(W / 2 - CARD_W / 2, 100),
            arrowSide: null,
        };
    }

    const rt = safe(r.top, 0);
    const rl = safe(r.left, 0);
    const rw = safe(r.width, 100);
    const rh = safe(r.height, 100);
    const cy = rt + rh / 2;

    if (side === 'right') {
        return {
            top: safe(Math.max(8, Math.min(H - safeH - 8, cy - safeH / 2)), 100),
            left: safe(Math.min(rl + rw + GAP, W - CARD_W - 8), 100),
            arrowSide: 'right',
        };
    }

    if (side === 'left') {
        return {
            top: safe(Math.max(8, Math.min(H - safeH - 8, cy - safeH / 2)), 100),
            left: safe(Math.max(8, rl - CARD_W - GAP), 8),
            arrowSide: 'left',
        };
    }

    if (side === 'bottom-right') {
        return {
            top: safe(H - safeH - 56, 100),
            left: safe(W - CARD_W - 16, 100),
            arrowSide: null,
        };
    }

    return {
        top: safe(H / 2 - safeH / 2, 100),
        left: safe(W / 2 - CARD_W / 2, 100),
        arrowSide: null,
    };
}

const Mask = ({ spot }) => {
    const BG = 'rgba(3,1,0,.82)';
    const W = vw(), H = vh();
    const base = { position: 'fixed', zIndex: 99997, pointerEvents: 'none', background: BG };

    if (!spot) return <div style={{ ...base, top: 0, left: 0, width: W, height: H }} />;

    const t = safe(spot.top, 0);
    const l = safe(spot.left, 0);
    const w = safe(spot.width, 100);
    const h = safe(spot.height, 100);

    return (
        <>
            <div style={{ ...base, top: 0, left: 0, width: W, height: t }} />
            <div style={{ ...base, top: t + h, left: 0, width: W, height: Math.max(0, H - (t + h)) }} />
            <div style={{ ...base, top: t, left: 0, width: Math.max(0, l), height: h }} />
            <div style={{ ...base, top: t, left: l + w, width: Math.max(0, W - (l + w)), height: h }} />
        </>
    );
};

const TutStyles = ({ cardW }) => (
    <style>{`
    @keyframes tutFadeIn  { from{opacity:0;transform:scale(.93) translateY(6px)} to{opacity:1;transform:none} }
    @keyframes tutSlideR  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
    @keyframes tutSlideL  { from{opacity:0;transform:translateX(12px)}  to{opacity:1;transform:none} }
    @keyframes tutGlow    { 0%,100%{border-color:rgba(201,168,76,.5)} 50%{border-color:rgba(240,208,80,1)} }
    @keyframes tutScan    { 0%{top:0} 100%{top:calc(100% - 2px)} }
    @keyframes tutShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes tutSpin    { 0%{transform:rotate(0deg)} 50%{transform:rotate(8deg) scale(1.1)} 100%{transform:none} }

    .tut-close-layer { position:fixed; inset:0; z-index:99996; cursor:pointer; }

    .tut-spot {
      position:fixed; z-index:99998; border-radius:8px;
      border:2px solid rgba(201,168,76,.9);
      animation:tutGlow 2s ease-in-out infinite;
      pointer-events:none;
    }
    .tut-spot::after {
      content:''; position:absolute; left:6px; right:6px; height:2px;
      background:linear-gradient(90deg,transparent,rgba(201,168,76,.9),transparent);
      animation:tutScan 2s ease-in-out infinite; border-radius:1px;
    }
    .tut-spot-label {
      position:absolute; bottom:calc(100% + 8px); left:50%;
      transform:translateX(-50%);
      background:rgba(201,168,76,.14); border:1px solid rgba(201,168,76,.5);
      border-radius:20px; padding:3px 16px;
      font-family:'Space Mono',monospace; font-size:.55rem;
      color:#c9a84c; white-space:nowrap; letter-spacing:.06em; pointer-events:none;
    }

    .tut-arr { position:fixed; z-index:99999; pointer-events:none; width:0; height:0; }

    .tut-card {
      position:fixed; width:${cardW}px; z-index:100000;
      background:linear-gradient(148deg,rgba(14,7,0,.98) 0%,rgba(6,3,0,1) 100%);
      border:1px solid rgba(201,168,76,.48); border-radius:16px; overflow:hidden;
      box-shadow:0 0 0 1px rgba(0,0,0,.95),0 20px 60px rgba(0,0,0,.9),
                 0 0 40px rgba(201,168,76,.1),inset 0 1px 0 rgba(201,168,76,.2);
    }
    .tut-card.ac { animation:tutFadeIn .25s ease-out; }
    .tut-card.ar { animation:tutSlideR .25s ease-out; }
    .tut-card.al { animation:tutSlideL .25s ease-out; }

    .tut-hdr {
      position:relative; overflow:hidden; padding:.9rem 1.3rem .7rem;
      background:linear-gradient(135deg,rgba(201,168,76,.1) 0%,rgba(8,4,1,.7) 50%,rgba(201,168,76,.04) 100%);
      border-bottom:1px solid rgba(201,168,76,.18);
    }
    .tut-hdr::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,rgba(240,208,80,.75) 40%,rgba(201,168,76,.5) 60%,transparent);
    }
    .tut-ico { font-size:2.2rem; display:inline-block; animation:tutSpin 4s ease-in-out infinite; }
    .tut-ttl {
      font-family:'Cinzel',serif; font-size:1.05rem; font-weight:600; letter-spacing:.06em;
      background:linear-gradient(90deg,#c9a84c,#f0d080,#fff8e1,#f0d080,#c9a84c);
      background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text; animation:tutShimmer 4s linear infinite;
    }
    .tut-stp { font-family:'Space Mono',monospace; font-size:.58rem; color:rgba(201,168,76,.4); letter-spacing:.08em; margin-top:4px; }

    .tut-body { padding:1.1rem 1.3rem .9rem; }
    .tut-desc { font-family:'Nunito',sans-serif; font-size:.98rem; color:rgba(224,200,140,.88); line-height:1.78; margin:0; }

    .tut-qr-hint {
      margin-top:.8rem; border-radius:10px; padding:.65rem .85rem;
      background:rgba(201,168,76,.05); border:1px solid rgba(201,168,76,.18);
      display:flex; align-items:center; gap:.75rem;
    }
    .tut-qr-mock {
      width:48px; height:48px; flex-shrink:0; background:#fff;
      border-radius:5px; padding:4px;
      display:grid; grid-template-columns:1fr 1fr 1fr; gap:3px;
    }
    .tut-qr-txt { font-family:'Nunito',sans-serif; font-size:.75rem; color:rgba(224,200,140,.75); line-height:1.65; }

    .tut-div  { height:1px; margin:0 1.3rem; background:linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent); }
    .tut-foot { display:flex; align-items:center; justify-content:space-between; padding:.65rem 1.3rem .75rem; }
    .tut-dots { display:flex; gap:6px; align-items:center; }
    .tut-dot  {
      height:7px; width:7px; border-radius:4px;
      background:rgba(201,168,76,.18); border:1px solid rgba(201,168,76,.22);
      transition:all .25s; cursor:pointer;
    }
    .tut-dot.on { width:20px; background:#c9a84c; box-shadow:0 0 8px rgba(201,168,76,.5); border-color:#c9a84c; }
    .tut-dot:hover:not(.on) { background:rgba(201,168,76,.38); }
    .tut-btns { display:flex; gap:.45rem; align-items:center; }
    .tut-skip {
      background:transparent; border:1px solid rgba(201,168,76,.18); border-radius:7px;
      color:rgba(201,168,76,.45); font-family:'Nunito',sans-serif; font-size:.72rem; font-weight:700;
      padding:.32rem .8rem; cursor:pointer; transition:all .15s;
    }
    .tut-skip:hover { color:rgba(201,168,76,.8); border-color:rgba(201,168,76,.4); background:rgba(201,168,76,.07); }
    .tut-next {
      background:linear-gradient(105deg,#7a4500 0%,#c9a84c 30%,#f5e070 50%,#c9a84c 70%,#7a4500 100%);
      background-size:200% auto; animation:tutShimmer 3s linear infinite;
      border:none; border-radius:7px; color:#0a0400;
      font-family:'Cinzel',serif; font-size:.72rem; font-weight:700;
      padding:.36rem 1.1rem; cursor:pointer; letter-spacing:.06em;
      box-shadow:0 2px 12px rgba(201,168,76,.3),inset 0 1px 0 rgba(255,255,255,.2);
      transition:transform .14s,filter .14s;
    }
    .tut-next:hover { transform:translateY(-1px) scale(1.04); filter:brightness(1.1); }
    .tut-next:active { transform:scale(.96); }
  `}</style>
);

export const Tutorial = ({ onClose }) => {
    const [idx, setIdx] = useState(0);
    const [spot, setSpot] = useState(null);
    const [pos, setPos] = useState({ top: 100, left: 100, arrowSide: null });
    const [animCls, setAnimCls] = useState('ac');
    const [cardKey, setCardKey] = useState(0);
    const cardRef = useRef(null);
    const timers = useRef([]);

    const step = STEPS[idx];
    const isLast = idx === STEPS.length - 1;

    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

    const measure = useCallback((s) => {
        if (!s.selector) {
            setSpot(null);
            const h = safe(cardRef.current?.offsetHeight, 300);
            setPos(placeCard('center', null, h));
            return;
        }

        const attempt = (n) => {
            try {
                const el = document.querySelector(s.selector);
                if (el) {
                    const r = el.getBoundingClientRect();
                    const t = safe(r.top, -1);
                    const l = safe(r.left, -1);
                    const w = safe(r.width, 0);
                    const h = safe(r.height, 0);

                    // ✅ FIXED: t < vh() and l < vw() (not swapped)
                    if (w > 10 && h > 10 && t >= -1 && l >= -1 && t < vh() && l < vw()) {
                        const spotData = { top: Math.max(0, t), left: Math.max(0, l), width: w, height: h };
                        setSpot(spotData);
                        const cardH = safe(cardRef.current?.offsetHeight, 300);
                        setPos(placeCard(s.cardSide, spotData, cardH));
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

            if (n > 0) {
                const t2 = setTimeout(() => attempt(n - 1), 200);
                timers.current.push(t2);
            } else {
                setSpot(null);
                const cardH = safe(cardRef.current?.offsetHeight, 300);
                setPos(placeCard('center', null, cardH));
            }
        };

        attempt(12);
    }, []);

    useEffect(() => {
        clearAll();
        const s = STEPS[idx];
        setAnimCls(s.cardSide === 'right' ? 'ar' : s.cardSide === 'left' ? 'al' : 'ac');
        setCardKey(k => k + 1);
        const t = setTimeout(() => measure(s), 80);
        timers.current.push(t);
        return clearAll;
    }, [idx, measure]);

    useEffect(() => {
        const h = e => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); doNext(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); doPrev(); }
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    });

    const doNext = () => isLast ? onClose() : setIdx(i => i + 1);
    const doPrev = () => { if (idx > 0) setIdx(i => i - 1); };

    const safeTop = safe(pos.top, 100);
    const safeLeft = safe(pos.left, 100);
    const cardH = cardRef.current?.offsetHeight || 300;

    return (
        <>
            <TutStyles cardW={CARD_W} />

            <div className="tut-close-layer" onClick={onClose} />
            <Mask spot={spot} />

            {/* Spotlight */}
            {spot && (
                <div
                    className="tut-spot"
                    style={{
                        top: safe(spot.top, 0),
                        left: safe(spot.left, 0),
                        width: safe(spot.width, 100),
                        height: safe(spot.height, 100),
                    }}
                >
                    {step.highlight && <div className="tut-spot-label">{step.highlight}</div>}
                </div>
            )}

            {/* Arrow — card LEFT of element → arrow points RIGHT from card's right edge */}
            {pos.arrowSide === 'left' && spot && (
                <div
                    className="tut-arr"
                    style={{
                        top: safe(safeTop + cardH / 2 - 10, 100),
                        left: safe(safeLeft + CARD_W, 0),
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: '13px solid rgba(201,168,76,.75)',
                    }}
                />
            )}

            {/* Arrow — card RIGHT of element → arrow points LEFT from card's left edge */}
            {pos.arrowSide === 'right' && spot && (
                <div
                    className="tut-arr"
                    style={{
                        top: safe(safeTop + cardH / 2 - 10, 100),
                        left: safe(safeLeft - 13, 0),
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: '13px solid rgba(201,168,76,.75)',
                    }}
                />
            )}

            {/* Card */}
            <div
                key={cardKey}
                ref={cardRef}
                className={`tut-card ${animCls}`}
                style={{ top: safeTop, left: safeLeft }}
                onClick={e => e.stopPropagation()}
            >
                <div className="tut-hdr">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.65rem' }}>
                        <span className="tut-ico">{step.icon}</span>
                        <div>
                            <div className="tut-ttl">{step.title}</div>
                            <div className="tut-stp">STEP {idx + 1} / {STEPS.length}</div>
                        </div>
                    </div>
                </div>

                <div className="tut-body">
                    <p className="tut-desc">{step.desc}</p>
                    {step.showQrHint && (
                        <div className="tut-qr-hint">
                            <div className="tut-qr-mock">
                                {[1, 1, 0, 1, 0, 1, 0, 1, 1].map((v, i) => (
                                    <div key={i} style={{ background: v ? '#111' : '#fff', borderRadius: '1px' }} />
                                ))}
                            </div>
                            <div className="tut-qr-txt">
                                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.52rem', color: '#c9a84c', display: 'block', marginBottom: '3px' }}>HOW TO USE</span>
                                1. Click <b style={{ color: '#f0d080' }}>📱 QR</b> in the editor<br />
                                2. Drag the floating window anywhere<br />
                                3. Scan with OpenBot → <b style={{ color: '#4ddc64' }}>▶ Run</b>
                            </div>
                        </div>
                    )}
                </div>

                <div className="tut-div" />

                <div className="tut-foot">
                    <div className="tut-dots">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`tut-dot${i === idx ? ' on' : ''}`}
                                onClick={() => setIdx(i)}
                                title={`Step ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="tut-btns">
                        {idx > 0 && <button className="tut-skip" onClick={doPrev}>← Back</button>}
                        <button className="tut-skip" onClick={onClose}>Skip</button>
                        <button className="tut-next" onClick={doNext}>
                            {isLast ? 'Finish ✓' : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export const TutorialButton = ({ onClick }) => (
    <button
        onClick={onClick}
        title="Open interactive tutorial"
        style={{
            display: 'flex', alignItems: 'center', gap: '.45rem',
            padding: '.38rem .85rem',
            background: 'rgba(201,168,76,.07)',
            border: '1px solid rgba(201,168,76,.28)',
            borderRadius: '8px', color: '#c9a84c',
            fontFamily: "'Cinzel',serif",
            fontSize: '.65rem', fontWeight: 600, letterSpacing: '.06em',
            cursor: 'pointer', transition: 'all .18s',
            whiteSpace: 'nowrap', flexShrink: 0,
        }}
        onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(201,168,76,.18)';
            e.currentTarget.style.color = '#f0d080';
            e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(201,168,76,.07)';
            e.currentTarget.style.color = '#c9a84c';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <span style={{ fontSize: '.9rem' }}>?</span>
        Tutorial
    </button>
);

export default Tutorial;