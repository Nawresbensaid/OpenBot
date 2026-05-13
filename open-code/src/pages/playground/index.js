import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import BlocklyComponent from "../../components/blockly";
import { Toolbox } from "../../components/blockly/toolbox/Toolbox";
import { Header } from "../../components/navBar/header";
import { StoreContext } from "../../context/context";
import CodeEditor from "../../components/editor/codeEditor";
import * as ParserModule from '../../utils/parser';
import { Tutorial, TutorialButton } from './Tutorial';

import { javascriptGenerator } from 'blockly/javascript';
import { uploadToGoogleDrive } from '../../services/googleDrive';
import { getCurrentProject, handleChildBlockInWorkspace } from '../../services/workspace';
import { aiBlocks, Constants, Errors, errorToast, PlaygroundConstants } from '../../utils/constants';

const BACKEND = 'http://197.5.193.210:5000';
const STREAM_SCENE = 'http://197.5.193.210:8766/scene';

const COLS = ['#fff8e1', '#fde68a', '#f0d080', '#c9a84c', '#ffffff', '#fffde7', '#fcd34d'];
const STAR_DATA = Array.from({ length: 240 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 2.2 + 0.3,
    col: COLS[Math.floor(Math.random() * COLS.length)],
    op: Math.random() * 0.7 + 0.2,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * 0.02 + 0.004,
}));

