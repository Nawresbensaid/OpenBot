import React, { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════
// TUTORIAL COMPONENT — NomadVerse Playground
// ═══════════════════════════════════════════

const STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to NomadVerse! 🤖',
        desc: 'Here you program your robot with blocks, see the generated code in real time, and send it directly to your physical robot. This guide covers 6 key areas.',
        icon: '🌟',
        target: null,
        position: 'center',
        highlight: null,
    },
    {
        id: 'toolbox',
        title: 'Block Library',
        desc: 'Click a category (Control, Movement, Loops, Sensors…) to show its blocks. Drag any block onto the canvas to start programming your robot.',
        icon: '🧩',
        target: '.blocklyToolboxDiv',
        position: 'right',
        highlight: { label: 'Block categories' },
    },
    {
        id: 'canvas',
        title: 'Programming Canvas',
        desc: 'Assemble your blocks here to build your robot\'s logic. The "start" and "forever" blocks are the entry points. JS(JavaScript) and PY(Python) code is generated automatically on the right.',
        icon: '🎨',
        // Canvas step: spotlight the toolbox area to avoid overflow, card forced to center-right
        target: '.injectionDiv',
        position: 'canvas', // custom position handled below
        highlight: { label: 'Block canvas' },
    },
    {
        id: 'editor',
        title: 'Code Editor + QR',
        desc: 'The code from your blocks appears here in JavaScript or Python (PY button). Click ▶ Run to test it, or 📱 QR to generate a scannable code for the OpenBot app.',
        icon: '⚡',
        target: '[data-tut="editor"]',
        position: 'left',
        highlight: { label: 'Code editor' },
    },
    {
        id: 'simulator',
        title: 'Robot Simulator',
        desc: 'Connect your robot via WebSocket (ws://…) or use the live video feed to watch the scene. Click ⛶ to open the scene view in a floating window.',
        icon: '🤖',
        target: '[data-tut="simulator"]',
        position: 'left',
        highlight: { label: 'Robot simulator' },
    },
    {
        id: 'upload',
        title: 'Upload Code → Robot',
        desc: 'When your program is ready, click Upload Code to compile and send it to Google Drive. A QR code appears automatically — scan it from the OpenBot app to run the program on your robot!',
        icon: '⬆',
        target: '[data-tut="upload"]',
        position: 'top',
        highlight: { label: 'Upload Code' },
    },
];

