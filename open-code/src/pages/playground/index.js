import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import BlocklyComponent from "../../components/blockly";
import { Toolbox } from "../../components/blockly/toolbox/Toolbox";
import { Header } from "../../components/navBar/header";
import { StoreContext } from "../../context/context";
import CodeEditor from "../../components/editor/codeEditor";
import * as ParserModule from '../../utils/parser';
import QrCode from '../../components/qrcode/qrcode';

// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const BACKEND = 'http://197.5.193.210:5000';
const STREAM_SCENE = 'http://197.5.193.210:8766/scene';

// ═══════════════════════════════════════════
// STARS CANVAS
// ═══════════════════════════════════════════
const COLS = ['#fff8e1', '#fde68a', '#f0d080', '#c9a84c', '#ffffff', '#fffde7', '#fcd34d'];
const STAR_DATA = Array.from({ length: 240 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 2.2 + 0.3,
    col: COLS[Math.floor(Math.random() * COLS.length)],
    op: Math.random() * 0.7 + 0.2,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * 0.02 + 0.004,
}));

const StarCanvas = () => {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        const stars = STAR_DATA.map(s => ({ ...s }));
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                s.tw += s.sp;
                const a = s.op * (0.25 + 0.75 * (Math.sin(s.tw) * 0.5 + 0.5));
                const x = s.x / 100 * canvas.width;
                const y = s.y / 100 * canvas.height;
                if (s.r > 1.7) {
                    const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 5);
                    g.addColorStop(0, s.col);
                    g.addColorStop(1, 'transparent');
                    ctx.globalAlpha = a * 0.18;
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(x, y, s.r * 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = a;
                ctx.fillStyle = s.col;
                ctx.beginPath();
                ctx.arc(x, y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);
    return (
        <canvas
            ref={ref}
            style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        />
    );
};

// ═══════════════════════════════════════════
// CSS GLOBAL
// ═══════════════════════════════════════════
const Styles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Nunito:wght@400;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        @keyframes goldShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes upulse      { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
        @keyframes ufloat      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        @keyframes udrift      { 0%,100%{transform:translate(0,0)} 50%{transform:translate(6px,-10px)} }
        @keyframes sandDrift   { 0%,100%{transform:translateX(0)} 50%{transform:translateX(12px)} }
        @keyframes orbPulse    { 0%,100%{box-shadow:0 0 30px rgba(201,168,76,.35),0 0 60px rgba(201,168,76,.12)} 50%{box-shadow:0 0 55px rgba(201,168,76,.7),0 0 110px rgba(201,168,76,.25)} }
        @keyframes hudPulse    { 0%,100%{opacity:.35} 50%{opacity:.9} }
        @keyframes blink       { 0%,100%{opacity:1} 50%{opacity:.1} }

        .gold-shimmer {
            background: linear-gradient(90deg,#c9a84c,#f0d080,#fff8e1,#f0d080,#c9a84c);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: goldShimmer 5s linear infinite;
        }

        /* Blockly transparent */
        .blocklyMainBackground      { fill: transparent !important; }
        .injectionDiv               { background: transparent !important; background-color: transparent !important; }
        svg.blocklySvg              { background: transparent !important; }
        .blocklyGrid path           { stroke: rgba(201,168,76,.06) !important; }
        .blocklyScrollbarHandle     { fill: rgba(201,168,76,.35) !important; }
        .blocklyScrollbarBackground { fill: rgba(201,168,76,.04) !important; }
        .blocklyFlyoutBackground    { fill: rgba(10,6,1,.9) !important; }
        .blocklyToolboxDiv          { background: linear-gradient(180deg,rgba(8,4,1,.88) 0%,rgba(5,2,0,.84) 100%) !important; border-right: 1px solid rgba(201,168,76,.18) !important; }
        .blocklyTreeLabel           { color: rgba(201,168,76,.7) !important; font-family: 'Nunito',sans-serif !important; font-weight: 800 !important; }
        .blocklyTreeRow:hover .blocklyTreeLabel { color: #f0d080 !important; }
        .blocklyTreeSelected .blocklyTreeLabel  { color: #f0d080 !important; }
        .blocklyTreeRow      { border-left: 2px solid transparent !important; transition: all .2s !important; }
        .blocklyTreeSelected { border-left-color: rgba(201,168,76,.6) !important; background: rgba(201,168,76,.08) !important; }

        /* Panel header */
        .panel-hdr {
            display: flex; align-items: center; justify-content: space-between;
            padding: .55rem 1rem; flex-shrink: 0;
            position: relative; overflow: hidden;
            background: linear-gradient(135deg,rgba(201,168,76,.07) 0%,rgba(6,3,0,.6) 50%,rgba(201,168,76,.03) 100%);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(201,168,76,.18);
        }
        .panel-hdr::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg,transparent,rgba(201,168,76,.6) 30%,rgba(240,208,80,.8) 50%,rgba(201,168,76,.6) 70%,transparent);
        }

        /* Buttons */
        .pb {
            font-family: 'Nunito',sans-serif; font-weight: 800; font-size: .65rem;
            padding: .25rem .75rem; border-radius: 5px; border: none;
            cursor: pointer; transition: all .2s; letter-spacing: .03em;
        }
        .pb:hover  { transform: translateY(-1px); filter: brightness(1.2); }
        .pb:active { transform: scale(.95); }
        .pb-gold  { background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.3) !important; color: #c9a84c; }
        .pb-green { background: rgba(77,220,100,.14); border: 1px solid rgba(77,220,100,.35) !important; color: #4ddc64; }

        /* WS input */
        .ws-input {
            flex: 1; background: rgba(4,2,0,.6); border: 1px solid rgba(201,168,76,.22) !important;
            border-radius: 6px; color: #e8d88a; padding: .36rem .75rem;
            font-family: 'Space Mono',monospace; font-size: .68rem;
            outline: none; backdrop-filter: blur(8px); transition: border-color .2s;
        }
        .ws-input:focus { border-color: rgba(201,168,76,.5) !important; }

        /* Connect button */
        .btn-connect {
            font-family: 'Cinzel',serif; font-size: .72rem; font-weight: 600;
            letter-spacing: .06em; padding: .34rem .95rem; border-radius: 5px;
            cursor: pointer;
            background: linear-gradient(135deg,#8a5500,#c9a84c,#f0d080,#c9a84c,#8a5500);
            background-size: 200% auto; animation: goldShimmer 4s linear infinite;
            color: #0a0400; white-space: nowrap; border: none;
            box-shadow: 0 2px 14px rgba(201,168,76,.3),inset 0 1px 0 rgba(255,255,255,.15);
            transition: all .2s;
        }
        .btn-connect:hover { transform: translateY(-1px); filter: brightness(1.1); }

        /* Gold divider */
        .gold-divider {
            width: 100%; height: 1px; flex-shrink: 0; position: relative;
            background: linear-gradient(90deg,transparent,rgba(201,168,76,.25),rgba(201,168,76,.4),rgba(201,168,76,.25),transparent);
        }
        .gold-divider::after {
            content: '◆'; position: absolute; left: 50%; top: 50%;
            transform: translate(-50%,-50%); font-size: .45rem;
            color: rgba(201,168,76,.6); background: rgba(6,3,0,.85); padding: 0 6px;
        }

        /* Status badge */
        .status-badge {
            display: flex; align-items: center; gap: .35rem;
            padding: .22rem .65rem; border-radius: 20px;
            font-family: 'Cinzel',serif; font-size: .6rem;
            letter-spacing: .06em; font-weight: 600; white-space: nowrap;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* Keyboard hints */
        .kbd-key {
            background: rgba(201,168,76,.1);
            border: 1px solid rgba(201,168,76,.28) !important;
            border-bottom: 2px solid rgba(201,168,76,.45) !important;
            border-radius: 5px; padding: 2px 6px;
            font-family: 'Space Mono',monospace; font-size: .48rem;
            color: #c9a84c; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,.4);
        }
        .kbd-lbl { font-size: .4rem; color: rgba(201,168,76,.38); }

        /* Log */
        .ws-log {
            font-size: .53rem; font-family: 'Space Mono',monospace;
            color: rgba(201,168,76,.55); text-align: center;
            padding: .16rem .55rem; background: rgba(2,1,0,.5);
            border: 1px solid rgba(201,168,76,.12) !important;
            border-radius: 6px; width: 100%; flex-shrink: 0;
        }

        /* Blockly scan lines */
        .ws-scan {
            position: absolute; inset: 0; pointer-events: none; z-index: 0;
            background: repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(201,168,76,.006) 30px,rgba(201,168,76,.006) 31px);
        }

        /* Camera frame */
        .cam-frame {
            width: 100%; flex: 1; position: relative; overflow: hidden;
            border-radius: 8px; border: 1px solid rgba(201,168,76,.2) !important;
            background: rgba(2,1,0,.7); min-height: 0;
            box-shadow: inset 0 0 40px rgba(0,0,0,.5),0 0 14px rgba(201,168,76,.04);
        }

        /* REC badge */
        .rec-badge {
            position: absolute; top: 8px; left: 9px; z-index: 3;
            display: flex; align-items: center; gap: 4px;
            background: rgba(0,0,0,.6); padding: 2px 8px;
            border-radius: 20px; backdrop-filter: blur(6px);
        }
        .rec-dot {
            width: 5px; height: 5px; border-radius: 50%;
            background: #ff3333; box-shadow: 0 0 6px #ff3333;
            animation: blink 1s ease-in-out infinite;
        }
        .rec-text {
            font-family: 'Space Mono',monospace; font-size: .48rem;
            color: rgba(255,255,255,.85); font-weight: 700; letter-spacing: .06em;
        }

        /* Cam label + fullscreen btn */
        .cam-label {
            position: absolute; top: 8px; right: 9px; z-index: 3;
            display: flex; align-items: center; gap: .4rem;
            background: rgba(0,0,0,.6); padding: 2px 6px 2px 9px;
            border-radius: 20px; backdrop-filter: blur(6px);
            border: 1px solid rgba(201,168,76,.18) !important;
        }
        .cam-label span { font-family: 'Cinzel',serif; font-size: .5rem; color: #c9a84c; letter-spacing: .06em; }
        .btn-fs {
            background: rgba(201,168,76,.15); border: 1px solid rgba(201,168,76,.4) !important;
            border-radius: 4px; color: #f0d080; cursor: pointer;
            font-size: .75rem; padding: 1px 6px; line-height: 1; transition: all .2s;
        }
        .btn-fs:hover { background: rgba(201,168,76,.3); }

        /* CRT scanlines overlay */
        .cam-crt {
            position: absolute; inset: 0; border-radius: 8px; pointer-events: none; z-index: 2;
            background: repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px);
        }

        /* HUD corners */
        .hud-corner {
            position: fixed; width: 30px; height: 30px;
            border-color: rgba(201,168,76,.65); border-style: solid; z-index: 3;
            animation: hudPulse 3s ease-in-out infinite; pointer-events: none;
        }

        /* Deco stars */
        .deco-star { position: fixed; z-index: 2; pointer-events: none; animation: upulse 3s ease-in-out infinite; color: #c9a84c; }

        /* ── Fullscreen overlay ── */
        .fs-overlay {
            position: fixed; inset: 0; z-index: 9999;
            background: #000;
            display: flex; align-items: center; justify-content: center;
        }
        .fs-overlay img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .fs-close-btn {
            position: absolute; top: 16px; right: 16px; z-index: 10000;
            background: rgba(201,168,76,.15); border: 1px solid rgba(201,168,76,.4);
            color: #f0d080; border-radius: 8px; padding: .4rem .9rem;
            font-family: 'Cinzel',serif; font-size: .75rem; font-weight: 600;
            letter-spacing: .06em; cursor: pointer; backdrop-filter: blur(8px);
            transition: all .2s;
        }
        .fs-close-btn:hover { background: rgba(201,168,76,.28); transform: scale(1.05); }
    `}</style>
);

// ═══════════════════════════════════════════
// PLAYGROUND
// ═══════════════════════════════════════════
function Playground() {
    const { category, setCategory, setCode, setGenerateCode } = useContext(StoreContext);

    const [simStatus, setSimStatus] = useState('offline');
    const [wsUrl, setWsUrl] = useState('ws://197.5.193.210:8765');
    const [wsLog, setWsLog] = useState('⏳ Démarrage de Webots…');
    const [showQr, setShowQr] = useState(false);
    const [isFs, setIsFs] = useState(false);

    const wsRef = useRef(null);
    const keysRef = useRef({});
    const reconnTimerRef = useRef(null);
    const userIdRef = useRef('user_' + Math.random().toString(36).slice(2, 8));
    const camRef = useRef(null);

    const G = (a) => `rgba(201,168,76,${a})`;
    const SC = simStatus === 'online' ? '#4ddc64' : simStatus === 'connecting' ? '#f0a500' : '#c9a84c';
    const SL = simStatus === 'online' ? 'CONNECTÉ' : simStatus === 'connecting' ? 'CONNEXION...' : 'OFFLINE';

    // ── Plein écran natif ──
    const toggleFs = () => {
        if (!isFs) {
            camRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };
    useEffect(() => {
        const fn = () => setIsFs(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', fn);
        return () => document.removeEventListener('fullscreenchange', fn);
    }, []);

    // ── Lancement Webots via backend ──
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const level = params.get('level') || '1';
        const userId = userIdRef.current;
        setWsLog('🚀 Lancement de Webots — niveau ' + level + '…');
        fetch(`${BACKEND}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, level }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.ok || data.message) setWsLog('✅ Webots lancé — connexion WS…');
                else setWsLog('⚠️ ' + (data.error || 'Erreur backend'));
            })
            .catch(() => setWsLog('⚠️ Backend non disponible'));

        return () => {
            fetch(`${BACKEND}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            }).catch(() => { });
        };
    }, []); // eslint-disable-line

    // ── WebSocket ──
    const connectWebots = useCallback(() => {
        if (reconnTimerRef.current) { clearTimeout(reconnTimerRef.current); reconnTimerRef.current = null; }
        if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }

        setSimStatus('connecting');
        setWsLog('🔄 Connexion en cours…');

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setSimStatus('online');
                setWsLog('✅ Connecté !');
                ParserModule.initParser(ws);
            };
            ws.onerror = () => {
                setSimStatus('offline');
                setWsLog('❌ Erreur connexion');
            };
            ws.onclose = () => {
                setSimStatus('offline');
                setWsLog('⚠️ Déconnecté — reconnexion dans 3s…');
                reconnTimerRef.current = setTimeout(() => connectWebots(), 3000);
            };
            ws.onmessage = (e) => {
                if (typeof e.data === 'string' && !e.data.startsWith('CAM:'))
                    setWsLog('📩 ' + e.data);
            };
        } catch (e) {
            setSimStatus('offline');
            setWsLog('❌ ' + e.message);
            reconnTimerRef.current = setTimeout(() => connectWebots(), 3000);
        }
    }, [wsUrl]); // eslint-disable-line

    useEffect(() => {
        const t = setTimeout(() => connectWebots(), 2000);
        return () => {
            clearTimeout(t);
            if (reconnTimerRef.current) clearTimeout(reconnTimerRef.current);
            if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
        };
    }, []); // eslint-disable-line

    // ── Clavier ──
    useEffect(() => {
        const km = {
            'ArrowUp': 'moveForward', 'ArrowDown': 'moveBackward',
            'ArrowLeft': 'turnLeft', 'ArrowRight': 'turnRight',
            'z': 'moveForward', 'Z': 'moveForward',
            's': 'moveBackward', 'S': 'moveBackward',
            'q': 'turnLeft', 'Q': 'turnLeft',
            'd': 'turnRight', 'D': 'turnRight',
            ' ': 'stop',
        };
        const dn = (e) => {
            if (keysRef.current[e.key]) return;
            keysRef.current[e.key] = true;
            const c = km[e.key];
            if (c) { e.preventDefault(); sendCmd(c); }
        };
        const up = (e) => {
            keysRef.current[e.key] = false;
            const c = km[e.key];
            if (c && c !== 'stop') sendCmd('stop');
        };
        // Escape ferme le fullscreen overlay custom (si utilisé)
        const esc = (e) => { if (e.key === 'Escape') setIsFs(false); };
        window.addEventListener('keydown', dn);
        window.addEventListener('keyup', up);
        window.addEventListener('keydown', esc);
        return () => {
            window.removeEventListener('keydown', dn);
            window.removeEventListener('keyup', up);
            window.removeEventListener('keydown', esc);
        };
    }); // eslint-disable-line

    const sendCmd = (cmd) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(cmd);
            setWsLog('✅ ' + cmd);
        } else {
            setWsLog('❌ Non connecté !');
        }
    };

    // ── Run Blockly ──
    const handleRun = () => {
        try {
            const B = require('blockly/core');
            const { javascriptGenerator: J } = require('blockly/javascript');
            ParserModule.runBlocklyCode(J.workspaceToCode(B.getMainWorkspace()));
            setWsLog('▶ Programme lancé !');
        } catch (e) {
            const c = window.__currentPythonCode || '';
            if (c) ParserModule.runBlocklyCode(c);
        }
    };

    // ── QR Code ──
    const handleQR = () => {
        try {
            const B = require('blockly/core');
            const { javascriptGenerator: J } = require('blockly/javascript');
            const jsCode = J.workspaceToCode(B.getMainWorkspace());
            const commands = [];
            for (const line of jsCode.split('\n')) {
                const l = line.trim();
                const m = l.match(/\((\d+\.?\d*)\)/);
                const s = m ? parseFloat(m[1]) / 255 : 0.75;
                if (l.startsWith('moveForward')) commands.push({ l: +s.toFixed(2), r: +s.toFixed(2), d: 1000 });
                else if (l.startsWith('moveBackward')) commands.push({ l: -+s.toFixed(2), r: -+s.toFixed(2), d: 1000 });
                else if (l.startsWith('moveLeft') || l.startsWith('turnLeft')) commands.push({ l: 0, r: +s.toFixed(2), d: 600 });
                else if (l.startsWith('moveRight') || l.startsWith('turnRight')) commands.push({ l: +s.toFixed(2), r: 0, d: 600 });
                else if (l.startsWith('wait') && commands.length > 0) {
                    const w = l.match(/\((\d+)\)/);
                    if (w) commands[commands.length - 1].d = parseInt(w[1]);
                }
            }
            if (!commands.length) { alert('Aucun bloc de mouvement !'); return; }
            setCode({ cm: commands });
            setGenerateCode(p => !p);
            setShowQr(true);
            setWsLog('📱 QR généré — ' + commands.length + ' cmd');
        } catch (e) {
            alert('Erreur : ' + e.message);
        }
    };

    const ispy = category === 'py';

    // ── Décoration ──
    const HUD_CORNERS = [
        { top: '16px', left: '16px', borderWidth: '1.5px 0 0 1.5px', animationDelay: '0s' },
        { top: '16px', right: '16px', borderWidth: '1.5px 1.5px 0 0', animationDelay: '.6s' },
        { bottom: '16px', left: '16px', borderWidth: '0 0 1.5px 1.5px', animationDelay: '1.2s' },
        { bottom: '16px', right: '16px', borderWidth: '0 1.5px 1.5px 0', animationDelay: '1.8s' },
    ];
    const DECO_STARS = [
        { top: '14%', left: '28%', fontSize: '1.3rem', animationDelay: '0s', icon: '✨' },
        { top: '70%', left: '62%', fontSize: '1.2rem', animationDelay: '1.2s', icon: '⭐' },
        { top: '32%', left: '83%', fontSize: '1.4rem', animationDelay: '2.4s', icon: '💫' },
        { top: '80%', left: '22%', fontSize: '1.2rem', animationDelay: '3s', icon: '🌟' },
    ];

    return (
        <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', fontFamily: "'Nunito',sans-serif" }}>
            <Styles />
            <StarCanvas />

            {/* ── BACKGROUND ── */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                background: `
                    radial-gradient(ellipse at 50% 105%, rgba(180,90,0,.6)    0%, transparent 48%),
                    radial-gradient(ellipse at 12%  58%, rgba(201,168,76,.1)  0%, transparent 44%),
                    radial-gradient(ellipse at 88%  18%, rgba(40,20,80,.28)   0%, transparent 44%),
                    #030108
                `,
            }} />
            <div style={{ position: 'fixed', top: '-8%', left: '-4%', width: '680px', height: '680px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,.1) 0%,transparent 70%)', filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', top: '-4%', right: '-4%', width: '580px', height: '580px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(80,40,160,.18) 0%,transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-4%', left: '18%', width: '960px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,100,0,.35) 0%,transparent 70%)', filter: 'blur(110px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`, backgroundSize: '260px 260px', opacity: .08 }} />

            {/* Moon */}
            <div style={{ position: 'fixed', top: '4%', right: '3%', zIndex: 2, pointerEvents: 'none', animation: 'ufloat 11s ease-in-out infinite' }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%,#fff8e1,#f0d080,#a86c00)', animation: 'orbPulse 4s ease-in-out infinite', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-16px', left: '-16px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(201,168,76,.2)' }} />
                    <div style={{ position: 'absolute', top: '-26px', left: '-26px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(201,168,76,.1)' }} />
                </div>
            </div>

            {/* Camel */}
            <div style={{ position: 'fixed', top: '60%', left: '1.5%', fontSize: '2.6rem', zIndex: 2, pointerEvents: 'none', animation: 'udrift 9s ease-in-out infinite', filter: 'drop-shadow(0 0 14px rgba(201,168,76,.6))' }}>🐪</div>

            {/* Sand dunes */}
            <svg style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '200px', zIndex: 1, pointerEvents: 'none', animation: 'sandDrift 18s ease-in-out infinite' }} viewBox="0 0 1440 200" preserveAspectRatio="none">
                <path d="M0,145 C200,82 380,158 570,108 C750,62 930,150 1110,98 C1230,64 1370,120 1440,88 L1440,200 L0,200 Z" fill="rgba(201,168,76,.1)" />
                <path d="M0,145 C200,82 380,158 570,108 C750,62 930,150 1110,98 C1230,64 1370,120 1440,88" stroke="rgba(201,168,76,.22)" strokeWidth="1.2" fill="none" />
                <path d="M0,168 C320,135 540,172 790,152 C990,136 1180,168 1440,148 L1440,200 L0,200 Z" fill="rgba(180,80,0,.13)" />
            </svg>

            {/* HUD corners */}
            {HUD_CORNERS.map((s, i) => <div key={i} className="hud-corner" style={s} />)}

            {/* Deco stars */}
            {DECO_STARS.map(({ icon, ...s }, i) => (
                <div key={i} className="deco-star" style={s}>{icon}</div>
            ))}

            {/* ══ FULLSCREEN OVERLAY ══ */}
            {isFs && (
                <div className="fs-overlay">
                    <img
                        src={STREAM_SCENE + '?t=' + Date.now()}
                        alt="Vue Scène — Plein écran"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={() => setWsLog('⚠️ Stream non disponible')}
                    />
                    <button className="fs-close-btn" onClick={toggleFs}>✕ Fermer</button>
                </div>
            )}

            {/* ══ APP LAYOUT ══ */}
            <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                    {/* ── BLOCKLY ZONE ── */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <div className="ws-scan" />
                        <BlocklyComponent
                            readOnly={false}
                            move={{ scrollbars: true, drag: true, wheel: true }}
                            initialXml={`<xml xmlns="http://www.w3.org/1999/xhtml"><Block type="start" x="0" y="100"/><Block type="forever" x="250" y="100"/></xml>`}
                        >
                            <Toolbox />
                        </BlocklyComponent>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div style={{
                        width: '44%', flexShrink: 0,
                        display: 'flex', flexDirection: 'column',
                        background: 'linear-gradient(180deg,rgba(8,4,1,.78) 0%,rgba(6,3,0,.74) 50%,rgba(10,5,1,.78) 100%)',
                        backdropFilter: 'blur(18px) saturate(140%)',
                        borderLeft: `1px solid ${G(.28)}`,
                        minHeight: 0,
                        boxShadow: `-2px 0 40px rgba(0,0,0,.5),inset 1px 0 0 ${G(.05)}`,
                    }}>

                        {/* ─ CODE PANEL ─ */}
                        <div style={{ flex: '0 0 36%', display: 'flex', flexDirection: 'column', borderBottom: `1px solid ${G(.18)}`, overflow: 'hidden', minHeight: 0 }}>
                            <div className="panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem', filter: `drop-shadow(0 0 6px ${ispy ? 'rgba(52,211,153,.6)' : G(.9)})` }}>
                                        {ispy ? '🐍' : '⚡'}
                                    </span>
                                    <span className="gold-shimmer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.8rem', fontWeight: '600', letterSpacing: '.1em' }}>
                                        {ispy ? 'CODE PYTHON' : 'CODE JAVASCRIPT'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '.3rem' }}>
                                    <button className="pb pb-gold" onClick={() => setCategory(ispy ? 'js' : 'py')}>{ispy ? '⚡ JS' : '🐍 PY'}</button>
                                    <button className="pb pb-green" onClick={handleRun}>▶ Run</button>
                                    <button className="pb pb-gold" onClick={handleQR}>📱 QR</button>
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(2,1,0,.32)' }}>
                                <CodeEditor />
                            </div>
                        </div>

                        {/* ─ SIMULATEUR PANEL ─ */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

                            {/* Header simulateur */}
                            <div className="panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem', filter: `drop-shadow(0 0 8px ${G(.9)})` }}>🤖</span>
                                    <span className="gold-shimmer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.8rem', fontWeight: '600', letterSpacing: '.1em' }}>
                                        SIMULATEUR ROBOT
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.38rem' }}>
                                    {showQr && (
                                        <button className="pb pb-gold" style={{ fontSize: '.58rem' }} onClick={() => setShowQr(false)}>
                                            ✕ QR
                                        </button>
                                    )}
                                    <div
                                        className="status-badge"
                                        style={{ background: `${SC}14`, border: `1px solid ${SC}44`, color: SC, cursor: simStatus !== 'online' ? 'pointer' : 'default' }}
                                        onClick={simStatus !== 'online' ? connectWebots : undefined}
                                        title={simStatus !== 'online' ? 'Cliquer pour reconnecter' : ''}
                                    >
                                        <div className="status-dot" style={{ background: SC, boxShadow: `0 0 6px ${SC}` }} />
                                        {SL}
                                    </div>
                                </div>
                            </div>

                            {/* Body simulateur */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.45rem .55rem', background: 'rgba(3,1,0,.22)', minHeight: 0, overflow: 'hidden' }}>

                                {/* WS input + Connect */}
                                <div style={{ display: 'flex', gap: '.4rem', width: '100%', flexShrink: 0 }}>
                                    <input
                                        className="ws-input"
                                        value={wsUrl}
                                        onChange={e => setWsUrl(e.target.value)}
                                        placeholder="ws://197.5.193.210:8765"
                                    />
                                    <button className="btn-connect" onClick={connectWebots}>Connecter</button>
                                </div>

                                <div className="gold-divider" />

                                {/* QR ou Stream */}
                                {showQr ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.8rem', width: '100%' }}>
                                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.76rem', color: '#c9a84c', letterSpacing: '.1em' }}>
                                            📱 Scanner avec OpenBot
                                        </div>
                                        <div style={{ background: 'white', borderRadius: '12px', padding: '10px', boxShadow: `0 0 35px ${G(.4)}` }}>
                                            <QrCode />
                                        </div>
                                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '.5rem', color: G(.35) }}>
                                            Appuie sur ⊡ dans l'app puis scanne
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Camera frame ── */
                                    <div ref={camRef} className="cam-frame">
                                        {/* REC */}
                                        <div className="rec-badge">
                                            <div className="rec-dot" />
                                            <span className="rec-text">REC</span>
                                        </div>

                                        {/* Label + fullscreen btn */}
                                        <div className="cam-label">
                                            <span>🎬 Vue Scène</span>
                                            <button className="btn-fs" onClick={toggleFs} title="Plein écran">
                                                {isFs ? '✕' : '⛶'}
                                            </button>
                                        </div>

                                        {/* CRT overlay */}
                                        <div className="cam-crt" />

                                        {/* MJPEG stream */}
                                        <img
                                            src={STREAM_SCENE}
                                            alt="Vue Scène"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '8px' }}
                                            onError={() => setWsLog('⚠️ Stream scène non disponible')}
                                        />
                                    </div>
                                )}

                                {/* Log */}
                                <div className="ws-log">{wsLog}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Playground;