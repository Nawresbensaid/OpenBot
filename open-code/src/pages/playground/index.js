import React, { useState, useRef, useContext } from 'react';
import BlocklyComponent from "../../components/blockly";
import { Toolbox } from "../../components/blockly/toolbox/Toolbox";
import { Header } from "../../components/navBar/header";
import { StoreContext } from "../../context/context";
import CodeEditor from "../../components/editor/codeEditor";
import * as ParserModule from '../../utils/parser';
import QrCode from '../../components/qrcode/qrcode';

// ── Canvas étoiles ──
const COLS = ['#ffffff', '#fffde7', '#6cbefd', '#b39ddb', '#f48fb1', '#a5d6a7', '#fcd34d'];
const STAR_DATA = Array.from({ length: 320 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 2.8 + .3,
    col: COLS[Math.floor(Math.random() * COLS.length)],
    op: Math.random() * .75 + .2,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * .022 + .005,
}));

const StarCanvas = () => {
    const ref = useRef(null);
    React.useEffect(() => {
        const canvas = ref.current; if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize(); window.addEventListener('resize', resize);
        const stars = STAR_DATA.map(s => ({ ...s }));
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                s.tw += s.sp;
                const a = s.op * (0.25 + 0.75 * (Math.sin(s.tw) * .5 + .5));
                const x = s.x / 100 * canvas.width, y = s.y / 100 * canvas.height;
                if (s.r > 1.9) {
                    const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 4.5);
                    g.addColorStop(0, s.col); g.addColorStop(1, 'transparent');
                    ctx.globalAlpha = a * .18; ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(x, y, s.r * 4.5, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = a; ctx.fillStyle = s.col;
                ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
};

const SPACE_OBJECTS = [
    { id: 0, emoji: '🛸', top: '30%', left: '6%', anim: 'ufloat2', dur: '8s', delay: '0s', size: '2.5rem' },
    { id: 1, emoji: '☄️', top: '15%', left: '45%', anim: 'ufloat', dur: '6s', delay: '1s', size: '2rem' },
    { id: 2, emoji: '🛸', top: '70%', left: '55%', anim: 'ufloat2', dur: '9s', delay: '2s', size: '2.2rem' },
    { id: 3, emoji: '🌙', top: '10%', left: '70%', anim: 'ufloat', dur: '7s', delay: '0.5s', size: '2rem' },
    { id: 4, emoji: '🛰️', top: '55%', left: '25%', anim: 'udrift', dur: '10s', delay: '1.5s', size: '1.8rem' },
    { id: 5, emoji: '💎', top: '80%', left: '40%', anim: 'ufloat2', dur: '5s', delay: '3s', size: '1.5rem' },
    { id: 6, emoji: '🌠', top: '40%', left: '60%', anim: 'ufloat', dur: '7s', delay: '2.5s', size: '1.6rem' },
];

const UniversBG = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        <style>{`
            @keyframes ufloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(5deg)}}
            @keyframes ufloat2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(-4deg)}}
            @keyframes urocket{0%,100%{transform:translateY(0) rotate(-12deg) scale(1)}50%{transform:translateY(-28px) rotate(8deg) scale(1.05)}}
            @keyframes uorbit{from{transform:rotate(0deg) translateX(55px) rotate(0deg)}to{transform:rotate(360deg) translateX(55px) rotate(-360deg)}}
            @keyframes udrift{0%,100%{transform:translate(0,0)}25%{transform:translate(10px,-8px)}50%{transform:translate(0,-15px)}75%{transform:translate(-10px,-8px)}}
            @keyframes upulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
            @keyframes ublink{0%,100%{opacity:1}50%{opacity:.15}}
        `}</style>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, #0d1b4b 0%, #030714 45%, #000008 100%)', zIndex: 0 }} />
        {[
            { t: '-8%', r: '8%', w: '520px', h: '520px', bg: 'rgba(167,139,250,.14)' },
            { t: 'auto', b: '8%', l: '3%', w: '640px', h: '440px', bg: 'rgba(20,80,200,.18)' },
            { t: '38%', r: '33%', w: '320px', h: '320px', bg: 'rgba(244,114,182,.09)' },
            { t: '15%', l: '30%', w: '280px', h: '280px', bg: 'rgba(52,211,153,.06)' },
        ].map((n, i) => (
            <div key={i} style={{ position: 'absolute', top: n.t, bottom: n.b, right: n.r, left: n.l, width: n.w, height: n.h, background: `radial-gradient(circle,${n.bg} 0%,transparent 70%)`, borderRadius: '50%', filter: 'blur(65px)' }} />
        ))}
        <div style={{ position: 'absolute', top: '5%', right: '2%', animation: 'ufloat 10s ease-in-out infinite' }}>
            <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%, #fef3c7, #d97706, #92400e)', boxShadow: '0 0 35px rgba(251,191,36,.4)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '145px', height: '32px', border: '6px solid rgba(251,191,36,.38)', borderRadius: '50%', transform: 'translate(-50%,-50%) rotateX(65deg)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8', marginTop: '-6px', marginLeft: '-6px', animation: 'uorbit 6s linear infinite' }} />
            </div>
        </div>
        <div style={{ position: 'absolute', bottom: '11%', left: '.5%', animation: 'ufloat2 12s 2s ease-in-out infinite' }}>
            <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #67e8f9, #0284c7, #1e3a5f)', boxShadow: '0 0 25px rgba(103,232,249,.4)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', width: '22px', height: '16px', top: '15px', left: '10px', borderRadius: '50%', background: 'rgba(74,222,128,.5)', transform: 'rotate(-20deg)' }} />
            </div>
        </div>
        <div style={{ position: 'absolute', top: '48%', right: '.5%', animation: 'ufloat 8s 1s ease-in-out infinite' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fca5a5, #dc2626, #7f1d1d)', boxShadow: '0 0 18px rgba(252,165,165,.35)' }} />
        </div>
        <div style={{ position: 'absolute', top: '20%', left: '3%', animation: 'ufloat2 7s .5s ease-in-out infinite' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ddd6fe, #7c3aed, #3b0764)', boxShadow: '0 0 14px rgba(167,139,250,.4)' }} />
        </div>
        <div style={{ position: 'absolute', top: '65%', left: '2%', fontSize: '3.2rem', animation: 'urocket 7s ease-in-out infinite', filter: 'drop-shadow(0 0 14px rgba(108,190,255,.65))' }}>🚀</div>
        {[{ t: '17%', l: '27%', d: '0s', e: '✨' }, { t: '72%', l: '60%', d: '1.2s', e: '⭐' }, { t: '35%', l: '88%', d: '2.4s', e: '💫' }, { t: '82%', l: '22%', d: '3s', e: '🌟' }].map((p, i) => (
            <div key={i} style={{ position: 'absolute', top: p.t, left: p.l, fontSize: '1.3rem', animation: `upulse 3s ${p.d} ease-in-out infinite` }}>{p.e}</div>
        ))}
        {SPACE_OBJECTS.map(o => (
            <div key={o.id} style={{ position: 'absolute', top: o.top, left: o.left, fontSize: o.size, animation: `${o.anim} ${o.dur} ${o.delay} ease-in-out infinite`, filter: 'drop-shadow(0 0 8px rgba(108,190,255,0.4))' }}>{o.emoji}</div>
        ))}
    </div>
);

const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        .robo-panel-hdr{display:flex;align-items:center;justify-content:space-between;padding:.55rem 1rem;background:rgba(2,5,16,.75);border-bottom:1px solid rgba(108,190,255,.1);flex-shrink:0;position:relative}
        .robo-panel-hdr::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(108,190,255,.3),transparent)}
        .robo-cb{width:40px;height:40px;border-radius:10px;border:1px solid rgba(108,190,255,.22);cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:all .15s;background:rgba(108,190,255,.1);color:#c8ddf0}
        .robo-cb:hover{background:rgba(108,190,255,.25)!important;transform:scale(1.1)}
        .robo-cb:active{transform:scale(.93)!important}
        .robo-pb{font-family:'Nunito',sans-serif;font-weight:800;font-size:.7rem;padding:.28rem .8rem;border-radius:20px;border:none;cursor:pointer;transition:all .2s}
        .robo-pb:hover{transform:translateY(-1px)}
        .ws-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 25px,rgba(108,190,255,.015) 25px,rgba(108,190,255,.015) 26px);pointer-events:none}
    `}</style>
);

function Playground() {
    const { category, setCategory, setCode, setGenerateCode } = useContext(StoreContext);
    const [simStatus, setSimStatus] = useState('offline');
    const [wsUrl, setWsUrl] = useState('ws://192.168.1.189:1234');
    const [wsLog, setWsLog] = useState('');
    const [camFrame, setCamFrame] = useState(null);
    const [showQr, setShowQr] = useState(false);
    const wsRef = useRef(null);
    const keysRef = useRef({});

    React.useEffect(() => {
        const keyMap = {
            'ArrowUp': 'move_forward', 'ArrowDown': 'move_backward',
            'ArrowLeft': 'turn_left', 'ArrowRight': 'turn_right',
            'z': 'move_forward', 'Z': 'move_forward',
            's': 'move_backward', 'S': 'move_backward',
            'q': 'turn_left', 'Q': 'turn_left',
            'd': 'turn_right', 'D': 'turn_right',
            ' ': 'stop',
        };
        const onKeyDown = (e) => {
            if (keysRef.current[e.key]) return;
            keysRef.current[e.key] = true;
            const cmd = keyMap[e.key];
            if (cmd) { e.preventDefault(); sendCmd(cmd); }
        };
        const onKeyUp = (e) => {
            keysRef.current[e.key] = false;
            if (keyMap[e.key] && keyMap[e.key] !== 'stop') sendCmd('stop');
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }); // eslint-disable-line react-hooks/exhaustive-deps

    const sendCmd = (cmd) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(cmd);
            setWsLog('✅ ' + cmd);
        } else {
            setWsLog('❌ Non connecté !');
        }
    };

    const connectWebots = () => {
        setSimStatus('connecting');
        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            ws.onopen = () => {
                setSimStatus('online');
                setWsLog('✅ Connecté !');
                ParserModule.initParser(ws);
            };
            ws.onerror = () => { setSimStatus('offline'); setWsLog('❌ Erreur'); };
            ws.onclose = () => { setSimStatus('offline'); setWsLog('⚠️ Déconnecté'); setCamFrame(null); };
            ws.onmessage = (e) => {
                if (typeof e.data === 'string' && e.data.startsWith('CAM:')) {
                    setCamFrame('data:image/jpeg;base64,' + e.data.substring(4));
                    return;
                }
                try {
                    const msg = JSON.parse(e.data);
                    if (msg.type === 'camera') { setCamFrame('data:image/png;base64,' + msg.data); return; }
                } catch (_) { }
                setWsLog('📩 ' + e.data);
            };
        } catch (e) { setSimStatus('offline'); setWsLog('❌ ' + e.message); }
    };

    const handleRun = () => {
        try {
            console.log("▶ Run cliqué !");
            const Blockly = require('blockly/core');
            const { javascriptGenerator } = require('blockly/javascript');
            const workspace = Blockly.getMainWorkspace();
            const code = javascriptGenerator.workspaceToCode(workspace);
            console.log("=== CODE JS ===\n", code);
            ParserModule.runBlocklyCode(code);
        } catch (e) {
            console.error("❌ Erreur Run:", e);
            const code = window.__currentPythonCode || '';
            console.log("=== FALLBACK ===\n", code);
            if (code) ParserModule.runBlocklyCode(code);
        }
    };

    const handleQR = () => {
        try {
            const Blockly = require('blockly/core');
            const { javascriptGenerator } = require('blockly/javascript');
            const workspace = Blockly.getMainWorkspace();
            const jsCode = javascriptGenerator.workspaceToCode(workspace);

            const commands = [];
            const lines = jsCode.split('\n');

            for (const line of lines) {
                const l = line.trim();
                if (l.startsWith('moveForward')) {
                    const m = l.match(/\((\d+\.?\d*)\)/);
                    const speed = m ? parseFloat(m[1]) / 255 : 0.75;
                    commands.push({ left: +speed.toFixed(2), right: +speed.toFixed(2), duration: 1000 });
                } else if (l.startsWith('moveBackward')) {
                    const m = l.match(/\((\d+\.?\d*)\)/);
                    const speed = m ? parseFloat(m[1]) / 255 : 0.75;
                    commands.push({ left: -+speed.toFixed(2), right: -+speed.toFixed(2), duration: 1000 });
                } else if (l.startsWith('moveLeft') || l.startsWith('turnLeft')) {
                    const m = l.match(/\((\d+\.?\d*)\)/);
                    const speed = m ? parseFloat(m[1]) / 255 : 0.75;
                    commands.push({ left: 0, right: +speed.toFixed(2), duration: 600 });
                } else if (l.startsWith('moveRight') || l.startsWith('turnRight')) {
                    const m = l.match(/\((\d+\.?\d*)\)/);
                    const speed = m ? parseFloat(m[1]) / 255 : 0.75;
                    commands.push({ left: +speed.toFixed(2), right: 0, duration: 600 });
                } else if (l.startsWith('wait') && commands.length > 0) {
                    const m = l.match(/\((\d+)\)/);
                    if (m) commands[commands.length - 1].duration = parseInt(m[1]);
                }
            }

            if (commands.length === 0) {
                alert('Aucun bloc de mouvement détecté ! Ajoute des blocs move dans Blockly.');
                return;
            }

            setCode({ path: commands });
            setGenerateCode(prev => !prev);
            setShowQr(true);
            setWsLog('📱 QR Code généré — ' + commands.length + ' commande(s)');
        } catch (e) {
            console.error('❌ Erreur QR:', e);
            alert('Erreur : ' + e.message);
        }
    };

    const ispy = category === 'py';
    const statusColor = simStatus === 'online' ? '#4ddc64' : simStatus === 'connecting' ? '#f0a500' : '#ff4444';
    const statusLabel = simStatus === 'online' ? 'CONNECTÉ' : simStatus === 'connecting' ? 'CONNEXION...' : 'OFFLINE';

    const S = {
        root: { position: 'relative', height: '100vh', overflow: 'hidden', fontFamily: "'Nunito',sans-serif" },
        overlay: { position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column' },
        main: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
        left: { flex: 1, position: 'relative', overflow: 'hidden' },
        right: { width: '42%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(108,190,255,.18)', background: 'rgba(4,9,28,.82)', backdropFilter: 'blur(20px)', minHeight: 0 },
        pyPanel: { flex: '0 0 35%', display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(108,190,255,.15)', overflow: 'hidden', minHeight: 0 },
        simPanel: { flex: '0 0 65%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 },
        simBody: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '.35rem', padding: '.4rem .5rem', background: 'rgba(2,5,16,.32)', minHeight: 0, overflow: 'hidden' },
        simTitle: { fontFamily: "'Fredoka One',cursive", fontSize: '.9rem', letterSpacing: '.08em', background: 'linear-gradient(90deg,#fbbf24,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    };

    const btnConn = { fontFamily: "'Fredoka One',cursive", fontSize: '.82rem', padding: '.35rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg,#6cbefd,#a78bfa)', color: 'white', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(108,190,255,.28)', transition: 'all .2s' };
    const wsInput = { flex: 1, background: 'rgba(2,5,16,.7)', border: '1px solid rgba(108,190,255,.2)', borderRadius: '8px', color: '#c8ddf0', padding: '.35rem .7rem', fontFamily: "'Space Mono',monospace", fontSize: '.73rem', outline: 'none' };

    return (
        <div style={S.root}>
            <GlobalStyles />
            <StarCanvas />
            <UniversBG />
            <div style={S.overlay}>
                <Header />
                <div style={S.main}>
                    <div style={S.left}>
                        <div className="ws-scan" style={{ zIndex: 1 }} />
                        <BlocklyComponent
                            readOnly={false}
                            move={{ scrollbars: true, drag: true, wheel: true }}
                            initialXml={`<xml xmlns="http://www.w3.org/1999/xhtml">
                                <Block type="start" x="0" y="100"/>
                                <Block type="forever" x="250" y="100"/>
                            </xml>`}
                        >
                            <Toolbox />
                        </BlocklyComponent>
                    </div>

                    <div style={S.right}>
                        <div style={S.pyPanel}>
                            <div className="robo-panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{ispy ? '🐍' : '⚡'}</span>
                                    <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.88rem', letterSpacing: '.08em', color: ispy ? '#a5f3d0' : '#fcd34d' }}>
                                        {ispy ? 'CODE PYTHON' : 'CODE JAVASCRIPT'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '.35rem' }}>
                                    <button className="robo-pb"
                                        style={{ background: ispy ? 'rgba(251,191,36,.15)' : 'rgba(52,211,153,.15)', border: ispy ? '1px solid rgba(251,191,36,.3)' : '1px solid rgba(52,211,153,.3)', color: ispy ? '#fbbf24' : '#34d399' }}
                                        onClick={() => setCategory(ispy ? 'js' : 'py')}>
                                        {ispy ? '⚡ JS' : '🐍 PY'}
                                    </button>
                                    <button
                                        id="run-btn"
                                        className="robo-pb"
                                        style={{ background: 'rgba(77,220,100,.15)', border: '1px solid rgba(77,220,100,.3)', color: '#4ddc64' }}
                                        onClick={handleRun}>
                                        ▶ Run
                                    </button>
                                    <button
                                        className="robo-pb"
                                        style={{ background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', color: '#fbbf24' }}
                                        onClick={handleQR}>
                                        📱 QR
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                <CodeEditor />
                            </div>
                        </div>

                        <div style={S.simPanel}>
                            <div className="robo-panel-hdr">
                                <span style={S.simTitle}>🤖 SIMULATEUR ROBOT</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    {showQr && (
                                        <button
                                            className="robo-pb"
                                            style={{ background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', color: '#fbbf24', fontSize: '.6rem' }}
                                            onClick={() => setShowQr(false)}>
                                            ✕ QR
                                        </button>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.25rem .75rem', borderRadius: '20px', background: `rgba(${simStatus === 'online' ? '77,220,100' : simStatus === 'connecting' ? '240,165,0' : '255,68,68'},.1)`, border: `1px solid ${statusColor}44` }}>
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                                        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.72rem', color: statusColor }}>{statusLabel}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={S.simBody}>
                                <div style={{ display: 'flex', gap: '.4rem', width: '100%', flexShrink: 0 }}>
                                    <input style={wsInput} value={wsUrl} onChange={e => setWsUrl(e.target.value)} placeholder="ws://localhost:1234" />
                                    <button style={btnConn} onClick={connectWebots}>Connecter</button>
                                </div>

                                {showQr ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%' }}>
                                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.8rem', color: '#fbbf24', letterSpacing: '.05em' }}>
                                            📱 Scanner avec l'app OpenBot
                                        </div>
                                        <div style={{ background: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 0 30px rgba(251,191,36,0.3)' }}>
                                            <QrCode />
                                        </div>
                                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '.52rem', color: 'rgba(200,221,240,.4)', textAlign: 'center' }}>
                                            Appuie sur ⊡ dans l'app puis scanne
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '10px', border: '1px solid rgba(108,190,255,0.18)', background: 'rgba(2,5,16,0.7)', minHeight: 0 }}>
                                        <div style={{ position: 'absolute', top: '7px', left: '8px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '2px 7px', borderRadius: '20px' }}>
                                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 5px #ff4444', animation: 'ublink 1s ease-in-out infinite' }} />
                                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.52rem', color: 'rgba(255,255,255,.75)', fontWeight: 'bold' }}>REC</span>
                                        </div>
                                        <div style={{ position: 'absolute', top: '7px', right: '8px', zIndex: 3, background: 'rgba(0,0,0,0.5)', padding: '2px 7px', borderRadius: '20px' }}>
                                            <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.58rem', color: 'rgba(108,190,255,.9)' }}>📷 CAM ROBOT</span>
                                        </div>
                                        {camFrame ? (
                                            <img src={camFrame} alt="cam" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', imageRendering: 'crisp-edges' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                                                <span style={{ fontSize: '2.2rem' }}>📷</span>
                                                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: '.7rem', color: 'rgba(200,221,240,.35)' }}>EN ATTENTE DE CONNEXION</span>
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)', pointerEvents: 'none', zIndex: 2 }} />
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', flexShrink: 0, padding: '.2rem 0' }}>
                                    {[
                                        { k: '↑ / Z', label: 'Avancer' },
                                        { k: '↓ / S', label: 'Reculer' },
                                        { k: '← / Q', label: 'Gauche' },
                                        { k: '→ / D', label: 'Droite' },
                                        { k: 'Espace', label: 'Stop' },
                                    ].map(({ k, label }) => (
                                        <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <div style={{ background: 'rgba(108,190,255,.12)', border: '1px solid rgba(108,190,255,.25)', borderRadius: '5px', padding: '2px 6px', fontFamily: "'Space Mono',monospace", fontSize: '.55rem', color: '#6cbefd', whiteSpace: 'nowrap' }}>{k}</div>
                                            <span style={{ fontSize: '.48rem', color: 'rgba(200,221,240,.35)', fontFamily: "'Nunito',sans-serif" }}>{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {wsLog ? (
                                    <div style={{ fontSize: '.58rem', fontFamily: "'Space Mono',monospace", color: 'rgba(200,221,240,.45)', textAlign: 'center', padding: '.15rem .5rem', background: 'rgba(2,5,16,.4)', borderRadius: '6px', width: '100%', flexShrink: 0 }}>
                                        {wsLog}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Playground;