// ── CSS injected once ──
const TutStyles = () => (
    <style>{`
        @keyframes tutFadeIn  { from{opacity:0;transform:scale(.93) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes tutSlideR  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes tutSlideL  { from{opacity:0;transform:translateX(14px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes tutSlideU  { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes tutPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.5)} 50%{box-shadow:0 0 0 6px rgba(201,168,76,0)} }
        @keyframes tutGlow    { 0%,100%{border-color:rgba(201,168,76,.5)} 50%{border-color:rgba(240,208,80,.95)} }
        @keyframes tutScan    { 0%{top:0} 100%{top:calc(100% - 2px)} }
        @keyframes tutShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes tutIconSpin{ 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(8deg) scale(1.12)} 100%{transform:rotate(0deg) scale(1)} }

        .tut-overlay {
            position: fixed; inset: 0; z-index: 99998;
            pointer-events: all;
        }
        .tut-backdrop {
            position: absolute; inset: 0;
            background: rgba(3,1,0,.78);
            backdrop-filter: blur(2px);
        }
        .tut-spotlight {
            position: fixed;
            border-radius: 10px;
            box-shadow: 0 0 0 9999px rgba(3,1,0,.78);
            border: 1.5px solid rgba(201,168,76,.8);
            animation: tutGlow 2s ease-in-out infinite;
            pointer-events: none;
            transition: all .42s cubic-bezier(.4,0,.2,1);
            z-index: 99999;
        }
        .tut-spotlight::after {
            content: '';
            position: absolute; left: 4px; right: 4px; height: 2px;
            background: linear-gradient(90deg,transparent,rgba(201,168,76,.9),transparent);
            animation: tutScan 2.2s ease-in-out infinite;
            border-radius: 1px;
        }
        .tut-card {
            position: fixed;
            width: 292px;
            background: linear-gradient(145deg,rgba(14,7,0,.97) 0%,rgba(8,4,0,.99) 100%);
            border: 1px solid rgba(201,168,76,.45);
            border-radius: 14px;
            padding: 0;
            z-index: 100000;
            box-shadow:
                0 0 0 1px rgba(0,0,0,.9),
                0 16px 60px rgba(0,0,0,.85),
                0 0 50px rgba(201,168,76,.12),
                inset 0 1px 0 rgba(201,168,76,.18);
            overflow: hidden;
        }
        .tut-card.anim-center { animation: tutFadeIn .28s cubic-bezier(.4,0,.2,1); }
        .tut-card.anim-right  { animation: tutSlideR .28s cubic-bezier(.4,0,.2,1); }
        .tut-card.anim-left   { animation: tutSlideL .28s cubic-bezier(.4,0,.2,1); }
        .tut-card.anim-top    { animation: tutSlideU .28s cubic-bezier(.4,0,.2,1); }
        .tut-card.anim-canvas { animation: tutFadeIn .28s cubic-bezier(.4,0,.2,1); }

        .tut-card-header {
            position: relative; overflow: hidden;
            padding: .7rem 1rem .55rem;
            background: linear-gradient(135deg,rgba(201,168,76,.1) 0%,rgba(8,4,1,.7) 50%,rgba(201,168,76,.05) 100%);
            border-bottom: 1px solid rgba(201,168,76,.18);
        }
        .tut-card-header::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg,transparent,rgba(240,208,80,.7) 40%,rgba(201,168,76,.5) 60%,transparent);
        }
        .tut-icon {
            font-size: 1.5rem;
            animation: tutIconSpin 4s ease-in-out infinite;
            display: inline-block;
        }
        .tut-title {
            font-family: 'Cinzel', serif;
            font-size: .78rem; font-weight: 600;
            letter-spacing: .06em;
            background: linear-gradient(90deg,#c9a84c,#f0d080,#fff8e1,#f0d080,#c9a84c);
            background-size: 200% auto;
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: tutShimmer 4s linear infinite;
        }
        .tut-step-label {
            font-family: 'Space Mono', monospace;
            font-size: .46rem; color: rgba(201,168,76,.45);
            letter-spacing: .08em; margin-top: 2px;
        }
        .tut-body { padding: .8rem 1rem .65rem; }
        .tut-desc {
            font-family: 'Nunito', sans-serif;
            font-size: .72rem; font-weight: 400;
            color: rgba(224,200,140,.8);
            line-height: 1.65;
        }
        .tut-divider {
            height: 1px; margin: 0 1rem;
            background: linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent);
        }
        .tut-footer {
            display: flex; align-items: center; justify-content: space-between;
            padding: .55rem 1rem .65rem;
        }
        .tut-dots { display: flex; gap: 5px; align-items: center; }
        .tut-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: rgba(201,168,76,.18);
            border: 1px solid rgba(201,168,76,.25);
            transition: all .25s; cursor: pointer;
        }
        .tut-dot.active {
            background: #c9a84c;
            box-shadow: 0 0 6px rgba(201,168,76,.6);
            width: 16px; border-radius: 3px;
            animation: tutPulse 1.8s ease-in-out infinite;
        }
        .tut-dot:hover:not(.active) { background: rgba(201,168,76,.4); }

        .tut-btns { display: flex; gap: .4rem; align-items: center; }

        .tut-btn-skip {
            background: transparent;
            border: 1px solid rgba(201,168,76,.15);
            border-radius: 6px;
            color: rgba(201,168,76,.35);
            font-family: 'Nunito', sans-serif;
            font-size: .6rem; font-weight: 700;
            padding: .28rem .65rem;
            cursor: pointer; transition: all .18s;
            letter-spacing: .04em;
        }
        .tut-btn-skip:hover { color: rgba(201,168,76,.65); border-color: rgba(201,168,76,.3); background: rgba(201,168,76,.06); }

        .tut-btn-next {
            background: linear-gradient(105deg,#7a4500 0%,#c9a84c 30%,#f5e070 50%,#c9a84c 70%,#7a4500 100%);
            background-size: 200% auto;
            animation: tutShimmer 3s linear infinite;
            border: none; border-radius: 6px;
            color: #0a0400;
            font-family: 'Cinzel', serif;
            font-size: .62rem; font-weight: 700;
            padding: .3rem .85rem; cursor: pointer;
            letter-spacing: .06em;
            box-shadow: 0 2px 12px rgba(201,168,76,.3), inset 0 1px 0 rgba(255,255,255,.2);
            transition: transform .15s, filter .15s;
        }
        .tut-btn-next:hover { transform: translateY(-1px) scale(1.04); filter: brightness(1.1); }
        .tut-btn-next:active { transform: scale(.96); }

        .tut-highlight-label {
            position: absolute;
            bottom: calc(100% + 6px); left: 50%;
            transform: translateX(-50%);
            background: rgba(201,168,76,.15);
            border: 1px solid rgba(201,168,76,.4);
            border-radius: 20px; padding: 2px 10px;
            font-family: 'Space Mono', monospace;
            font-size: .44rem; color: #c9a84c;
            white-space: nowrap; pointer-events: none;
            letter-spacing: .05em;
        }

        .tut-arrow { position: fixed; width: 0; height: 0; pointer-events: none; z-index: 99999; }
        .tut-arrow-right { border-top: 9px solid transparent; border-bottom: 9px solid transparent; border-right: 10px solid rgba(201,168,76,.6); }
        .tut-arrow-left  { border-top: 9px solid transparent; border-bottom: 9px solid transparent; border-left:  10px solid rgba(201,168,76,.6); }
        .tut-arrow-up    { border-left: 9px solid transparent; border-right: 9px solid transparent; border-bottom: 10px solid rgba(201,168,76,.6); }
    `}</style>
);