const StarCanvas = () => {
    const ref = useRef(null);
    useEffect(() => {
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
                const a = s.op * (0.25 + 0.75 * (Math.sin(s.tw) * 0.5 + 0.5));
                const x = s.x / 100 * canvas.width, y = s.y / 100 * canvas.height;
                if (s.r > 1.7) {
                    const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 5);
                    g.addColorStop(0, s.col); g.addColorStop(1, 'transparent');
                    ctx.globalAlpha = a * 0.18; ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(x, y, s.r * 5, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = a; ctx.fillStyle = s.col;
                ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1; raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
};

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
        @keyframes winFadeIn   { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes uploadGlow  { 0%,100%{box-shadow:0 0 16px rgba(201,168,76,.3),0 4px 20px rgba(0,0,0,.55)} 50%{box-shadow:0 0 36px rgba(201,168,76,.65),0 4px 28px rgba(0,0,0,.55)} }
        @keyframes uploadSpin  { to{transform:rotate(360deg)} }
        @keyframes successPop  { 0%{transform:scale(1)} 40%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes progressFlow{ 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes qrPulse     { 0%,100%{box-shadow:0 0 20px rgba(201,168,76,.3)} 50%{box-shadow:0 0 45px rgba(201,168,76,.7),0 0 80px rgba(201,168,76,.2)} }
        @keyframes scanLine    { 0%{top:8px} 100%{top:calc(100% - 8px)} }
        @keyframes qrGenPop    { 0%{opacity:0;transform:scale(.88)} 100%{opacity:1;transform:scale(1)} }

        .gold-shimmer {
            background: linear-gradient(90deg,#c9a84c,#f0d080,#fff8e1,#f0d080,#c9a84c);
            background-size: 200% auto; -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; background-clip: text;
            animation: goldShimmer 5s linear infinite;
        }

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

        .panel-hdr {
            display:flex; align-items:center; justify-content:space-between;
            padding:.55rem 1rem; flex-shrink:0; position:relative; overflow:hidden;
            background: linear-gradient(135deg,rgba(201,168,76,.07) 0%,rgba(6,3,0,.6) 50%,rgba(201,168,76,.03) 100%);
            backdrop-filter: blur(12px); border-bottom: 1px solid rgba(201,168,76,.18);
        }
        .panel-hdr::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg,transparent,rgba(201,168,76,.6) 30%,rgba(240,208,80,.8) 50%,rgba(201,168,76,.6) 70%,transparent); }

        .pb { font-family:'Nunito',sans-serif; font-weight:800; font-size:.65rem; padding:.25rem .75rem; border-radius:5px; border:none; cursor:pointer; transition:all .2s; letter-spacing:.03em; }
        .pb:hover  { transform:translateY(-1px); filter:brightness(1.2); }
        .pb:active { transform:scale(.95); }
        .pb-gold  { background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.3) !important; color:#c9a84c; }
        .pb-green { background:rgba(77,220,100,.14); border:1px solid rgba(77,220,100,.35) !important; color:#4ddc64; }
        .pb-qr    { background:rgba(201,168,76,.15); border:1px solid rgba(201,168,76,.45) !important; color:#f0d080; font-size:.6rem; padding:.22rem .6rem; }

        .ws-input { flex:1; background:rgba(4,2,0,.6); border:1px solid rgba(201,168,76,.22) !important; border-radius:6px; color:#e8d88a; padding:.36rem .75rem; font-family:'Space Mono',monospace; font-size:.68rem; outline:none; backdrop-filter:blur(8px); transition:border-color .2s; }
        .ws-input:focus { border-color:rgba(201,168,76,.5) !important; }

        .btn-connect { font-family:'Cinzel',serif; font-size:.72rem; font-weight:600; letter-spacing:.06em; padding:.34rem .95rem; border-radius:5px; cursor:pointer; background: linear-gradient(135deg,#8a5500,#c9a84c,#f0d080,#c9a84c,#8a5500); background-size:200% auto; animation:goldShimmer 4s linear infinite; color:#0a0400; white-space:nowrap; border:none; box-shadow:0 2px 14px rgba(201,168,76,.3),inset 0 1px 0 rgba(255,255,255,.15); transition:all .2s; }
        .btn-connect:hover { transform:translateY(-1px); filter:brightness(1.1); }

        .gold-divider { width:100%; height:1px; flex-shrink:0; position:relative; background: linear-gradient(90deg,transparent,rgba(201,168,76,.25),rgba(201,168,76,.4),rgba(201,168,76,.25),transparent); }
        .gold-divider::after { content:'◆'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:.45rem; color:rgba(201,168,76,.6); background:rgba(6,3,0,.85); padding:0 6px; }

        .status-badge { display:flex; align-items:center; gap:.35rem; padding:.22rem .65rem; border-radius:20px; font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.06em; font-weight:600; white-space:nowrap; }
        .status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        .ws-log { font-size:.53rem; font-family:'Space Mono',monospace; color:rgba(201,168,76,.55); text-align:center; padding:.16rem .55rem; background:rgba(2,1,0,.5); border:1px solid rgba(201,168,76,.12) !important; border-radius:6px; width:100%; flex-shrink:0; }
        .ws-scan { position:absolute; inset:0; pointer-events:none; z-index:0; background:repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(201,168,76,.006) 30px,rgba(201,168,76,.006) 31px); }

        .cam-frame { width:100%; flex:1; position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(201,168,76,.2) !important; background:rgba(2,1,0,.7); min-height:0; box-shadow:inset 0 0 40px rgba(0,0,0,.5),0 0 14px rgba(201,168,76,.04); }
        .rec-badge { position:absolute; top:8px; left:9px; z-index:3; display:flex; align-items:center; gap:4px; background:rgba(0,0,0,.6); padding:2px 8px; border-radius:20px; backdrop-filter:blur(6px); }
        .rec-dot   { width:5px; height:5px; border-radius:50%; background:#ff3333; box-shadow:0 0 6px #ff3333; animation:blink 1s ease-in-out infinite; }
        .rec-text  { font-family:'Space Mono',monospace; font-size:.48rem; color:rgba(255,255,255,.85); font-weight:700; letter-spacing:.06em; }
        .cam-label { position:absolute; top:8px; right:9px; z-index:3; display:flex; align-items:center; gap:.4rem; background:rgba(0,0,0,.6); padding:2px 6px 2px 9px; border-radius:20px; backdrop-filter:blur(6px); border:1px solid rgba(201,168,76,.18) !important; }
        .cam-label span { font-family:'Cinzel',serif; font-size:.5rem; color:#c9a84c; letter-spacing:.06em; }
        .btn-fs { background:rgba(201,168,76,.15); border:1px solid rgba(201,168,76,.4) !important; border-radius:4px; color:#f0d080; cursor:pointer; font-size:.75rem; padding:1px 6px; line-height:1; transition:all .2s; }
        .btn-fs:hover { background:rgba(201,168,76,.3); }
        .cam-crt { position:absolute; inset:0; border-radius:8px; pointer-events:none; z-index:2; background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px); }

        .hud-corner { position:fixed; width:30px; height:30px; border-color:rgba(201,168,76,.65); border-style:solid; z-index:3; animation:hudPulse 3s ease-in-out infinite; pointer-events:none; }
        .deco-star  { position:fixed; z-index:2; pointer-events:none; animation:upulse 3s ease-in-out infinite; color:#c9a84c; }

        /* Floating window */
        .float-win { position:fixed; z-index:9999; display:flex; flex-direction:column; border-radius:10px; overflow:hidden; border:1px solid rgba(201,168,76,.45); box-shadow:0 0 0 1px rgba(0,0,0,.8),0 12px 60px rgba(0,0,0,.85),0 0 40px rgba(201,168,76,.1),inset 0 1px 0 rgba(201,168,76,.15); background:#050200; animation:winFadeIn .18s ease-out; }
        .float-win-titlebar { display:flex; align-items:center; justify-content:space-between; padding:.38rem .7rem; cursor:grab; flex-shrink:0; background:linear-gradient(135deg,rgba(201,168,76,.14) 0%,rgba(8,4,1,.95) 60%,rgba(201,168,76,.06) 100%); border-bottom:1px solid rgba(201,168,76,.22); user-select:none; position:relative; }
        .float-win-titlebar::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.5) 30%,rgba(240,208,80,.7) 50%,rgba(201,168,76,.5) 70%,transparent); }
        .float-win-titlebar:active { cursor:grabbing; }
        .float-win-btns { display:flex; align-items:center; gap:7px; }
        .float-win-btn { width:22px; height:22px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.7rem; line-height:1; transition:all .18s; position:relative; }
        .float-win-btn:hover { transform:scale(1.18); filter:brightness(1.25); }
        .float-win-btn:active { transform:scale(.9); }
        .float-win-btn::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 7px); left:50%; transform:translateX(-50%) scale(.85); opacity:0; pointer-events:none; transition:all .15s; background:rgba(6,3,0,.92); color:#f0d080; font-family:'Nunito',sans-serif; font-size:.52rem; font-weight:800; white-space:nowrap; padding:3px 8px; border-radius:6px; border:1px solid rgba(201,168,76,.3); box-shadow:0 4px 12px rgba(0,0,0,.6); }
        .float-win-btn:hover::after { opacity:1; transform:translateX(-50%) scale(1); }
        .float-win-btn-close { background:#ff5f57; box-shadow:0 0 8px rgba(255,95,87,.5); color:rgba(120,0,0,0); }
        .float-win-btn-close:hover { color:rgba(120,0,0,.85); }
        .float-win-btn-min  { background:#f0a500; box-shadow:0 0 8px rgba(240,165,0,.5); color:rgba(100,60,0,0); }
        .float-win-btn-min:hover { color:rgba(100,60,0,.85); }
        .float-win-btn-max  { background:#4ddc64; box-shadow:0 0 8px rgba(77,220,100,.5); color:rgba(0,80,0,0); }
        .float-win-btn-max:hover { color:rgba(0,80,0,.85); }
        .float-win-resize { position:absolute; bottom:0; right:0; width:20px; height:20px; cursor:nwse-resize; z-index:5; }
        .float-win-resize::before { content:''; position:absolute; bottom:3px; right:3px; width:10px; height:10px; border-right:2px solid rgba(201,168,76,.5); border-bottom:2px solid rgba(201,168,76,.5); border-radius:0 0 3px 0; }

        /* Bottom bar */
        .nomad-bottombar { flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:.5rem 1.2rem; background:linear-gradient(180deg,rgba(5,2,0,.95) 0%,rgba(3,1,0,.98) 100%); border-top:1px solid rgba(201,168,76,.25); backdrop-filter:blur(20px); position:relative; z-index:20; gap:1rem; }
        .nomad-bottombar::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.55) 20%,rgba(240,208,80,.9) 50%,rgba(201,168,76,.55) 80%,transparent); }

        /* Upload button */
        .nomad-upload-btn { position:relative; display:flex; align-items:center; gap:.6rem; padding:.5rem 1.5rem .5rem 1.15rem; border:none; border-radius:10px; cursor:pointer; font-family:'Cinzel',serif; font-size:.75rem; font-weight:700; letter-spacing:.1em; color:#1a0900; background:linear-gradient(105deg,#7a4500 0%,#c9a84c 30%,#f5e070 50%,#c9a84c 70%,#7a4500 100%); background-size:200% auto; animation:goldShimmer 3s linear infinite,uploadGlow 2.8s ease-in-out infinite; box-shadow:0 0 16px rgba(201,168,76,.3),0 4px 20px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.3),inset 0 -1px 0 rgba(0,0,0,.2); transition:transform .18s,filter .18s; overflow:hidden; white-space:nowrap; min-width:170px; user-select:none; }
        .nomad-upload-btn:hover:not(:disabled) { transform:translateY(-2px) scale(1.03); filter:brightness(1.1); }
        .nomad-upload-btn:active:not(:disabled) { transform:translateY(0) scale(.97); }
        .nomad-upload-btn:disabled { cursor:not-allowed; filter:saturate(.4) brightness(.7); animation:none; }
        .nomad-upload-btn::before { content:''; position:absolute; top:0; left:-120%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent); transition:left .55s ease; pointer-events:none; border-radius:10px; }
        .nomad-upload-btn:hover::before { left:180%; }
        .nomad-upload-btn::after { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent); }
        .nomad-upload-btn.is-success { background:linear-gradient(105deg,#0d3d1a 0%,#1e7a38 30%,#4ddc70 50%,#1e7a38 70%,#0d3d1a 100%); animation:successPop .35s ease; color:#001a08; }
        .nomad-upload-btn.is-error { background:linear-gradient(105deg,#3d0d0d 0%,#9b2020 30%,#e05050 50%,#9b2020 70%,#3d0d0d 100%); color:#1a0000; animation:none; }
        .nu-icon { width:22px; height:22px; border-radius:6px; flex-shrink:0; background:rgba(0,0,0,.2); border:1px solid rgba(0,0,0,.15); display:flex; align-items:center; justify-content:center; font-size:.85rem; box-shadow:inset 0 1px 0 rgba(255,255,255,.15); }
        .nu-icon.spin { animation:uploadSpin .7s linear infinite; }
        .nu-progress { position:absolute; bottom:0; left:0; height:3px; border-radius:0 0 10px 10px; background:linear-gradient(90deg,rgba(255,255,255,.5),rgba(255,255,255,.9),rgba(255,255,255,.5)); background-size:200% 100%; animation:progressFlow .8s linear infinite; transition:width .25s ease; }

        .nomad-tool-btn { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:rgba(201,168,76,.06); border:1px solid rgba(201,168,76,.2) !important; color:#c9a84c; cursor:pointer; font-size:.95rem; transition:all .18s; flex-shrink:0; }
        .nomad-tool-btn:hover  { background:rgba(201,168,76,.18); color:#f0d080; transform:translateY(-1px); }
        .nomad-tool-btn:active { transform:scale(.9); }
        .nomad-kbd { background:rgba(201,168,76,.09); border:1px solid rgba(201,168,76,.28); border-bottom:2px solid rgba(201,168,76,.45); border-radius:5px; padding:1px 6px; font-family:'Space Mono',monospace; font-size:.46rem; color:#c9a84c; box-shadow:0 2px 5px rgba(0,0,0,.4); }

        .btn-qr-standalone {
            display:flex; align-items:center; gap:.45rem;
            padding:.42rem 1rem; border-radius:8px; border:none; cursor:pointer;
            font-family:'Cinzel',serif; font-size:.68rem; font-weight:700; letter-spacing:.07em;
            color:#0a0400;
            background:linear-gradient(105deg,#7a4500 0%,#c9a84c 40%,#f5e070 55%,#c9a84c 70%,#7a4500 100%);
            background-size:200% auto;
            animation:goldShimmer 3.5s linear infinite;
            box-shadow:0 0 12px rgba(201,168,76,.25),0 3px 14px rgba(0,0,0,.5);
            transition:transform .18s,filter .18s;
            white-space:nowrap; flex-shrink:0;
        }
        .btn-qr-standalone:hover { transform:translateY(-2px) scale(1.04); filter:brightness(1.12); }
        .btn-qr-standalone:active { transform:scale(.96); }

        .qr-inline-panel {
            flex-shrink:0; display:flex; flex-direction:column; align-items:center;
            gap:.5rem; padding:.6rem .7rem;
            background:rgba(2,1,0,.55); border-top:1px solid rgba(201,168,76,.18);
            animation:qrGenPop .22s ease-out;
        }
        .qr-canvas-wrap {
            background:#fff; border-radius:8px; padding:8px;
            animation:qrPulse 2.5s ease-in-out infinite;
            position:relative; overflow:hidden;
        }
        .qr-scan-line {
            position:absolute; left:8px; right:8px; height:2px;
            background:linear-gradient(90deg,transparent,rgba(201,168,76,.9),transparent);
            animation:scanLine 2s ease-in-out infinite;
            pointer-events:none; border-radius:1px;
        }
        .qr-action-row { display:flex; gap:.4rem; width:100%; }
        .qr-action-btn {
            flex:1; padding:.28rem 0; border-radius:5px; border:1px solid rgba(201,168,76,.3);
            background:rgba(201,168,76,.07); color:#c9a84c; cursor:pointer;
            font-family:'Cinzel',serif; font-size:.52rem; font-weight:600; letter-spacing:.05em;
            transition:all .18s;
        }
        .qr-action-btn:hover { background:rgba(201,168,76,.18); color:#f0d080; }
        .qr-step {
            display:flex; align-items:center; gap:.4rem; width:100%;
            padding:.18rem .45rem; border-radius:5px;
            background:rgba(201,168,76,.04); border:1px solid rgba(201,168,76,.1);
        }
        .qr-step-n {
            width:16px; height:16px; border-radius:50%; flex-shrink:0;
            background:rgba(201,168,76,.15); border:1px solid rgba(201,168,76,.4);
            display:flex; align-items:center; justify-content:center;
            font-family:'Cinzel',serif; font-size:.46rem; color:#c9a84c;
        }
        .qr-step-t { font-family:'Space Mono',monospace; font-size:.42rem; color:rgba(201,168,76,.65); }
        .qr-err { font-family:'Space Mono',monospace; font-size:.5rem; color:#ef4444;
            background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.25);
            border-radius:5px; padding:.3rem .6rem; text-align:center; width:100%; }
        .qr-bar-track { width:100%; height:3px; background:rgba(201,168,76,.1); border-radius:2px; overflow:hidden; }
        .qr-bar-fill  { height:100%; border-radius:2px; transition:width .3s,background .3s; }
    `}</style>
);

// ═══════════════════════════════════════════
// QR PANEL
// ═══════════════════════════════════════════
const QrInlinePanel = ({ code, onClose }) => {
    const canvasRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [err, setErr] = useState('');
    const [downloaded, setDownloaded] = useState(false);
    const MAX = 2953;

    const payload = code.trim();
    const pct = Math.min(100, Math.round((payload.length / MAX) * 100));
    const over = payload.length > MAX;

    const loadLib = () => new Promise((res, rej) => {
        if (window.QRCode) return res();
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
    });

    useEffect(() => {
        if (!payload || over) { setErr(over ? `Code trop long (${payload.length}/${MAX} chars). Simplifie les blocs.` : 'Aucun code à encoder.'); return; }
        setErr(''); setReady(false);
        loadLib().then(() => {
            const tmp = document.createElement('div');
            tmp.style.display = 'none';
            document.body.appendChild(tmp);
            try {
                new window.QRCode(tmp, { text: payload, width: 200, height: 200, correctLevel: window.QRCode.CorrectLevel.M });
                setTimeout(() => {
                    const canvas = canvasRef.current; if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 200, 200);
                    const src = tmp.querySelector('canvas') || tmp.querySelector('img');
                    const draw = (el) => { ctx.drawImage(el, 0, 0, 200, 200); setReady(true); document.body.removeChild(tmp); };
                    if (src?.tagName === 'CANVAS') { draw(src); }
                    else if (src) { const i = new Image(); i.onload = () => draw(i); i.src = src.src; }
                }, 150);
            } catch (e) { setErr('Erreur QR : ' + e.message); document.body.removeChild(tmp); }
        }).catch(() => setErr('Impossible de charger la librairie QR.'));
    }, [payload]); // eslint-disable-line

    const download = () => {
        const a = document.createElement('a');
        a.download = 'openbot-code.png';
        a.href = canvasRef.current.toDataURL('image/png');
        a.click();
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
    };

    const STEPS = [
        { n: '1', t: "Ouvre l'app OpenBot sur ton téléphone" },
        { n: '2', t: 'Programs → ⊡ Scan QR' },
        { n: '3', t: 'Scanne ce code → ▶ Run' },
    ];

    return (
        <div className="qr-inline-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <span style={{ fontSize: '.9rem' }}>📱</span>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.6rem', fontWeight: 600, letterSpacing: '.1em', color: '#c9a84c' }}>QR CODE OPENBOT</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(201,168,76,.5)', cursor: 'pointer', fontSize: '.85rem', lineHeight: 1, padding: '2px 4px' }}>✕</button>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.42rem', color: over ? '#ef4444' : 'rgba(201,168,76,.45)' }}>{payload.length} / {MAX} chars</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.42rem', color: 'rgba(201,168,76,.35)' }}>{pct}%</span>
                </div>
                <div className="qr-bar-track">
                    <div className="qr-bar-fill" style={{ width: `${pct}%`, background: over ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e' }} />
                </div>
            </div>
            {err && <div className="qr-err">{err}</div>}
            {!err && (
                <div className="qr-canvas-wrap">
                    <canvas ref={canvasRef} width={200} height={200} style={{ display: ready ? 'block' : 'none', borderRadius: '5px' }} />
                    {!ready && (
                        <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '.4rem' }}>
                            <div style={{ width: 24, height: 24, border: '2px solid rgba(201,168,76,.3)', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'uploadSpin .7s linear infinite' }} />
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.42rem', color: 'rgba(201,168,76,.5)' }}>Génération…</span>
                        </div>
                    )}
                    {ready && <div className="qr-scan-line" />}
                </div>
            )}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                {STEPS.map(({ n, t }) => (
                    <div key={n} className="qr-step">
                        <div className="qr-step-n">{n}</div>
                        <span className="qr-step-t">{t}</span>
                    </div>
                ))}
            </div>
            {ready && (
                <div className="qr-action-row">
                    <button className="qr-action-btn" onClick={download}>{downloaded ? '✓ Téléchargé !' : '↓ PNG'}</button>
                    <button className="qr-action-btn" onClick={onClose}>✕ Fermer</button>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// QR FLOATING WINDOW
// ═══════════════════════════════════════════
const QrFloatingWindow = ({ driveLink, onClose }) => {
    const [pos, setPos] = useState({
        x: Math.max(40, window.innerWidth / 2 - 200),
        y: Math.max(40, window.innerHeight / 2 - 220),
    });
    const [minimized, setMinimized] = useState(false);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(driveLink)}&color=000000&bgcolor=ffffff&margin=10`;

    useEffect(() => {
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const drag = e => {
        if (e.target.closest('.float-win-btn')) return;
        e.preventDefault();
        const sx = e.clientX - pos.x, sy = e.clientY - pos.y;
        const mv = ev => setPos({ x: ev.clientX - sx, y: ev.clientY - sy });
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup', up);
    };

    return (
        <div className="float-win" style={{ left: pos.x, top: pos.y, width: 400, height: minimized ? 42 : 'auto' }}>

            {/* ── Titlebar ── */}
            <div className="float-win-titlebar" onMouseDown={drag}>
                <div className="float-win-btns">
                    <button className="float-win-btn float-win-btn-close" onClick={onClose} data-tip="Fermer (ESC)">✕</button>
                    <button className="float-win-btn float-win-btn-min" onClick={() => setMinimized(m => !m)} data-tip={minimized ? 'Restaurer' : 'Réduire'}>
                        {minimized ? '▲' : '▬'}
                    </button>
                </div>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.62rem', color: 'rgba(201,168,76,.75)', letterSpacing: '.1em' }}>
                        📱 QR CODE OPENBOT
                    </span>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.38rem', color: 'rgba(201,168,76,.28)' }}>ESC</span>
            </div>

            {/* ── Content ── */}
            {!minimized && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '1rem 1.2rem 1.2rem', gap: '.75rem',
                    background: 'linear-gradient(180deg,rgba(8,4,1,.96) 0%,rgba(4,2,0,.99) 100%)',
                }}>

                    {/* QR avec scan line animée */}
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', animation: 'qrPulse 2.5s ease-in-out infinite' }}>
                        <div style={{ background: 'white', borderRadius: '10px', padding: '8px' }}>
                            <img src={qrUrl} alt="QR Code OpenBot" width={220} height={220}
                                style={{ display: 'block', borderRadius: '6px' }} />
                        </div>
                        {/* Ligne scan */}
                        <div style={{
                            position: 'absolute', left: 8, right: 8, height: '2px',
                            background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.9),transparent)',
                            animation: 'scanLine 2s ease-in-out infinite',
                            pointerEvents: 'none', borderRadius: '1px',
                        }} />
                    </div>

                    {/* Steps */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                        {[
                            { n: '1', t: "Ouvre l'app OpenBot" },
                            { n: '2', t: 'Programs → ⊡ Scan' },
                            { n: '3', t: 'Scanne ce QR code' },
                            { n: '4', t: '▶ Run → 🤖 Robot bouge !' },
                        ].map(({ n, t }) => (
                            <div key={n} style={{
                                display: 'flex', alignItems: 'center', gap: '.5rem',
                                padding: '.2rem .5rem',
                                background: 'rgba(201,168,76,.04)', borderRadius: '5px',
                                border: '1px solid rgba(201,168,76,.1)',
                            }}>
                                <div style={{
                                    width: 18, height: 18, borderRadius: '50%',
                                    background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'Cinzel',serif", fontSize: '.52rem', color: '#c9a84c', flexShrink: 0,
                                }}>{n}</div>
                                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.46rem', color: 'rgba(201,168,76,.65)' }}>{t}</span>
                            </div>
                        ))}
                    </div>

                    {/* Drive link */}
                    <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{
                        fontFamily: "'Space Mono',monospace", fontSize: '.42rem',
                        color: 'rgba(108,190,255,.7)', textDecoration: 'none',
                        background: 'rgba(108,190,255,.06)', border: '1px solid rgba(108,190,255,.2)',
                        borderRadius: '6px', padding: '.22rem .6rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'block', width: '100%', textAlign: 'center',
                        boxSizing: 'border-box',
                    }}>🔗 Voir sur Google Drive</a>

                    {/* Close */}
                    <button onClick={onClose} style={{
                        width: '100%', background: 'rgba(201,168,76,.08)',
                        border: '1px solid rgba(201,168,76,.28)', borderRadius: '7px',
                        color: '#c9a84c', cursor: 'pointer', fontFamily: "'Cinzel',serif",
                        fontSize: '.65rem', fontWeight: 600, padding: '.35rem 1rem',
                        transition: 'all .18s', letterSpacing: '.06em',
                    }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(201,168,76,.18)'; e.target.style.color = '#f0d080'; }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(201,168,76,.08)'; e.target.style.color = '#c9a84c'; }}>
                        ✕ Fermer (ESC)
                    </button>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// NOMAD UPLOAD BUTTON
// ═══════════════════════════════════════════
const NomadUploadButton = () => {
    const [state, setState] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [qrLink, setQrLink] = useState(null);

    const { isOnline, setGenerateCode, generate, setCode, setDrawer, workspace, setIsError, setCategory } = useContext(StoreContext);

    function handlingMultipleAIBlocks(start) {
        let child = [], all = [], conf = [];
        if (start.length && start[0].childBlocks_.length > 0) {
            all = handleChildBlockInWorkspace(start[0].childBlocks_, child);
            for (let i = 0; i < all.length; i++) {
                if (aiBlocks.includes(all[i])) conf.push(all[i]);
                else if (all[i] === PlaygroundConstants.disableAI) conf.pop();
                if (conf.length > 1) return true;
            }
            return false;
        }
    }

    const handleUpload = async () => {
        if (state === 'loading') return;
        if (!isOnline) { errorToast(Constants.InternetOffMsg); return; }
        if (localStorage.getItem('isSigIn') !== 'true') { errorToast('Please sign-In to upload code.'); return; }

        setState('loading'); setProgress(12); setDrawer(false);

        try {
            let currentProj = getCurrentProject();
            const projectName = currentProj?.projectName?.trim() || 'mon-projet';
            if (!currentProj) {
                const fallback = { projectName, xmlValue: '', storage: 'local', createdDate: new Date().toLocaleDateString() };
                localStorage.setItem('currentProject', JSON.stringify(fallback));
                currentProj = fallback;
            } else if (!currentProj.projectName?.trim()) {
                currentProj.projectName = projectName;
                localStorage.setItem('currentProject', JSON.stringify(currentProj));
            }

            const code = javascriptGenerator.workspaceToCode(workspace);
            const start = workspace.getBlocksByType(PlaygroundConstants.start);
            const forever = workspace.getBlocksByType(PlaygroundConstants.forever);
            const detection = workspace.getBlocksByType(PlaygroundConstants.detectionOrUndetection);
            const varDet = workspace.getBlocksByType(PlaygroundConstants.variableDetection);
            const motBlocks = workspace.getBlocksByType(PlaygroundConstants.multipleObjectTracking);

            const labels = varDet?.map(b => b.getFieldValue(PlaygroundConstants.labels)) ?? [];
            const hasDupLabels = labels.some((l, i) => labels.indexOf(l) !== i);
            const motEnabled = motBlocks?.filter(o => !o.disabled) ?? [];
            const isAdjAI = handlingMultipleAIBlocks(start);
            let arr = [];
            const foreverKids = handleChildBlockInWorkspace(forever, arr);
            const foreverHasAI = foreverKids.some(k => aiBlocks.includes(k));
            let o1 = PlaygroundConstants.object_1, o2 = PlaygroundConstants.object_2;
            if (motEnabled.length) {
                o1 = motEnabled[0].getFieldValue(PlaygroundConstants.labels1);
                o2 = motEnabled[0].getFieldValue(PlaygroundConstants.labels2);
            }

            if (!start.length && !forever.length && !detection.length && !varDet.length) throw new Error(Errors.error1);
            if (isAdjAI && start.length) throw new Error(Errors.error2);
            if (o1 === o2) throw new Error(Errors.error3);
            if (foreverHasAI) throw new Error(Errors.error4);
            if (hasDupLabels) throw new Error(Errors.error5);

            setProgress(35);
            let clean = code.replace(/\/\/.*$/gm, '');
            if (start.length) clean += '\nstart();';
            if (forever.length) clean += '\nforever();';
            setGenerateCode(!generate);
            setProgress(55);

            const driveLink = await uploadToGoogleDrive(clean, 'js');
            setProgress(78);

            await uploadToGoogleDrive({
                projectName: getCurrentProject().projectName,
                xmlValue: getCurrentProject().xmlValue || '',
                createdDate: new Date().toLocaleDateString(),
            }, 'xml');

            setProgress(100);
            setCode({ driveLink, projectName: getCurrentProject().projectName });
            setCategory(Constants.qr);
            setQrLink(driveLink);
            setState('success');
            setTimeout(() => { setState('idle'); setProgress(0); }, 2400);

        } catch (err) {
            setState('error');
            setIsError(true);
            errorToast(err.message || 'Upload failed');
            setTimeout(() => { setState('idle'); setProgress(0); }, 2000);
        }
    };

    const STATES = {
        idle: { icon: '⬆', label: 'Upload Code' },
        loading: { icon: '⟳', label: 'Envoi...' },
        success: { icon: '✓', label: 'Envoyé !' },
        error: { icon: '✕', label: 'Erreur !' },
    };
    const { icon, label } = STATES[state];

    return (
        <>
            {qrLink && <QrFloatingWindow driveLink={qrLink} onClose={() => setQrLink(null)} />}
            <button
                className={`nomad-upload-btn${state === 'success' ? ' is-success' : state === 'error' ? ' is-error' : ''}`}
                onClick={handleUpload}
                disabled={state === 'loading'}
                title="Compiler → Google Drive → QR Code OpenBot"
            >
                <span className={`nu-icon${state === 'loading' ? ' spin' : ''}`}>{icon}</span>
                {label}
                {state === 'loading' && <div className="nu-progress" style={{ width: `${progress}%` }} />}
            </button>
        </>
    );
};

// ═══════════════════════════════════════════
// FLOATING WINDOW (simulateur scène)
// ═══════════════════════════════════════════
const FloatingWindow = ({ win, onUpdate, onClose, streamSrc, onStreamError }) => {
    const isMinimized = win.h <= 42;
    const isMaximized = win.w >= window.innerWidth - 50 && win.h >= window.innerHeight - 50;
    const imgRef = useRef(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (isMinimized) return;
        const img = imgRef.current; if (!img) return;
        img.src = streamSrc;
        const wd = setInterval(() => { if (img?.naturalWidth === 0) img.src = streamSrc + '?t=' + Date.now(); }, 3000);
        return () => clearInterval(wd);
    }, [isMinimized, streamSrc]);

    useEffect(() => {
        const k = e => { if (e.key === 'Escape') { zoom > 1 ? setZoom(1) : onClose(); } };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [zoom, onClose]);

    const onWheel = e => { e.preventDefault(); setZoom(z => Math.min(3, Math.max(0.4, z + (e.deltaY < 0 ? .12 : -.12)))); };

    const drag = e => {
        if (e.target.closest('.float-win-btn,.float-win-resize,.float-win-zoom')) return;
        e.preventDefault();
        const sx = e.clientX - win.x, sy = e.clientY - win.y;
        const mv = ev => onUpdate(f => ({ ...f, x: ev.clientX - sx, y: ev.clientY - sy }));
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    };

    const resize = e => {
        e.preventDefault(); e.stopPropagation();
        const [sx, sy, sw, sh] = [e.clientX, e.clientY, win.w, win.h];
        const mv = ev => onUpdate(f => ({ ...f, w: Math.max(320, sw + ev.clientX - sx), h: Math.max(260, sh + ev.clientY - sy) }));
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    };

    const maximize = () => onUpdate(f => ({ ...f, _prevX: f.x, _prevY: f.y, _prevW: f.w, _prevH: isMinimized ? (f._prevH || 480) : f.h, x: 0, y: 0, w: window.innerWidth, h: window.innerHeight }));
    const restore = () => onUpdate(f => ({ ...f, x: f._prevX ?? 80, y: f._prevY ?? 80, w: f._prevW || 720, h: f._prevH || 480 }));
    const minimize = () => onUpdate(f => ({ ...f, _prevH: isMinimized ? (f._prevH || 480) : f.h, h: 42 }));

    return (
        <div className="float-win" style={{ left: win.x, top: win.y, width: win.w, height: win.h, transition: isMaximized ? 'all .22s cubic-bezier(.4,0,.2,1)' : 'none' }}>
            <div className="float-win-titlebar" onMouseDown={drag} onDoubleClick={e => { if (!e.target.closest('.float-win-btn')) isMaximized ? restore() : maximize(); }}>
                <div className="float-win-btns">
                    <button className="float-win-btn float-win-btn-close" onClick={onClose} data-tip="Fermer">✕</button>
                    <button className="float-win-btn float-win-btn-min" onClick={isMinimized ? restore : minimize} data-tip={isMinimized ? 'Restaurer' : 'Réduire'}>{isMinimized ? '▲' : '▬'}</button>
                    <button className="float-win-btn float-win-btn-max" onClick={isMaximized ? restore : maximize} data-tip={isMaximized ? 'Restaurer' : 'Agrandir'}>{isMaximized ? '❐' : '⛶'}</button>
                </div>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.62rem', color: 'rgba(201,168,76,.65)', letterSpacing: '.1em' }}>VUE SCÈNE</span>
                    <span style={{ fontSize: '.42rem', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)', borderRadius: '4px', padding: '1px 5px', color: 'rgba(201,168,76,.5)', fontFamily: "'Space Mono',monospace" }}>LIVE</span>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.4rem', color: 'rgba(201,168,76,.28)' }}>{Math.round(win.w)}×{Math.round(win.h)}</span>
            </div>
            {!isMinimized && (
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#020100', minHeight: 0 }} onWheel={onWheel}>
                    <div style={{ position: 'absolute', top: 8, left: 9, zIndex: 4, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.65)', padding: '2px 8px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff3333', boxShadow: '0 0 6px #ff3333', animation: 'blink 1s ease-in-out infinite' }} />
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.45rem', color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>REC</span>
                    </div>
                    <div className="float-win-zoom" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 20, padding: '3px 10px' }}>
                        <button onClick={() => setZoom(z => Math.max(0.4, +(z - .2).toFixed(1)))} style={{ background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, padding: '0 2px' }}>−</button>
                        <span onClick={() => setZoom(1)} style={{ fontFamily: "'Space Mono',monospace", fontSize: '.5rem', color: zoom !== 1 ? '#f0d080' : 'rgba(201,168,76,.5)', cursor: 'pointer', minWidth: 28, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, +(z + .2).toFixed(1)))} style={{ background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, padding: '0 2px' }}>+</button>
                    </div>
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.035) 3px,rgba(0,0,0,.035) 4px)' }} />
                    {[{ top: 0, left: 0, borderWidth: '1.5px 0 0 1.5px' }, { top: 0, right: 0, borderWidth: '1.5px 1.5px 0 0' }, { bottom: 0, left: 0, borderWidth: '0 0 1.5px 1.5px' }, { bottom: 0, right: 0, borderWidth: '0 1.5px 1.5px 0' }].map((s, i) => (
                        <div key={i} style={{ position: 'absolute', width: 16, height: 16, zIndex: 4, borderStyle: 'solid', borderColor: 'rgba(201,168,76,.4)', pointerEvents: 'none', ...s }} />
                    ))}
                    <img ref={imgRef} alt="Vue Scène" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform .15s ease' }}
                        onError={() => { onStreamError(); setTimeout(() => { if (imgRef.current) imgRef.current.src = streamSrc + '?t=' + Date.now(); }, 2000); }} />
                </div>
            )}
            {!isMinimized && <div className="float-win-resize" onMouseDown={resize} />}
        </div>
    );
};

// ═══════════════════════════════════════════
// PLAYGROUND
// ═══════════════════════════════════════════
function Playground() {
    const { category, setCategory } = useContext(StoreContext);
    const [simStatus, setSimStatus] = useState('offline');
    const [wsUrl, setWsUrl] = useState('ws://197.5.193.210:8765');
    const [wsLog, setWsLog] = useState('⏳ Démarrage de Webots…');
    const [floatWin, setFloatWin] = useState({ open: false, x: 80, y: 80, w: 720, h: 480, _prevH: 480 });

    const [showQr, setShowQr] = useState(false);
    const [currentCode, setCurrentCode] = useState('');

    // ── ✅ TUTORIAL STATE ──
    const [showTutorial, setShowTutorial] = useState(false);

    const wsRef = useRef(null);
    const keysRef = useRef({});
    const reconnTimerRef = useRef(null);
    const userIdRef = useRef('user_' + Math.random().toString(36).slice(2, 8));

    const G = a => `rgba(201,168,76,${a})`;
    const SC = simStatus === 'online' ? '#4ddc64' : simStatus === 'connecting' ? '#f0a500' : '#c9a84c';
    const SL = simStatus === 'online' ? 'CONNECTÉ' : simStatus === 'connecting' ? 'CONNEXION...' : 'OFFLINE';

    const getWS = () => {
        try { return require('blockly/core').getMainWorkspace(); } catch { return null; }
    };
    const doUndo = () => { const ws = getWS(); if (ws?.getUndoStack?.().length) ws.undo(false); };
    const doRedo = () => { const ws = getWS(); if (ws?.redoStack_?.length) ws.undo(true); };
    const doZoomI = () => { const ws = getWS(); if (ws?.zoom) ws.zoom(1, 2, 1.5); };
    const doZoomO = () => { const ws = getWS(); if (ws?.zoom) ws.zoom(1, 2, -1.5); };

    // ═══════════════════════════════════════════
    // ✅ FIX: handleShowQr — définition manquante
    // Lit le code courant depuis le workspace Blockly
    // et bascule l'affichage du QR inline
    // ═══════════════════════════════════════════
    const handleShowQr = useCallback(() => {
        if (!showQr) {
            try {
                const { javascriptGenerator: J } = require('blockly/javascript');
                const B = require('blockly/core');
                const ws = B.getMainWorkspace();
                const code = ws ? J.workspaceToCode(ws) : '';
                setCurrentCode(code);
            } catch {
                setCurrentCode(window.__currentPythonCode || '');
            }
        }
        setShowQr(prev => !prev);
    }, [showQr]);

    useEffect(() => {
        const level = new URLSearchParams(window.location.search).get('level') || '1';
        const userId = userIdRef.current;
        setWsLog('🚀 Lancement Webots — niveau ' + level + '…');
        fetch(`${BACKEND}/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, level }) })
            .then(r => r.json())
            .then(d => setWsLog(d.ok || d.message ? '✅ Webots lancé — connexion WS…' : '⚠️ ' + (d.error || 'Erreur backend')))
            .catch(() => setWsLog('⚠️ Backend non disponible'));
        return () => { fetch(`${BACKEND}/stop`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }).catch(() => { }); };
    }, []); // eslint-disable-line

    const connectWebots = useCallback(() => {
        if (reconnTimerRef.current) { clearTimeout(reconnTimerRef.current); reconnTimerRef.current = null; }
        if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
        setSimStatus('connecting'); setWsLog('🔄 Connexion…');
        try {
            const ws = new WebSocket(wsUrl); wsRef.current = ws;
            ws.onopen = () => { setSimStatus('online'); setWsLog('✅ Connecté !'); ParserModule.initParser(ws); };
            ws.onerror = () => { setSimStatus('offline'); setWsLog('❌ Erreur connexion'); };
            ws.onclose = () => { setSimStatus('offline'); setWsLog('⚠️ Déconnecté — reconnexion 3s…'); reconnTimerRef.current = setTimeout(connectWebots, 3000); };
            ws.onmessage = e => { if (typeof e.data === 'string' && !e.data.startsWith('CAM:')) setWsLog('📩 ' + e.data); };
        } catch (e) {
            setSimStatus('offline'); setWsLog('❌ ' + e.message);
            reconnTimerRef.current = setTimeout(connectWebots, 3000);
        }
    }, [wsUrl]); // eslint-disable-line

    useEffect(() => {
        const t = setTimeout(() => connectWebots(), 2000);
        return () => { clearTimeout(t); if (reconnTimerRef.current) clearTimeout(reconnTimerRef.current); if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); } };
    }, []); // eslint-disable-line

    useEffect(() => {
        const km = { 'ArrowUp': 'moveForward', 'ArrowDown': 'moveBackward', 'ArrowLeft': 'turnLeft', 'ArrowRight': 'turnRight', 'z': 'moveForward', 'Z': 'moveForward', 's': 'moveBackward', 'S': 'moveBackward', 'q': 'turnLeft', 'Q': 'turnLeft', 'd': 'turnRight', 'D': 'turnRight', ' ': 'stop' };
        const dn = e => { if (keysRef.current[e.key]) return; keysRef.current[e.key] = true; const c = km[e.key]; if (c) { e.preventDefault(); sendCmd(c); } };
        const up = e => { keysRef.current[e.key] = false; const c = km[e.key]; if (c && c !== 'stop') sendCmd('stop'); };
        window.addEventListener('keydown', dn); window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
    }); // eslint-disable-line

    const sendCmd = cmd => { if (wsRef.current?.readyState === WebSocket.OPEN) { wsRef.current.send(cmd); setWsLog('✅ ' + cmd); } else setWsLog('❌ Non connecté !'); };

    const handleRun = () => {
        try {
            const B = require('blockly/core'), { javascriptGenerator: J } = require('blockly/javascript');
            ParserModule.runBlocklyCode(J.workspaceToCode(B.getMainWorkspace())); setWsLog('▶ Programme lancé !');
        } catch { const c = window.__currentPythonCode || ''; if (c) ParserModule.runBlocklyCode(c); }
    };

    const ispy = category === 'py';

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

            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(ellipse at 50% 105%,rgba(180,90,0,.6) 0%,transparent 48%),radial-gradient(ellipse at 12% 58%,rgba(201,168,76,.1) 0%,transparent 44%),radial-gradient(ellipse at 88% 18%,rgba(40,20,80,.28) 0%,transparent 44%),#030108` }} />
            <div style={{ position: 'fixed', top: '-8%', left: '-4%', width: '680px', height: '680px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,.1) 0%,transparent 70%)', filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', top: '-4%', right: '-4%', width: '580px', height: '580px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(80,40,160,.18) 0%,transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-4%', left: '18%', width: '960px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,100,0,.35) 0%,transparent 70%)', filter: 'blur(110px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`, backgroundSize: '260px 260px', opacity: .08 }} />

            <div style={{ position: 'fixed', top: '4%', right: '3%', zIndex: 2, pointerEvents: 'none', animation: 'ufloat 11s ease-in-out infinite' }}>
                <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%,#fff8e1,#f0d080,#a86c00)', animation: 'orbPulse 4s ease-in-out infinite', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-16px', left: '-16px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(201,168,76,.2)' }} />
                    <div style={{ position: 'absolute', top: '-26px', left: '-26px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(201,168,76,.1)' }} />
                </div>
            </div>
            <div style={{ position: 'fixed', top: '60%', left: '1.5%', fontSize: '2.6rem', zIndex: 2, pointerEvents: 'none', animation: 'udrift 9s ease-in-out infinite', filter: 'drop-shadow(0 0 14px rgba(201,168,76,.6))' }}>🐪</div>
            <svg style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '200px', zIndex: 1, pointerEvents: 'none', animation: 'sandDrift 18s ease-in-out infinite' }} viewBox="0 0 1440 200" preserveAspectRatio="none">
                <path d="M0,145 C200,82 380,158 570,108 C750,62 930,150 1110,98 C1230,64 1370,120 1440,88 L1440,200 L0,200 Z" fill="rgba(201,168,76,.1)" />
                <path d="M0,145 C200,82 380,158 570,108 C750,62 930,150 1110,98 C1230,64 1370,120 1440,88" stroke="rgba(201,168,76,.22)" strokeWidth="1.2" fill="none" />
                <path d="M0,168 C320,135 540,172 790,152 C990,136 1180,168 1440,148 L1440,200 L0,200 Z" fill="rgba(180,80,0,.13)" />
            </svg>

            {HUD_CORNERS.map((s, i) => <div key={i} className="hud-corner" style={s} />)}
            {DECO_STARS.map(({ icon, ...s }, i) => <div key={i} className="deco-star" style={s}>{icon}</div>)}

            {floatWin.open && (
                <FloatingWindow win={floatWin} onUpdate={setFloatWin}
                    onClose={() => setFloatWin(f => ({ ...f, open: false }))}
                    streamSrc={STREAM_SCENE}
                    onStreamError={() => setWsLog('⚠️ Stream non disponible')} />
            )}

            <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <div className="ws-scan" />
                        <BlocklyComponent readOnly={false} move={{ scrollbars: true, drag: true, wheel: true }}
                            initialXml={`<xml xmlns="http://www.w3.org/1999/xhtml"><Block type="start" x="0" y="100"/><Block type="forever" x="250" y="100"/></xml>`}>
                            <Toolbox />
                        </BlocklyComponent>
                    </div>

                    {/* ── Panneau droit ── */}
                    <div style={{ width: '44%', flexShrink: 0, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg,rgba(8,4,1,.78) 0%,rgba(6,3,0,.74) 50%,rgba(10,5,1,.78) 100%)`, backdropFilter: 'blur(18px) saturate(140%)', borderLeft: `1px solid ${G(.28)}`, minHeight: 0, boxShadow: `-2px 0 40px rgba(0,0,0,.5),inset 1px 0 0 ${G(.05)}` }}>

                        {/* ── Éditeur de code ── */}
                        <div data-tut="editor" style={{ flex: '0 0 36%', display: 'flex', flexDirection: 'column', borderBottom: `1px solid ${G(.18)}`, overflow: 'hidden', minHeight: 0 }}>
                            <div className="panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{ispy ? '🐍' : '⚡'}</span>
                                    <span className="gold-shimmer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.8rem', fontWeight: '600', letterSpacing: '.1em' }}>{ispy ? 'CODE PYTHON' : 'CODE JAVASCRIPT'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                                    <button
                                        className="pb pb-qr"
                                        onClick={handleShowQr}
                                        title="Générer QR code OpenBot depuis le code actuel"
                                        style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}
                                    >
                                        {showQr ? '✕ QR' : '📱 QR'}
                                    </button>
                                    <button className="pb pb-gold" onClick={() => setCategory(ispy ? 'js' : 'py')}>{ispy ? '⚡ JS' : '🐍 PY'}</button>
                                    <button className="pb pb-green" onClick={handleRun}>▶ Run</button>
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(2,1,0,.32)' }}>
                                <CodeEditor />
                            </div>
                            {showQr && (
                                <QrInlinePanel
                                    code={currentCode}
                                    onClose={() => setShowQr(false)}
                                />
                            )}
                        </div>

                        {/* ── Simulateur robot ── */}
                        <div data-tut="simulator" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                            <div className="panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>🤖</span>
                                    <span className="gold-shimmer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.8rem', fontWeight: '600', letterSpacing: '.1em' }}>SIMULATEUR ROBOT</span>
                                </div>
                                <div className="status-badge" style={{ background: `${SC}14`, border: `1px solid ${SC}44`, color: SC, cursor: simStatus !== 'online' ? 'pointer' : 'default' }} onClick={simStatus !== 'online' ? connectWebots : undefined}>
                                    <div className="status-dot" style={{ background: SC, boxShadow: `0 0 6px ${SC}` }} />{SL}
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.45rem .55rem', background: 'rgba(3,1,0,.22)', minHeight: 0, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', gap: '.4rem', width: '100%', flexShrink: 0 }}>
                                    <input className="ws-input" value={wsUrl} onChange={e => setWsUrl(e.target.value)} placeholder="ws://197.5.193.210:8765" />
                                    <button className="btn-connect" onClick={connectWebots}>Connecter</button>
                                </div>
                                <div className="gold-divider" />
                                <div className="cam-frame">
                                    <div className="rec-badge"><div className="rec-dot" /><span className="rec-text">REC</span></div>
                                    <div className="cam-label">
                                        <span>🎬 Vue Scène</span>
                                        <button className="btn-fs" onClick={() => setFloatWin(f => ({ ...f, open: true }))} title="Ouvrir dans une fenêtre">⛶</button>
                                    </div>
                                    <div className="cam-crt" />
                                    <img src={STREAM_SCENE} alt="Vue Scène" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '8px' }} onError={() => setWsLog('⚠️ Stream non disponible')} />
                                </div>
                                <div className="ws-log">{wsLog}</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── BOTTOM BAR ── */}
                <div className="nomad-bottombar">
                    <NomadUploadButton />
                    <TutorialButton onClick={() => setShowTutorial(true)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        <button className="nomad-tool-btn" onClick={doUndo} title="Annuler">↩</button>
                        <button className="nomad-tool-btn" onClick={doRedo} title="Rétablir">↪</button>
                        <div style={{ width: 1, height: 22, background: 'rgba(201,168,76,.18)', margin: '0 .18rem' }} />
                        <button className="nomad-tool-btn" onClick={doZoomO} title="Zoom −" style={{ fontSize: '1.1rem', fontWeight: 700 }}>−</button>
                        <button className="nomad-tool-btn" onClick={doZoomI} title="Zoom +" style={{ fontSize: '1.1rem', fontWeight: 700 }}>+</button>
                    </div>
                </div>

            </div>

            {/* Tutorial overlay */}
            {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

        </div>
    );
}

export default Playground;