// ── Compute card position ──
function computeCardPos(position, targetRect, cardW = 292, cardH = 240) {
    const GAP = 18;
    const vw = window.innerWidth, vh = window.innerHeight;
    let top, left;

    // Step 3 special case: canvas takes up most of the screen width
    // Force card to appear in the center of the visible area
    if (position === 'canvas') {
        // Place card in center of the right portion of the screen (over the code panel area)
        left = Math.max(vw / 2 - cardW / 2, vw - 500);
        left = Math.min(left, vw - cardW - 16);
        top = vh / 2 - cardH / 2;
        return { top, left, arrow: null };
    }

    if (!targetRect || position === 'center') {
        top = vh / 2 - cardH / 2;
        left = vw / 2 - cardW / 2;
        return { top, left, arrow: null };
    }

    const { top: ty, left: tx, width: tw, height: th } = targetRect;
    const centerY = ty + th / 2;
    const centerX = tx + tw / 2;

    if (position === 'right') {
        left = tx + tw + GAP;
        top = Math.max(12, Math.min(vh - cardH - 12, centerY - cardH / 2));
        if (left + cardW > vw - 12) { left = Math.max(12, tx - cardW - GAP); }
        return { top, left, arrow: { pos: 'right', top: centerY, left: tx + tw + GAP - 12 } };
    }
    if (position === 'left') {
        left = tx - cardW - GAP;
        top = Math.max(12, Math.min(vh - cardH - 12, centerY - cardH / 2));
        if (left < 12) { left = tx + tw + GAP; }
        return { top, left, arrow: { pos: 'left', top: centerY, left: tx - GAP + 2 } };
    }
    if (position === 'top') {
        top = ty - cardH - GAP;
        left = Math.max(12, Math.min(vw - cardW - 12, centerX - cardW / 2));
        if (top < 12) top = ty + th + GAP;
        return { top, left, arrow: { pos: 'up', top: ty - GAP + 2, left: centerX } };
    }
    top = ty + th + GAP;
    left = Math.max(12, Math.min(vw - cardW - 12, centerX - cardW / 2));
    return { top, left, arrow: null };
}

// ── Main Tutorial component ──
export const Tutorial = ({ onClose }) => {
    const [stepIdx, setStepIdx] = useState(0);
    const [spotRect, setSpotRect] = useState(null);
    const [cardPos, setCardPos] = useState({ top: 0, left: 0, arrow: null });
    const [animKey, setAnimKey] = useState(0);
    const rafRef = useRef(null);

    const step = STEPS[stepIdx];
    const isLast = stepIdx === STEPS.length - 1;

    const measureTarget = useCallback((s) => {
        if (!s.target) {
            setSpotRect(null);
            setCardPos(computeCardPos('center', null));
            return;
        }
        const el = document.querySelector(s.target);
        if (!el) {
            setSpotRect(null);
            setCardPos(computeCardPos('center', null));
            return;
        }
        const r = el.getBoundingClientRect();
        setSpotRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
        setCardPos(computeCardPos(s.position, r));
    }, []);

    useEffect(() => {
        measureTarget(step);
        setAnimKey(k => k + 1);
        rafRef.current = setTimeout(() => measureTarget(step), 350);
        return () => clearTimeout(rafRef.current);
    }, [stepIdx, step, measureTarget]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = e => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); handleNext(); }
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }); // intentional — always captures latest state

    const handleNext = () => { if (isLast) { onClose(); return; } setStepIdx(i => i + 1); };
    const handlePrev = () => { if (stepIdx > 0) setStepIdx(i => i - 1); };
    const goTo = (i) => setStepIdx(i);

    const { arrow } = cardPos;
    const animClass = step.position === 'canvas' ? 'anim-canvas'
        : step.position === 'center' ? 'anim-center'
            : step.position === 'right' ? 'anim-right'
                : step.position === 'left' ? 'anim-left'
                    : 'anim-top';

    return (
        <>
            <TutStyles />
            <div className="tut-overlay">
                {/* Backdrop */}
                <div className="tut-backdrop" onClick={onClose} />

                {/* Spotlight */}
                {spotRect && (
                    <div
                        className="tut-spotlight"
                        style={{ top: spotRect.top, left: spotRect.left, width: spotRect.width, height: spotRect.height }}
                    >
                        {step.highlight?.label && (
                            <div className="tut-highlight-label">{step.highlight.label}</div>
                        )}
                    </div>
                )}

                {/* Directional arrow */}
                {arrow?.pos === 'right' && <div className="tut-arrow tut-arrow-right" style={{ top: arrow.top - 9, left: arrow.left }} />}
                {arrow?.pos === 'left' && <div className="tut-arrow tut-arrow-left" style={{ top: arrow.top - 9, left: arrow.left }} />}
                {arrow?.pos === 'up' && <div className="tut-arrow tut-arrow-up" style={{ top: arrow.top, left: arrow.left - 9 }} />}

                {/* Tutorial card */}
                <div
                    key={animKey}
                    className={`tut-card ${animClass}`}
                    style={{ top: cardPos.top, left: cardPos.left }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="tut-card-header">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.55rem' }}>
                            <div className="tut-icon">{step.icon}</div>
                            <div>
                                <div className="tut-title">{step.title}</div>
                                <div className="tut-step-label">STEP {stepIdx + 1} / {STEPS.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="tut-body">
                        <p className="tut-desc">{step.desc}</p>
                    </div>

                    <div className="tut-divider" />

                    {/* Footer */}
                    <div className="tut-footer">
                        <div className="tut-dots">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`tut-dot${i === stepIdx ? ' active' : ''}`}
                                    onClick={() => goTo(i)}
                                    title={`Step ${i + 1}`}
                                />
                            ))}
                        </div>
                        <div className="tut-btns">
                            {stepIdx > 0 && (
                                <button className="tut-btn-skip" onClick={handlePrev}>← Back</button>
                            )}
                            <button className="tut-btn-skip" onClick={onClose}>Skip</button>
                            <button className="tut-btn-next" onClick={handleNext}>
                                {isLast ? 'Finish ✓' : 'Next →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ── Tutorial button (place in bottom bar) ──
export const TutorialButton = ({ onClick }) => (
    <button
        onClick={onClick}
        title="Open interactive tutorial"
        style={{
            display: 'flex', alignItems: 'center', gap: '.45rem',
            padding: '.38rem .85rem',
            background: 'rgba(201,168,76,.07)',
            border: '1px solid rgba(201,168,76,.28)',
            borderRadius: '8px',
            color: '#c9a84c',
            fontFamily: "'Cinzel',serif",
            fontSize: '.65rem', fontWeight: 600,
            letterSpacing: '.06em',
            cursor: 'pointer',
            transition: 'all .18s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
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