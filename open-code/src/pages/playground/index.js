import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import BlocklyComponent from "../../components/blockly";
import { Toolbox } from "../../components/blockly/toolbox/Toolbox";
import { Header } from "../../components/navBar/header";
import { StoreContext } from "../../context/context";
import CodeEditor from "../../components/editor/codeEditor";
import * as ParserModule from '../../utils/parser';
import { GameProvider, useGameScore } from '../../utils/useGameScore';
import { javascriptGenerator } from 'blockly/javascript';
import { uploadToGoogleDrive } from '../../services/googleDrive';
import { getCurrentProject, handleChildBlockInWorkspace } from '../../services/workspace';
import { aiBlocks, Constants, Errors, errorToast, PlaygroundConstants } from '../../utils/constants';
import { Tutorial, TutorialButton } from './Tutorial';

// Safe accessor — window.Blockly is set by BlocklyComponent on mount.
function getBlocklyWorkspace() {
    try { return window.Blockly?.getMainWorkspace?.() ?? null; }
    catch (_) { return null; }
}

const BACKEND = 'http://197.5.193.210:5000';
const STREAM_SCENE = 'http://197.5.193.210:8766/scene';
const WEBOTS_WS = 'ws://localhost:1234';

const COLS = ['#f0ddb8', '#d4b06a', '#e8a055', '#b09060', '#ffffff', '#f5ead0', '#c8a870'];
const STAR_DATA = Array.from({ length: 200 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 2.0 + 0.3,
    col: COLS[Math.floor(Math.random() * COLS.length)],
    op: Math.random() * 0.55 + 0.15,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * 0.018 + 0.003,
}));

function safe(n, fallback = 0) { return Number.isFinite(n) ? n : fallback; }
function vw() { return safe(typeof window !== 'undefined' ? window.innerWidth : 1280, 1280); }
function vh() { return safe(typeof window !== 'undefined' ? window.innerHeight : 800, 800); }

function loadWebotsView() {
    return new Promise((resolve) => {
        if (customElements.get('webots-view')) return resolve();
        if (document.querySelector('script[data-webots-view]')) {
            const wait = setInterval(() => { if (customElements.get('webots-view')) { clearInterval(wait); resolve(); } }, 100);
            // safety timeout — resolve anyway after 8s
            setTimeout(() => { clearInterval(wait); resolve(); }, 8000);
            return;
        }
        // Temporarily suppress cross-origin Script errors from this tag
        const prevOnError = window.onerror;
        const suppressUntil = { active: true };
        window.onerror = (msg, src, line, col, err) => {
            if (suppressUntil.active && msg === 'Script error.') return true; // suppress
            return prevOnError ? prevOnError(msg, src, line, col, err) : false;
        };
        const cleanup = () => {
            suppressUntil.active = false;
            window.onerror = prevOnError;
        };

        const s = document.createElement('script');
        s.src = 'https://cyberbotics.com/wwi/R2025a/WebotsView.js';
        s.type = 'module';
        s.crossOrigin = 'anonymous';
        s.dataset.webotsView = '1';
        s.onload = () => {
            cleanup();
            const wait = setInterval(() => { if (customElements.get('webots-view')) { clearInterval(wait); resolve(); } }, 100);
            setTimeout(() => { clearInterval(wait); resolve(); }, 8000);
        };
        s.onerror = () => {
            cleanup();
            console.warn('[WebotsView] Script failed to load — using fallback');
            resolve();
        };
        document.head.appendChild(s);
    });
}

const StarCanvas = () => {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current; if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const resize = () => { canvas.width = vw(); canvas.height = vh(); };
        resize(); window.addEventListener('resize', resize);
        const stars = STAR_DATA.map(s => ({ ...s }));
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                s.tw += s.sp;
                const a = s.op * (0.3 + 0.7 * (Math.sin(s.tw) * 0.5 + 0.5));
                const x = s.x / 100 * canvas.width, y = s.y / 100 * canvas.height;
                if (s.r > 1.5) {
                    const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 4);
                    g.addColorStop(0, s.col); g.addColorStop(1, 'transparent');
                    ctx.globalAlpha = a * 0.15; ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(x, y, s.r * 4, 0, Math.PI * 2); ctx.fill();
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
        @keyframes amberShimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes upulse        { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.85;transform:scale(1.10)} }
        @keyframes ufloat        { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
        @keyframes udrift        { 0%,100%{transform:translate(0,0)} 50%{transform:translate(5px,-8px)} }
        @keyframes sandDrift     { 0%,100%{transform:translateX(0)} 50%{transform:translateX(10px)} }
        @keyframes orbPulse      { 0%,100%{box-shadow:0 0 24px rgba(232,160,85,.28),0 0 48px rgba(196,120,64,.10)} 50%{box-shadow:0 0 44px rgba(232,160,85,.55),0 0 88px rgba(196,120,64,.20)} }
        @keyframes hudPulse      { 0%,100%{opacity:.28} 50%{opacity:.70} }
        @keyframes tealPulse     { 0%,100%{opacity:.35} 50%{opacity:.80} }
        @keyframes blink         { 0%,100%{opacity:1} 50%{opacity:.1} }
        @keyframes winFadeIn     { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @keyframes uploadGlow    { 0%,100%{box-shadow:0 0 14px rgba(232,160,85,.22),0 4px 18px rgba(0,0,0,.45)} 50%{box-shadow:0 0 30px rgba(232,160,85,.48),0 4px 24px rgba(0,0,0,.45)} }
        @keyframes uploadSpin    { to{transform:rotate(360deg)} }
        @keyframes successPop    { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes progressFlow  { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes qrPulse       { 0%,100%{box-shadow:0 0 18px rgba(232,160,85,.22)} 50%{box-shadow:0 0 38px rgba(232,160,85,.50),0 0 70px rgba(232,160,85,.15)} }
        @keyframes scanLine      { 0%{top:8px} 100%{top:calc(100% - 8px)} }
        @keyframes stopPulse     { 0%,100%{box-shadow:0 0 5px rgba(220,77,77,.35)} 50%{box-shadow:0 0 12px rgba(220,77,77,.70)} }
        @keyframes nvScoreBump   { 0%{transform:scale(1)} 40%{transform:scale(1.40);color:#f0ddb8} 100%{transform:scale(1)} }
        @keyframes nvStarPop     { 0%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.7) rotate(16deg);filter:brightness(1.7)} 100%{transform:scale(1) rotate(0deg)} }
        @keyframes nvLevelOverlay{ 0%{opacity:0;transform:scale(0.84)} 60%{transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
        @keyframes nvStarRain    { 0%{opacity:0;transform:translateY(-20px) scale(0)} 50%{opacity:1;transform:translateY(0) scale(1.2)} 100%{opacity:0;transform:translateY(10px) scale(0.8)} }
        .nv-score-bump { animation: nvScoreBump 0.38s ease !important; }
        .nv-star-pop   { animation: nvStarPop   0.50s ease !important; }
        .gold-shimmer { background: linear-gradient(90deg,#b09060,#e8a055,#f0ddb8,#e8a055,#b09060); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: amberShimmer 5s linear infinite; }
        .blocklyMainBackground      { fill: transparent !important; }
        .injectionDiv               { background: transparent !important; background-color: transparent !important; }
        svg.blocklySvg              { background: transparent !important; }
        .blocklyGrid path           { stroke: rgba(232,160,85,.05) !important; }
        .blocklyScrollbarHandle     { fill: rgba(232,160,85,.30) !important; }
        .blocklyScrollbarBackground { fill: rgba(232,160,85,.03) !important; }
        .blocklyFlyoutBackground    { fill: rgba(18,10,3,.90) !important; }
        .blocklyToolboxDiv          { background: linear-gradient(180deg,rgba(14,8,2,.90) 0%,rgba(10,5,1,.86) 100%) !important; border-right: 1px solid rgba(232,160,85,.14) !important; }
        .blocklyTreeLabel           { color: rgba(212,176,106,.65) !important; font-family: 'Nunito',sans-serif !important; font-weight: 800 !important; }
        .blocklyTreeRow:hover .blocklyTreeLabel { color: #e8a055 !important; }
        .blocklyTreeSelected .blocklyTreeLabel  { color: #e8a055 !important; }
        .blocklyTreeRow      { border-left: 2px solid transparent !important; transition: all .2s !important; }
        .blocklyTreeSelected { border-left-color: rgba(232,160,85,.50) !important; background: rgba(232,160,85,.07) !important; }
        .panel-hdr { display:flex; align-items:center; justify-content:space-between; padding:.55rem 1rem; flex-shrink:0; position:relative; overflow:hidden; background: linear-gradient(135deg,rgba(232,160,85,.06) 0%,rgba(28,16,8,.65) 50%,rgba(232,160,85,.03) 100%); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(232,160,85,.14); }
        .panel-hdr::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg,transparent,rgba(232,160,85,.45) 30%,rgba(212,176,106,.65) 50%,rgba(232,160,85,.45) 70%,transparent); }
        .pb { font-family:'Nunito',sans-serif; font-weight:800; font-size:.65rem; padding:.25rem .75rem; border-radius:5px; border:none; cursor:pointer; transition:all .2s; letter-spacing:.03em; }
        .pb:hover  { transform:translateY(-1px); filter:brightness(1.18); }
        .pb:active { transform:scale(.95); }
        .pb-gold  { background:rgba(232,160,85,.09); border:1px solid rgba(232,160,85,.26) !important; color:#d4b06a; }
        .pb-qr    { background:rgba(90,189,181,.10); border:1px solid rgba(90,189,181,.32) !important; color:#5abdb5; font-size:.6rem; padding:.22rem .6rem; }
        .run-stop-group { display:flex; overflow:hidden; border-radius:5px; border:1px solid rgba(77,210,100,.28); }
        .run-stop-group .pb-run { font-family:'Nunito',sans-serif; font-weight:800; font-size:.65rem; padding:.25rem .75rem; border:none; cursor:pointer; transition:all .2s; letter-spacing:.03em; border-radius:0; background:rgba(77,210,100,.12); color:#4ddc64; }
        .run-stop-group .pb-run:hover  { filter:brightness(1.2); }
        .run-stop-group .run-stop-divider { width:1px; background:rgba(77,210,100,.20); flex-shrink:0; }
        .run-stop-group .pb-stop { font-family:'Nunito',sans-serif; font-weight:800; font-size:.65rem; padding:.25rem .75rem; border:none; cursor:pointer; transition:all .2s; letter-spacing:.03em; border-radius:0; background:rgba(220,77,77,.15); color:#ff6b6b; animation:stopPulse 1.5s ease-in-out infinite; }
        .ws-input { flex:1; background:rgba(14,8,2,.55); border:1px solid rgba(232,160,85,.18) !important; border-radius:6px; color:#d4b06a; padding:.36rem .75rem; font-family:'Space Mono',monospace; font-size:.68rem; outline:none; backdrop-filter:blur(8px); transition:border-color .2s; }
        .ws-input:focus { border-color:rgba(232,160,85,.44) !important; }
        .btn-connect { font-family:'Cinzel',serif; font-size:.72rem; font-weight:600; letter-spacing:.06em; padding:.34rem .95rem; border-radius:5px; cursor:pointer; background: linear-gradient(135deg,#6a3200,#c47840,#e8a055,#c47840,#6a3200); background-size:200% auto; animation:amberShimmer 4s linear infinite; color:#1c1008; white-space:nowrap; border:none; box-shadow:0 2px 12px rgba(232,160,85,.22),inset 0 1px 0 rgba(255,255,255,.12); transition:all .2s; }
        .btn-connect:hover { transform:translateY(-1px); filter:brightness(1.08); }
        .gold-divider { width:100%; height:1px; flex-shrink:0; position:relative; background: linear-gradient(90deg,transparent,rgba(232,160,85,.18),rgba(232,160,85,.32),rgba(232,160,85,.18),transparent); }
        .gold-divider::after { content:'◆'; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:.45rem; color:rgba(232,160,85,.50); background:rgba(18,10,3,.88); padding:0 6px; }
        .status-badge { display:flex; align-items:center; gap:.35rem; padding:.22rem .65rem; border-radius:20px; font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.06em; font-weight:600; white-space:nowrap; }
        .status-dot   { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .ws-log { font-size:.53rem; font-family:'Space Mono',monospace; color:rgba(212,176,106,.48); text-align:center; padding:.16rem .55rem; background:rgba(10,5,1,.45); border:1px solid rgba(232,160,85,.10) !important; border-radius:6px; width:100%; flex-shrink:0; }
        .ws-scan { position:absolute; inset:0; pointer-events:none; z-index:0; background:repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(232,160,85,.004) 30px,rgba(232,160,85,.004) 31px); }
        .cam-frame { width:100%; flex:1; position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(232,160,85,.16) !important; background:rgba(8,4,1,.68); min-height:0; box-shadow:inset 0 0 36px rgba(0,0,0,.48),0 0 12px rgba(232,160,85,.04); }
        .rec-badge { position:absolute; top:8px; left:9px; z-index:10; display:flex; align-items:center; gap:4px; background:rgba(0,0,0,.55); padding:2px 8px; border-radius:20px; backdrop-filter:blur(6px); pointer-events:none; }
        .rec-dot   { width:5px; height:5px; border-radius:50%; background:#ff3333; box-shadow:0 0 6px #ff3333; animation:blink 1s ease-in-out infinite; }
        .rec-text  { font-family:'Space Mono',monospace; font-size:.48rem; color:rgba(255,255,255,.82); font-weight:700; letter-spacing:.06em; }
        .cam-label { position:absolute; top:8px; right:9px; z-index:10; display:flex; align-items:center; gap:.4rem; background:rgba(0,0,0,.55); padding:2px 6px 2px 9px; border-radius:20px; backdrop-filter:blur(6px); border:1px solid rgba(232,160,85,.15) !important; }
        .cam-label span { font-family:'Cinzel',serif; font-size:.5rem; color:#d4b06a; letter-spacing:.06em; }
        .btn-fs { background:rgba(232,160,85,.12); border:1px solid rgba(232,160,85,.34) !important; border-radius:4px; color:#e8a055; cursor:pointer; font-size:.75rem; padding:1px 6px; line-height:1; transition:all .2s; }
        .btn-fs:hover { background:rgba(232,160,85,.24); }
        .cam-crt { position:absolute; inset:0; border-radius:8px; pointer-events:none; z-index:2; background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.032) 3px,rgba(0,0,0,.032) 4px); }
        webots-view { width:100% !important; height:100% !important; display:block !important; border-radius:8px; overflow:hidden; }
        .stream-loading { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.8rem; background:rgba(8,4,1,.88); border-radius:8px; z-index:5; }
        .stream-spinner { width:32px; height:32px; border-radius:50%; border:2px solid rgba(232,160,85,.18); border-top-color:#e8a055; animation:uploadSpin .8s linear infinite; }
        .stream-loading-text { font-family:'Space Mono',monospace; font-size:.55rem; color:rgba(212,176,106,.55); text-align:center; }
        .hud-corner { position:fixed; width:28px; height:28px; border-color:rgba(232,160,85,.50); border-style:solid; z-index:3; animation:hudPulse 3s ease-in-out infinite; pointer-events:none; }
        .hud-corner-teal { border-color:rgba(90,189,181,.40) !important; animation:tealPulse 3.5s ease-in-out infinite !important; }
        .deco-star { position:fixed; z-index:2; pointer-events:none; animation:upulse 3s ease-in-out infinite; color:#d4b06a; }
        .float-win { position:fixed; z-index:9999; display:flex; flex-direction:column; border-radius:10px; overflow:hidden; border:1px solid rgba(232,160,85,.35); box-shadow:0 0 0 1px rgba(0,0,0,.8),0 12px 55px rgba(0,0,0,.82),0 0 36px rgba(232,160,85,.08),inset 0 1px 0 rgba(232,160,85,.10); background:#0f0804; animation:winFadeIn .18s ease-out; }
        .float-win-titlebar { display:flex; align-items:center; justify-content:space-between; padding:.38rem .7rem; cursor:grab; flex-shrink:0; background:linear-gradient(135deg,rgba(232,160,85,.10) 0%,rgba(16,9,3,.94) 60%,rgba(232,160,85,.04) 100%); border-bottom:1px solid rgba(232,160,85,.16); user-select:none; position:relative; }
        .float-win-titlebar::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(232,160,85,.40) 30%,rgba(212,176,106,.58) 50%,rgba(232,160,85,.40) 70%,transparent); }
        .float-win-titlebar:active { cursor:grabbing; }
        .float-win-btns { display:flex; align-items:center; gap:7px; }
        .float-win-btn { width:22px; height:22px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.7rem; line-height:1; transition:all .18s; position:relative; }
        .float-win-btn:hover  { transform:scale(1.16); filter:brightness(1.22); }
        .float-win-btn:active { transform:scale(.90); }
        .float-win-btn::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 7px); left:50%; transform:translateX(-50%) scale(.85); opacity:0; pointer-events:none; transition:all .15s; background:rgba(14,8,2,.94); color:#e8a055; font-family:'Nunito',sans-serif; font-size:.52rem; font-weight:800; white-space:nowrap; padding:3px 8px; border-radius:6px; border:1px solid rgba(232,160,85,.24); box-shadow:0 4px 12px rgba(0,0,0,.55); }
        .float-win-btn:hover::after { opacity:1; transform:translateX(-50%) scale(1); }
        .float-win-btn-close { background:#ff5f57; box-shadow:0 0 7px rgba(255,95,87,.45); color:rgba(120,0,0,0); }
        .float-win-btn-close:hover { color:rgba(120,0,0,.82); }
        .float-win-btn-min  { background:#f0a500; box-shadow:0 0 7px rgba(240,165,0,.45); color:rgba(100,60,0,0); }
        .float-win-btn-min:hover { color:rgba(100,60,0,.82); }
        .float-win-btn-max  { background:#4ddc64; box-shadow:0 0 7px rgba(77,220,100,.45); color:rgba(0,80,0,0); }
        .float-win-btn-max:hover { color:rgba(0,80,0,.82); }
        .float-win-resize { position:absolute; bottom:0; right:0; width:20px; height:20px; cursor:nwse-resize; z-index:5; }
        .float-win-resize::before { content:''; position:absolute; bottom:3px; right:3px; width:10px; height:10px; border-right:2px solid rgba(232,160,85,.38); border-bottom:2px solid rgba(232,160,85,.38); border-radius:0 0 3px 0; }
        .nomad-bottombar { flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:.5rem 1.2rem; background:linear-gradient(180deg,rgba(16,9,3,.96) 0%,rgba(12,6,2,.98) 100%); border-top:1px solid rgba(232,160,85,.18); backdrop-filter:blur(20px); position:relative; z-index:20; gap:1rem; }
        .nomad-bottombar::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(232,160,85,.42) 20%,rgba(212,176,106,.70) 50%,rgba(232,160,85,.42) 80%,transparent); }
        .nomad-upload-btn { position:relative; display:flex; align-items:center; gap:.6rem; padding:.5rem 1.5rem .5rem 1.15rem; border:none; border-radius:10px; cursor:pointer; font-family:'Cinzel',serif; font-size:.75rem; font-weight:700; letter-spacing:.1em; color:#1c1008; background:linear-gradient(105deg,#6a3200 0%,#c47840 30%,#e8a055 50%,#c47840 70%,#6a3200 100%); background-size:200% auto; animation:amberShimmer 3s linear infinite,uploadGlow 2.8s ease-in-out infinite; box-shadow:0 0 14px rgba(232,160,85,.22),0 4px 18px rgba(0,0,0,.50),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.18); transition:transform .18s,filter .18s; overflow:hidden; white-space:nowrap; min-width:170px; user-select:none; }
        .nomad-upload-btn:hover:not(:disabled) { transform:translateY(-2px) scale(1.03); filter:brightness(1.08); }
        .nomad-upload-btn:active:not(:disabled) { transform:translateY(0) scale(.97); }
        .nomad-upload-btn:disabled { cursor:not-allowed; filter:saturate(.35) brightness(.65); animation:none; }
        .nomad-upload-btn::before { content:''; position:absolute; top:0; left:-120%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent); transition:left .55s ease; pointer-events:none; border-radius:10px; }
        .nomad-upload-btn:hover::before { left:180%; }
        .nomad-upload-btn::after { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent); }
        .nomad-upload-btn.is-success { background:linear-gradient(105deg,#0d3d1a 0%,#1e7a38 30%,#4ddc70 50%,#1e7a38 70%,#0d3d1a 100%); animation:successPop .35s ease; color:#001a08; }
        .nomad-upload-btn.is-error   { background:linear-gradient(105deg,#3d0d0d 0%,#9b2020 30%,#e05050 50%,#9b2020 70%,#3d0d0d 100%); color:#1a0000; animation:none; }
        .nu-icon { width:22px; height:22px; border-radius:6px; flex-shrink:0; background:rgba(0,0,0,.18); border:1px solid rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center; font-size:.85rem; box-shadow:inset 0 1px 0 rgba(255,255,255,.12); }
        .nu-icon.spin { animation:uploadSpin .7s linear infinite; }
        .nu-progress  { position:absolute; bottom:0; left:0; height:3px; border-radius:0 0 10px 10px; background:linear-gradient(90deg,rgba(255,255,255,.38),rgba(255,255,255,.82),rgba(255,255,255,.38)); background-size:200% 100%; animation:progressFlow .8s linear infinite; transition:width .25s ease; }
        .nomad-tool-btn { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:rgba(232,160,85,.05); border:1px solid rgba(232,160,85,.16) !important; color:#d4b06a; cursor:pointer; font-size:.95rem; transition:all .18s; flex-shrink:0; }
        .nomad-tool-btn:hover  { background:rgba(232,160,85,.14); color:#e8a055; transform:translateY(-1px); }
        .nomad-tool-btn:active { transform:scale(.90); }
        [data-tut] { position: relative; }
    `}</style>
);

const G = a => `rgba(232,160,85,${a})`;
const GT = a => `rgba(90,189,181,${a})`;

// ═══════════════════════════════════════════
// WEBOTS 3D VIEWER
// ═══════════════════════════════════════════
const WebotsViewer = ({ wsUrl, fallbackSrc, onLog, onReady, onDisconnect }) => {
    const containerRef = useRef(null);
    const viewRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loadWebotsView()
            .then(() => {
                if (cancelled || !containerRef.current) return;
                const view = document.createElement('webots-view');
                view.style.cssText = 'width:100%;height:100%;display:block;border-radius:8px;';
                view.showWorldSelection = false;
                view.showQuit = false;
                view.showReset = false;
                view.showIde = false;
                view.showRobotWindow = false;
                view.showStep = false;
                view.showTerminal = false;
                view.onready = () => { if (cancelled) return; setLoading(false); onLog('✅ Scène 3D — orbit activé !'); onReady?.(); };
                view.ondisconnect = () => { if (cancelled) return; onLog('⚠️ Streaming 3D déconnecté'); onDisconnect?.(); };
                containerRef.current.appendChild(view);
                viewRef.current = view;
                view.connect(wsUrl, 'w3d', true, false, 600, null);
                onLog('🔄 Connexion streaming 3D…');
            })
            .catch(() => { if (cancelled) return; setLoading(false); setUseFallback(true); onLog('⚠️ Fallback MJPEG'); });
        return () => {
            cancelled = true;
            if (viewRef.current) { try { viewRef.current.close(); } catch (_) { } try { viewRef.current.remove(); } catch (_) { } viewRef.current = null; }
        };
    }, [wsUrl]); // eslint-disable-line

    if (useFallback) return <img src={fallbackSrc} alt="MJPEG" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '8px' }} onError={() => onLog('⚠️ MJPEG non disponible')} />;
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            {loading && <div className="stream-loading"><div className="stream-spinner" /><div className="stream-loading-text">Connexion 3D Webots…<br /><span style={{ opacity: .5, fontSize: '.48rem' }}>{wsUrl}</span></div></div>}
        </div>
    );
};

// ═══════════════════════════════════════════
// QR CODE WINDOW — code brut
// ═══════════════════════════════════════════
const QrCodeFloatingWindow = ({ code, onClose }) => {
    const QR_SIZE = 260;
    const [pos, setPos] = useState({ x: safe(vw() - 420, 860), y: 80 });
    const [minimized, setMinimized] = useState(false);
    const canvasRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [err, setErr] = useState('');
    const [downloaded, setDownloaded] = useState(false);
    const MAX = 2953;
    const payload = (code || '').trim();
    const pct = Math.min(100, Math.round((payload.length / MAX) * 100));
    const over = payload.length > MAX;

    useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);

    const loadLib = () => new Promise((res, rej) => {
        if (window.QRCode) return res();
        // Suppress cross-origin "Script error." during QRCode lib load
        const prevOnError = window.onerror;
        const guard = { active: true };
        window.onerror = (msg, src, line, col, err) => {
            if (guard.active && msg === 'Script error.') return true;
            return prevOnError ? prevOnError(msg, src, line, col, err) : false;
        };
        const cleanup = () => { guard.active = false; window.onerror = prevOnError; };
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.crossOrigin = 'anonymous';
        s.onload = () => { cleanup(); res(); };
        s.onerror = () => { cleanup(); rej(new Error('QRCode lib load failed')); };
        document.head.appendChild(s);
    });

    useEffect(() => {
        if (!payload || over) { setErr(over ? `Code trop long (${payload.length}/${MAX}).` : 'Aucun code.'); return; }
        setErr(''); setReady(false);
        loadLib().then(() => {
            const tmp = document.createElement('div'); tmp.style.display = 'none'; document.body.appendChild(tmp);
            try {
                new window.QRCode(tmp, { text: payload, width: QR_SIZE, height: QR_SIZE, correctLevel: window.QRCode.CorrectLevel.M });
                setTimeout(() => {
                    const canvas = canvasRef.current; if (!canvas) return;
                    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
                    const src = tmp.querySelector('canvas') || tmp.querySelector('img');
                    const draw = el => { ctx.drawImage(el, 0, 0, QR_SIZE, QR_SIZE); setReady(true); document.body.removeChild(tmp); };
                    if (src?.tagName === 'CANVAS') draw(src); else if (src) { const i = new Image(); i.onload = () => draw(i); i.src = src.src; }
                }, 150);
            } catch (e) { setErr('Erreur QR : ' + e.message); document.body.removeChild(tmp); }
        }).catch(() => setErr('Impossible de charger la librairie QR.'));
    }, [payload]); // eslint-disable-line

    const download = () => { const a = document.createElement('a'); a.download = 'openbot-code.png'; a.href = canvasRef.current.toDataURL('image/png'); a.click(); setDownloaded(true); setTimeout(() => setDownloaded(false), 2000); };
    const drag = e => {
        if (e.target.closest('.float-win-btn')) return; e.preventDefault();
        const sx = e.clientX - pos.x, sy = e.clientY - pos.y;
        const mv = ev => setPos({ x: safe(ev.clientX - sx, pos.x), y: safe(ev.clientY - sy, pos.y) });
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    };

    return (
        <div className="float-win" style={{ left: safe(pos.x, 860), top: safe(pos.y, 80), width: 320, height: minimized ? 42 : 'auto', zIndex: 10000 }}>
            <div className="float-win-titlebar" onMouseDown={drag}>
                <div className="float-win-btns">
                    <button className="float-win-btn float-win-btn-close" onClick={onClose} data-tip="Fermer">✕</button>
                    <button className="float-win-btn float-win-btn-min" onClick={() => setMinimized(m => !m)} data-tip={minimized ? 'Restaurer' : 'Réduire'}>{minimized ? '▲' : '▬'}</button>
                </div>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.6rem', color: GT(.75), letterSpacing: '.1em' }}>📱 QR OPENBOT</span>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.36rem', color: G(.25) }}>ESC</span>
            </div>
            {!minimized && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '.9rem 1rem 1rem', gap: '.6rem', background: 'linear-gradient(180deg,rgba(14,8,2,.97) 0%,rgba(10,5,1,1) 100%)' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.44rem', color: over ? '#ef4444' : G(.48) }}>{payload.length} / {MAX}</span>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.44rem', color: G(.32) }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: 3, background: G(.10), borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: over ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e', transition: 'width .3s' }} />
                        </div>
                    </div>
                    {err && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '.48rem', color: '#ef4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.22)', borderRadius: 5, padding: '.35rem .6rem', textAlign: 'center', width: '100%' }}>{err}</div>}
                    {!err && (
                        <div style={{ position: 'relative', background: '#fff', borderRadius: 10, padding: 10, animation: 'qrPulse 2.5s ease-in-out infinite', overflow: 'hidden', flexShrink: 0 }}>
                            <canvas ref={canvasRef} width={QR_SIZE} height={QR_SIZE} style={{ display: ready ? 'block' : 'none', borderRadius: 6 }} />
                            {!ready && <div style={{ width: QR_SIZE, height: QR_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '.5rem', background: '#fff' }}><div style={{ width: 28, height: 28, border: `2px solid ${G(.28)}`, borderTopColor: '#e8a055', borderRadius: '50%', animation: 'uploadSpin .7s linear infinite' }} /><span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.44rem', color: 'rgba(0,0,0,.38)' }}>Génération…</span></div>}
                            {ready && <div style={{ position: 'absolute', left: 10, right: 10, height: 2, background: `linear-gradient(90deg,transparent,${G(.85)},transparent)`, animation: 'scanLine 2s ease-in-out infinite', pointerEvents: 'none', borderRadius: 1 }} />}
                        </div>
                    )}
                    {[{ n: '1', t: "Ouvre l'app OpenBot" }, { n: '2', t: 'Programs → ⊡ Scan QR' }, { n: '3', t: 'Scanne → ▶ Run → Robot bouge !' }].map(({ n, t }) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '.45rem', padding: '.2rem .45rem', background: G(.04), borderRadius: 5, border: `1px solid ${G(.10)}` }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: G(.14), border: `1px solid ${G(.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel',serif", fontSize: '.5rem', color: '#e8a055', flexShrink: 0 }}>{n}</div>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.44rem', color: G(.62) }}>{t}</span>
                        </div>
                    ))}
                    {ready && (
                        <div style={{ display: 'flex', gap: '.5rem', width: '100%' }}>
                            <button onClick={download} style={{ flex: 1, padding: '.32rem 0', borderRadius: 5, border: `1px solid ${G(.32)}`, background: G(.08), color: '#e8a055', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '.55rem', fontWeight: 600, transition: 'all .18s' }}
                                onMouseEnter={e => { e.target.style.background = G(.18); }} onMouseLeave={e => { e.target.style.background = G(.08); }}>
                                {downloaded ? '✓ Téléchargé !' : '↓ Télécharger PNG'}
                            </button>
                            <button onClick={onClose} style={{ flex: 1, padding: '.32rem 0', borderRadius: 5, border: `1px solid ${G(.18)}`, background: G(.04), color: G(.52), cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '.55rem', fontWeight: 600, transition: 'all .18s' }}
                                onMouseEnter={e => { e.target.style.background = G(.12); }} onMouseLeave={e => { e.target.style.background = G(.04); }}>
                                ✕ Fermer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// QR DRIVE WINDOW
// ═══════════════════════════════════════════
const QrFloatingWindow = ({ driveLink, onClose }) => {
    const [pos, setPos] = useState({ x: safe(vw() / 2 - 200, 440), y: safe(vh() / 2 - 200, 200) });
    const [minimized, setMinimized] = useState(false);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(driveLink)}&color=000000&bgcolor=ffffff&margin=10`;
    useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
    const drag = e => {
        if (e.target.closest('.float-win-btn')) return; e.preventDefault();
        const sx = e.clientX - pos.x, sy = e.clientY - pos.y;
        const mv = ev => setPos({ x: safe(ev.clientX - sx, pos.x), y: safe(ev.clientY - sy, pos.y) });
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    };
    return (
        <div className="float-win" style={{ left: safe(pos.x, 440), top: safe(pos.y, 200), width: 400, height: minimized ? 42 : 'auto' }}>
            <div className="float-win-titlebar" onMouseDown={drag}>
                <div className="float-win-btns">
                    <button className="float-win-btn float-win-btn-close" onClick={onClose} data-tip="Fermer">✕</button>
                    <button className="float-win-btn float-win-btn-min" onClick={() => setMinimized(m => !m)} data-tip={minimized ? 'Restaurer' : 'Réduire'}>{minimized ? '▲' : '▬'}</button>
                </div>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.62rem', color: GT(.70), letterSpacing: '.1em' }}>📱 QR CODE OPENBOT</span>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.38rem', color: G(.25) }}>ESC</span>
            </div>
            {!minimized && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 1.2rem 1.2rem', gap: '.75rem', background: 'linear-gradient(180deg,rgba(14,8,2,.96) 0%,rgba(10,5,1,.99) 100%)' }}>
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', animation: 'qrPulse 2.5s ease-in-out infinite' }}>
                        <div style={{ background: 'white', borderRadius: '10px', padding: '8px' }}>
                            <img src={qrUrl} alt="QR" width={220} height={220} style={{ display: 'block', borderRadius: '6px' }} />
                        </div>
                        <div style={{ position: 'absolute', left: 8, right: 8, height: '2px', background: `linear-gradient(90deg,transparent,${G(.85)},transparent)`, animation: 'scanLine 2s ease-in-out infinite', pointerEvents: 'none', borderRadius: '1px' }} />
                    </div>
                    {[{ n: '1', t: "Ouvre l'app OpenBot" }, { n: '2', t: 'Programs → ⊡ Scan' }, { n: '3', t: 'Scanne ce QR code' }, { n: '4', t: '▶ Run → Robot bouge !' }].map(({ n, t }) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.2rem .5rem', background: G(.04), borderRadius: '5px', border: `1px solid ${G(.10)}`, width: '100%' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: G(.14), border: `1px solid ${G(.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel',serif", fontSize: '.52rem', color: '#e8a055', flexShrink: 0 }}>{n}</div>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.46rem', color: G(.62) }}>{t}</span>
                        </div>
                    ))}
                    <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Space Mono',monospace", fontSize: '.42rem', color: GT(.68), textDecoration: 'none', background: GT(.06), border: `1px solid ${GT(.20)}`, borderRadius: '6px', padding: '.22rem .6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', width: '100%', textAlign: 'center' }}>🔗 Google Drive</a>
                    <button onClick={onClose} style={{ width: '100%', background: G(.08), border: `1px solid ${G(.26)}`, borderRadius: '7px', color: '#e8a055', cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '.65rem', fontWeight: 600, padding: '.35rem 1rem', transition: 'all .18s', letterSpacing: '.06em' }}
                        onMouseEnter={e => { e.target.style.background = G(.16); }} onMouseLeave={e => { e.target.style.background = G(.08); }}>
                        ✕ Fermer (ESC)
                    </button>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// UPLOAD BUTTON
// ═══════════════════════════════════════════
const NomadUploadButton = () => {
    const [state, setState] = useState('idle');
    const [progress, setProgress] = useState(0);
    const { isOnline, setGenerateCode, generate, setCode, setDrawer, workspace, setIsError, setCategory, setDriveLink } = useContext(StoreContext);
    const { addScore, POINTS } = useGameScore();

    function handlingMultipleAIBlocks(start) {
        let child = [], all = [], conf = [];
        if (start.length && start[0].childBlocks_.length > 0) {
            all = handleChildBlockInWorkspace(start[0].childBlocks_, child);
            for (let i = 0; i < all.length; i++) { if (aiBlocks.includes(all[i])) conf.push(all[i]); else if (all[i] === PlaygroundConstants.disableAI) conf.pop(); if (conf.length > 1) return true; }
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
            if (!currentProj) { const fb = { projectName, xmlValue: '', storage: 'local', createdDate: new Date().toLocaleDateString() }; localStorage.setItem('currentProject', JSON.stringify(fb)); currentProj = fb; }
            else if (!currentProj.projectName?.trim()) { currentProj.projectName = projectName; localStorage.setItem('currentProject', JSON.stringify(currentProj)); }
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
            if (motEnabled.length) { o1 = motEnabled[0].getFieldValue(PlaygroundConstants.labels1); o2 = motEnabled[0].getFieldValue(PlaygroundConstants.labels2); }
            if (!start.length && !forever.length && !detection.length && !varDet.length) throw new Error(Errors.error1);
            if (isAdjAI && start.length) throw new Error(Errors.error2);
            if (o1 === o2) throw new Error(Errors.error3);
            if (foreverHasAI) throw new Error(Errors.error4);
            if (hasDupLabels) throw new Error(Errors.error5);
            setProgress(35);
            let clean = code.replace(/\/\/.*$/gm, '');
            if (start.length) clean += '\nstart();';
            if (forever.length) clean += '\nforever();';
            setGenerateCode(!generate); setProgress(55);
            const link = await uploadToGoogleDrive(clean, 'js'); setProgress(78);
            await uploadToGoogleDrive({ projectName: getCurrentProject().projectName, xmlValue: getCurrentProject().xmlValue || '', createdDate: new Date().toLocaleDateString() }, 'xml');
            setProgress(100);
            if (link) { setDriveLink(link); }
            setCode({ driveLink: link, projectName: getCurrentProject().projectName });
            setCategory(Constants.qr); setState('success'); addScore(POINTS.upload);
            setTimeout(() => { setState('idle'); setProgress(0); }, 2400);
        } catch (err) { setState('error'); setIsError(true); errorToast(err.message || 'Upload failed'); setTimeout(() => { setState('idle'); setProgress(0); }, 2000); }
    };

    const STATES = { idle: { icon: '⬆', label: 'Upload Code' }, loading: { icon: '⟳', label: 'Envoi...' }, success: { icon: '✓', label: 'Envoyé !' }, error: { icon: '✕', label: 'Erreur !' } };
    const { icon, label } = STATES[state];
    return (
        <button className={`nomad-upload-btn${state === 'success' ? ' is-success' : state === 'error' ? ' is-error' : ''}`} onClick={handleUpload} disabled={state === 'loading'} title="Compiler → Google Drive → QR OpenBot">
            <span className={`nu-icon${state === 'loading' ? ' spin' : ''}`}>{icon}</span>
            {label}
            {state === 'loading' && <div className="nu-progress" style={{ width: `${progress}%` }} />}
        </button>
    );
};

// ═══════════════════════════════════════════
// FLOATING WINDOW — MJPEG détaché
// ═══════════════════════════════════════════
const FloatingWindow = ({ win, onUpdate, onClose, streamSrc, onStreamError }) => {
    const isMinimized = win.h <= 42;
    const isMaximized = win.w >= vw() - 50 && win.h >= vh() - 50;
    const imgRef = useRef(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (isMinimized) return;
        const img = imgRef.current; if (!img) return;
        img.src = streamSrc;
        const wd = setInterval(() => { if (img?.naturalWidth === 0) img.src = streamSrc + '?t=' + Date.now(); }, 3000);
        return () => clearInterval(wd);
    }, [isMinimized, streamSrc]);

    useEffect(() => { const k = e => { if (e.key === 'Escape') { zoom > 1 ? setZoom(1) : onClose(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [zoom, onClose]);
    const onWheel = e => { e.preventDefault(); setZoom(z => Math.min(3, Math.max(0.4, z + (e.deltaY < 0 ? .12 : -.12)))); };
    const drag = e => {
        if (e.target.closest('.float-win-btn,.float-win-resize,.float-win-zoom')) return; e.preventDefault();
        const sx = e.clientX - win.x, sy = e.clientY - win.y;
        const mv = ev => onUpdate(f => ({ ...f, x: safe(ev.clientX - sx, f.x), y: safe(ev.clientY - sy, f.y) }));
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    };
    const resize = e => {
        e.preventDefault(); e.stopPropagation();
        const [sx, sy, sw, sh] = [e.clientX, e.clientY, win.w, win.h];
        const mv = ev => onUpdate(f => ({ ...f, w: Math.max(320, safe(sw + ev.clientX - sx, sw)), h: Math.max(260, safe(sh + ev.clientY - sy, sh)) }));
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    };
    const maximize = () => onUpdate(f => ({ ...f, _prevX: f.x, _prevY: f.y, _prevW: f.w, _prevH: isMinimized ? (f._prevH || 480) : f.h, x: 0, y: 0, w: vw(), h: vh() }));
    const restore = () => onUpdate(f => ({ ...f, x: safe(f._prevX, 80), y: safe(f._prevY, 80), w: safe(f._prevW, 720), h: safe(f._prevH, 480) }));
    const minimize = () => onUpdate(f => ({ ...f, _prevH: isMinimized ? (f._prevH || 480) : f.h, h: 42 }));

    return (
        <div className="float-win" style={{ left: safe(win.x, 80), top: safe(win.y, 80), width: safe(win.w, 720), height: safe(win.h, 480), transition: isMaximized ? 'all .22s cubic-bezier(.4,0,.2,1)' : 'none' }}>
            <div className="float-win-titlebar" onMouseDown={drag} onDoubleClick={e => { if (!e.target.closest('.float-win-btn')) isMaximized ? restore() : maximize(); }}>
                <div className="float-win-btns">
                    <button className="float-win-btn float-win-btn-close" onClick={onClose} data-tip="Fermer">✕</button>
                    <button className="float-win-btn float-win-btn-min" onClick={isMinimized ? restore : minimize} data-tip={isMinimized ? 'Restaurer' : 'Réduire'}>{isMinimized ? '▲' : '▬'}</button>
                    <button className="float-win-btn float-win-btn-max" onClick={isMaximized ? restore : maximize} data-tip={isMaximized ? 'Restaurer' : 'Agrandir'}>{isMaximized ? '❐' : '⛶'}</button>
                </div>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.62rem', color: G(.62), letterSpacing: '.1em' }}>VUE SCÈNE — MJPEG</span>
                    <span style={{ fontSize: '.42rem', background: GT(.10), border: `1px solid ${GT(.22)}`, borderRadius: '4px', padding: '1px 5px', color: GT(.55), fontFamily: "'Space Mono',monospace" }}>LIVE</span>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.4rem', color: G(.25) }}>{Math.round(safe(win.w, 720))}×{Math.round(safe(win.h, 480))}</span>
            </div>
            {!isMinimized && (
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#080400', minHeight: 0 }} onWheel={onWheel}>
                    <div style={{ position: 'absolute', top: 8, left: 9, zIndex: 4, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.62)', padding: '2px 8px', borderRadius: 20, backdropFilter: 'blur(6px)' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff3333', boxShadow: '0 0 6px #ff3333', animation: 'blink 1s ease-in-out infinite' }} />
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.45rem', color: 'rgba(255,255,255,.82)', fontWeight: 700 }}>REC</span>
                    </div>
                    <div className="float-win-zoom" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.68)', backdropFilter: 'blur(8px)', border: `1px solid ${G(.22)}`, borderRadius: 20, padding: '3px 10px' }}>
                        <button onClick={() => setZoom(z => Math.max(0.4, +(z - .2).toFixed(1)))} style={{ background: 'none', border: 'none', color: '#e8a055', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, padding: '0 2px' }}>−</button>
                        <span onClick={() => setZoom(1)} style={{ fontFamily: "'Space Mono',monospace", fontSize: '.5rem', color: zoom !== 1 ? '#f0ddb8' : G(.48), cursor: 'pointer', minWidth: 28, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, +(z + .2).toFixed(1)))} style={{ background: 'none', border: 'none', color: '#e8a055', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, padding: '0 2px' }}>+</button>
                    </div>
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.030) 3px,rgba(0,0,0,.030) 4px)' }} />
                    {[{ top: 0, left: 0, borderWidth: '1.5px 0 0 1.5px' }, { top: 0, right: 0, borderWidth: '1.5px 1.5px 0 0' }, { bottom: 0, left: 0, borderWidth: '0 0 1.5px 1.5px' }, { bottom: 0, right: 0, borderWidth: '0 1.5px 1.5px 0' }].map((s, i) => (
                        <div key={i} style={{ position: 'absolute', width: 16, height: 16, zIndex: 4, borderStyle: 'solid', borderColor: i % 2 === 0 ? G(.38) : GT(.32), pointerEvents: 'none', ...s }} />
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
// LEVEL UP OVERLAY
// ═══════════════════════════════════════════
const LevelUpOverlayInline = () => {
    const { levelUpInfo, dismissLevelUp } = useGameScore();
    if (!levelUpInfo) return null;
    const { newLevel } = levelUpInfo;
    return (
        <div onClick={dismissLevelUp} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', cursor: 'pointer' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(160deg,#140900,#1e1005)', border: `1px solid ${G(.48)}`, borderRadius: 18, padding: '2.2rem 3rem', textAlign: 'center', minWidth: 280, animation: 'nvLevelOverlay .35s cubic-bezier(.34,1.56,.64,1)', boxShadow: `0 0 55px ${G(.22)},0 20px 55px rgba(0,0,0,.8)`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#e8a055 40%,#f0ddb8 50%,#e8a055 60%,transparent)' }} />
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.65rem', color: G(.68), letterSpacing: '.18em', marginBottom: '.5rem' }}>NIVEAU ATTEINT !</div>
                <div style={{ background: 'linear-gradient(135deg,#6a3200,#c47840,#e8a055,#c47840,#6a3200)', backgroundSize: '200% auto', animation: 'amberShimmer 3s linear infinite', borderRadius: 12, padding: '1rem 2rem', margin: '.6rem auto', display: 'inline-block' }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.55rem', color: '#3a1800', letterSpacing: '.15em' }}>LEVEL</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '3rem', fontWeight: 800, color: '#1c0c00', lineHeight: 1 }}>{newLevel}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '.6rem 0' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: '1.4rem', color: i < newLevel ? '#e8a055' : G(.18), display: 'inline-block', animation: i < newLevel ? `nvStarRain 0.5s ${i * 0.1}s ease both` : 'none' }}>★</span>
                    ))}
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: '.68rem', color: G(.52), marginBottom: '1rem' }}>Continue à coder !</div>
                <button onClick={dismissLevelUp} style={{ background: 'linear-gradient(135deg,#6a3200,#c47840,#e8a055,#c47840,#6a3200)', backgroundSize: '200% auto', animation: 'amberShimmer 3s linear infinite', border: 'none', borderRadius: 8, padding: '.5rem 1.8rem', fontFamily: "'Cinzel',serif", fontSize: '.7rem', fontWeight: 700, color: '#1c0c00', cursor: 'pointer', letterSpacing: '.08em' }}>Continuer ▶</button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#e8a055 40%,#f0ddb8 50%,#e8a055 60%,transparent)' }} />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// PLAYGROUND INNER
// ═══════════════════════════════════════════
function PlaygroundInner() {
    const { category, setCategory, driveLink } = useContext(StoreContext);
    const { addScore, POINTS } = useGameScore();

    const [simStatus, setSimStatus] = useState('offline');
    const [wsUrl, setWsUrl] = useState('ws://197.5.193.210:8765');
    const [streamWsUrl, setStreamWsUrl] = useState(WEBOTS_WS);
    const [viewMode, setViewMode] = useState('3d');
    const [wsLog, setWsLog] = useState('⏳ Démarrage de Webots…');
    const [floatWin, setFloatWin] = useState({ open: false, x: 80, y: 80, w: 720, h: 480, _prevH: 480 });
    const [showQr, setShowQr] = useState(false);
    const [currentCode, setCurrentCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    const blocklyRef = useRef(null);
    const editorRef = useRef(null);
    const simulatorRef = useRef(null);
    const bottomBarRef = useRef(null);
    const uploadRef = useRef(null);
    const wsRef = useRef(null);
    const keysRef = useRef({});
    const reconnTimerRef = useRef(null);
    const userIdRef = useRef('user_' + Math.random().toString(36).slice(2, 8));

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const SC = simStatus === 'online' ? '#4ddc64' : simStatus === 'connecting' ? '#f0a500' : '#e8a055';
    const SL = simStatus === 'online' ? 'CONNECTÉ' : simStatus === 'connecting' ? 'CONNEXION...' : 'OFFLINE';

    const doUndo = () => { const ws = getBlocklyWorkspace(); if (ws?.getUndoStack().length) ws.undo(false); };
    const doRedo = () => { const ws = getBlocklyWorkspace(); if (ws?.redoStack_?.length) ws.undo(true); };
    const doZoomI = () => getBlocklyWorkspace()?.zoom(1, 2, 1.5);
    const doZoomO = () => getBlocklyWorkspace()?.zoom(1, 2, -1.5);

    const handleShowQr = useCallback(() => {
        if (!driveLink) {
            try {
                const ws = getBlocklyWorkspace();
                if (ws) {
                    let code = javascriptGenerator.workspaceToCode(ws).replace(/\/\/.*$/gm, '').trim();
                    const start = ws.getBlocksByType(PlaygroundConstants.start);
                    const forever = ws.getBlocksByType(PlaygroundConstants.forever);
                    if (start.length) code += '\nstart();';
                    if (forever.length) code += '\nforever();';
                    setCurrentCode(code);
                } else {
                    setCurrentCode(window.__currentPythonCode || '');
                }
            } catch {
                setCurrentCode(window.__currentPythonCode || '');
            }
        }
        setShowQr(v => !v);
    }, [driveLink]);

    const handleRun = useCallback(() => {
        if (isRunning) {
            try { ParserModule.stopBlocklyCode(); } catch (e) { console.warn(e); }
            setIsRunning(false);
            setWsLog('⏹ Programme arrêté.');
        } else {
            try {
                const ws = getBlocklyWorkspace();
                if (ws) {
                    ParserModule.runBlocklyCode(javascriptGenerator.workspaceToCode(ws));
                    setWsLog('▶ Programme lancé !');
                } else {
                    const c = window.__currentPythonCode || '';
                    if (c) ParserModule.runBlocklyCode(c);
                }
            } catch (e) {
                console.warn(e);
                const c = window.__currentPythonCode || '';
                if (c) ParserModule.runBlocklyCode(c);
            }
            setIsRunning(true);
            addScore(POINTS.run);
        }
    }, [isRunning, addScore, POINTS]);

    const ispy = category === 'py';

    useEffect(() => {
        let cancelled = false;
        const level = new URLSearchParams(window.location.search).get('level') || '1';
        const userId = userIdRef.current;
        setWsLog('🚀 Lancement Webots — niveau ' + level + '…');
        fetch(`${BACKEND}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, level }),
        })
            .then(r => r.json())
            .then(d => {
                if (cancelled) return;
                setWsLog(d.ok || d.message ? '✅ Webots lancé !' : '⚠️ ' + (d.error || 'Erreur backend'));
            })
            .catch(() => {
                if (cancelled) return;
                setWsLog('⚠️ Backend non disponible');
            });
        return () => {
            cancelled = true;
            fetch(`${BACKEND}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            }).catch(() => { });
        };
    }, []); // eslint-disable-line

    const connectWebots = useCallback(() => {
        if (reconnTimerRef.current) { clearTimeout(reconnTimerRef.current); reconnTimerRef.current = null; }
        if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
        if (!mountedRef.current) return;
        setSimStatus('connecting');
        setWsLog('🔄 Connexion commandes robot…');
        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            ws.onopen = () => {
                if (!mountedRef.current) return;
                setSimStatus('online');
                setWsLog('✅ Robot connecté !');
                ParserModule.initParser(ws);
                addScore(POINTS.connect);
            };
            ws.onerror = () => {
                if (!mountedRef.current) return;
                setSimStatus('offline');
                setWsLog('❌ Erreur connexion');
            };
            ws.onclose = () => {
                if (!mountedRef.current) return;
                setSimStatus('offline');
                setWsLog('⚠️ Déconnecté — reconnexion 3s…');
                reconnTimerRef.current = setTimeout(connectWebots, 3000);
            };
            ws.onmessage = e => {
                if (!mountedRef.current) return;
                if (typeof e.data === 'string' && !e.data.startsWith('CAM:') && !e.data.startsWith('POS:'))
                    setWsLog('📩 ' + e.data);
            };
        } catch (e) {
            if (!mountedRef.current) return;
            setSimStatus('offline');
            setWsLog('❌ ' + e.message);
            reconnTimerRef.current = setTimeout(connectWebots, 3000);
        }
    }, [wsUrl, addScore, POINTS]); // eslint-disable-line

    useEffect(() => {
        const t = setTimeout(() => connectWebots(), 2000);
        return () => {
            clearTimeout(t);
            if (reconnTimerRef.current) clearTimeout(reconnTimerRef.current);
            if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
        };
    }, []); // eslint-disable-line

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
        const dn = e => {
            if (keysRef.current[e.key]) return;
            keysRef.current[e.key] = true;
            const c = km[e.key];
            if (c) { e.preventDefault(); sendCmd(c); }
        };
        const up = e => {
            keysRef.current[e.key] = false;
            const c = km[e.key];
            if (c && c !== 'stop') sendCmd('stop');
        };
        window.addEventListener('keydown', dn);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', dn);
            window.removeEventListener('keyup', up);
        };
    }, []); // eslint-disable-line

    const sendCmd = cmd => {
        if (wsRef.current?.readyState === WebSocket.OPEN) { wsRef.current.send(cmd); setWsLog('✅ ' + cmd); }
        else setWsLog('❌ Non connecté !');
    };

    useEffect(() => {
        window.__tutorialRefs = { blockly: blocklyRef, editor: editorRef, simulator: simulatorRef, bottomBar: bottomBarRef, upload: uploadRef };
        return () => { window.__tutorialRefs = null; };
    }, []);

    const HUD_CORNERS = [
        { top: '16px', left: '16px', borderWidth: '1.5px 0 0 1.5px', animationDelay: '0s' },
        { top: '16px', right: '16px', borderWidth: '1.5px 1.5px 0 0', animationDelay: '.6s', className: 'hud-corner-teal' },
        { bottom: '16px', left: '16px', borderWidth: '0 0 1.5px 1.5px', animationDelay: '1.2s', className: 'hud-corner-teal' },
        { bottom: '16px', right: '16px', borderWidth: '0 1.5px 1.5px 0', animationDelay: '1.8s' },
    ];
    const DECO_STARS = [
        { top: '14%', left: '28%', fontSize: '1.2rem', animationDelay: '0s', icon: '✨' },
        { top: '70%', left: '62%', fontSize: '1.1rem', animationDelay: '1.2s', icon: '⭐' },
        { top: '32%', left: '83%', fontSize: '1.3rem', animationDelay: '2.4s', icon: '💫' },
        { top: '80%', left: '22%', fontSize: '1.1rem', animationDelay: '3s', icon: '🌟' },
    ];

    // ── Onglets vue : FPV supprimé ──
    const VIEW_TABS = [
        { id: '3d', icon: '🌐', label: '3D Orbit' },
        { id: 'mjpeg', icon: '🎬', label: 'MJPEG' },
    ];

    return (
        <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', fontFamily: "'Nunito',sans-serif" }}>
            <Styles />
            <StarCanvas />

            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(ellipse at 50% 108%, rgba(196,120,64,.50) 0%, transparent 46%), radial-gradient(ellipse at 12% 55%, rgba(232,160,85,.08) 0%, transparent 42%), radial-gradient(ellipse at 88% 15%, rgba(90,189,181,.06) 0%, transparent 40%), #1c1008` }} />
            <div style={{ position: 'fixed', top: '-8%', left: '-4%', width: '640px', height: '640px', borderRadius: '50%', background: `radial-gradient(circle,${G(.08)} 0%,transparent 70%)`, filter: 'blur(88px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', top: '-4%', right: '-4%', width: '520px', height: '520px', borderRadius: '50%', background: `radial-gradient(circle,${GT(.06)} 0%,transparent 70%)`, filter: 'blur(96px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-4%', left: '18%', width: '900px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,120,64,.28) 0%,transparent 70%)', filter: 'blur(105px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`, backgroundSize: '260px 260px', opacity: .055 }} />

            {HUD_CORNERS.map(({ className, ...s }, i) => (
                <div key={i} className={`hud-corner${className ? ' ' + className : ''}`} style={s} />
            ))}
            {DECO_STARS.map(({ icon, ...s }, i) => <div key={i} className="deco-star" style={s}>{icon}</div>)}

            <div style={{ position: 'fixed', top: '4%', right: '3%', zIndex: 2, pointerEvents: 'none', animation: 'ufloat 11s ease-in-out infinite' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%,#f0ddb8,#e8a055,#8a4800)', animation: 'orbPulse 4s ease-in-out infinite', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-14px', left: '-14px', width: '92px', height: '92px', borderRadius: '50%', border: `1px solid ${G(.18)}` }} />
                    <div style={{ position: 'absolute', top: '-24px', left: '-24px', width: '112px', height: '112px', borderRadius: '50%', border: `1px solid ${GT(.12)}` }} />
                </div>
            </div>
            <div style={{ position: 'fixed', top: '60%', left: '1.5%', fontSize: '2.4rem', zIndex: 2, pointerEvents: 'none', animation: 'udrift 9s ease-in-out infinite', filter: `drop-shadow(0 0 12px ${G(.55)})` }}>🐪</div>

            <svg style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '200px', zIndex: 1, pointerEvents: 'none', animation: 'sandDrift 18s ease-in-out infinite' }} viewBox="0 0 1440 200" preserveAspectRatio="none">
                <path d="M0,145 C200,82 380,158 570,108 C750,62 930,150 1110,98 C1230,64 1370,120 1440,88 L1440,200 L0,200 Z" fill={G(.08)} />
                <path d="M0,145 C200,82 380,158 570,108 C750,62 930,150 1110,98 C1230,64 1370,120 1440,88" stroke={G(.18)} strokeWidth="1.2" fill="none" />
                <path d="M0,168 C320,135 540,172 790,152 C990,136 1180,168 1440,148 L1440,200 L0,200 Z" fill="rgba(196,120,64,.10)" />
            </svg>

            {showQr && driveLink && <QrFloatingWindow driveLink={driveLink} onClose={() => setShowQr(false)} />}
            {showQr && !driveLink && <QrCodeFloatingWindow code={currentCode} onClose={() => setShowQr(false)} />}

            {floatWin.open && (
                <FloatingWindow win={floatWin} onUpdate={setFloatWin}
                    onClose={() => setFloatWin(f => ({ ...f, open: false }))}
                    streamSrc={STREAM_SCENE}
                    onStreamError={() => setWsLog('⚠️ Stream non disponible')} />
            )}

            <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                    {/* Blockly */}
                    <div ref={blocklyRef} data-tut="blockly" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <div className="ws-scan" />
                        <BlocklyComponent readOnly={false} move={{ scrollbars: true, drag: true, wheel: true }}
                            initialXml={`<xml xmlns="http://www.w3.org/1999/xhtml"><Block type="start" x="0" y="100"/><Block type="forever" x="250" y="100"/></xml>`}>
                            <Toolbox />
                        </BlocklyComponent>
                    </div>

                    {/* Panel droit */}
                    <div style={{ width: '44%', flexShrink: 0, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg,rgba(22,12,4,.80) 0%,rgba(16,8,2,.76) 50%,rgba(20,10,3,.80) 100%)`, backdropFilter: 'blur(18px) saturate(130%)', borderLeft: `1px solid ${G(.22)}`, minHeight: 0, boxShadow: `-2px 0 38px rgba(0,0,0,.48),inset 1px 0 0 ${G(.04)}` }}>

                        {/* Code editor */}
                        <div ref={editorRef} data-tut="editor" style={{ flex: '0 0 36%', display: 'flex', flexDirection: 'column', borderBottom: `1px solid ${G(.14)}`, overflow: 'hidden', minHeight: 0 }}>
                            <div className="panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{ispy ? '🐍' : '⚡'}</span>
                                    <span className="gold-shimmer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.8rem', fontWeight: '600', letterSpacing: '.1em' }}>{ispy ? 'CODE PYTHON' : 'CODE JAVASCRIPT'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                                    <button className="pb pb-qr" onClick={handleShowQr}
                                        style={{ display: 'flex', alignItems: 'center', gap: '.3rem', ...(driveLink ? { background: 'rgba(90,189,181,.18)', border: '1px solid rgba(90,189,181,.55) !important', color: '#5abdb5', boxShadow: '0 0 8px rgba(90,189,181,.28)' } : {}) }}
                                        title={driveLink ? 'QR Code Drive' : "QR — uploadez d'abord"}>
                                        {showQr ? '✕ QR' : (driveLink ? '📱 QR ✓' : '📱 QR')}
                                    </button>
                                    <button className="pb pb-gold" onClick={() => setCategory(ispy ? 'js' : 'py')}>{ispy ? '⚡ JS' : '🐍 PY'}</button>
                                    <div className="run-stop-group">
                                        <button className="pb-run" onClick={handleRun}>▶ Run</button>
                                        {isRunning && (<><div className="run-stop-divider" /><button className="pb-stop" onClick={handleRun}>⏹ Stop</button></>)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(10,5,1,.30)' }}>
                                <CodeEditor />
                            </div>
                        </div>

                        {/* Simulateur */}
                        <div ref={simulatorRef} data-tut="simulator" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                            <div className="panel-hdr">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>🤖</span>
                                    <span className="gold-shimmer" style={{ fontFamily: "'Cinzel',serif", fontSize: '.8rem', fontWeight: '600', letterSpacing: '.1em' }}>SIMULATEUR ROBOT</span>
                                </div>
                                <div className="status-badge" style={{ background: `${SC}12`, border: `1px solid ${SC}42`, color: SC, cursor: simStatus !== 'online' ? 'pointer' : 'default' }} onClick={simStatus !== 'online' ? connectWebots : undefined}>
                                    <div className="status-dot" style={{ background: SC, boxShadow: `0 0 6px ${SC}` }} />{SL}
                                </div>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.35rem', padding: '.45rem .55rem', background: 'rgba(10,5,1,.18)', minHeight: 0, overflow: 'hidden' }}>

                                {/* URL commandes robot */}
                                <div style={{ display: 'flex', gap: '.4rem', width: '100%', flexShrink: 0 }}>
                                    <input className="ws-input" value={wsUrl} onChange={e => setWsUrl(e.target.value)} placeholder="ws://197.5.193.210:8765" />
                                    <button className="btn-connect" onClick={connectWebots}>Connecter</button>
                                </div>

                                <div className="gold-divider" />

                                {/* Onglets 3D / MJPEG */}
                                <div style={{ display: 'flex', width: '100%', flexShrink: 0, gap: '.25rem' }}>
                                    {VIEW_TABS.map(({ id, icon, label }) => (
                                        <button key={id} onClick={() => setViewMode(id)} style={{
                                            flex: 1, padding: '.3rem 0', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                            fontFamily: "'Cinzel',serif", fontSize: '.55rem', fontWeight: 700, letterSpacing: '.05em', transition: 'all .18s',
                                            background: viewMode === id ? 'linear-gradient(135deg,rgba(232,160,85,.22),rgba(232,160,85,.12))' : 'rgba(232,160,85,.04)',
                                            color: viewMode === id ? '#e8a055' : 'rgba(212,176,106,.38)',
                                            borderBottom: viewMode === id ? '2px solid #e8a055' : '2px solid transparent',
                                            boxShadow: viewMode === id ? '0 0 8px rgba(232,160,85,.18)' : 'none',
                                        }}>
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Zone d'affichage */}
                                <div className="cam-frame">
                                    <div className="rec-badge"><div className="rec-dot" /><span className="rec-text">REC</span></div>
                                    <div className="cam-label">
                                        <span>{viewMode === '3d' ? '🌐 Vue 3D' : '🎬 MJPEG'}</span>
                                        <button className="btn-fs" onClick={() => setFloatWin(f => ({ ...f, open: true }))}>⛶</button>
                                    </div>
                                    <div className="cam-crt" />

                                    {/* Vue 3D — toujours montée */}
                                    <div style={{ position: 'absolute', inset: 0, display: viewMode === '3d' ? 'block' : 'none' }}>
                                        <WebotsViewer wsUrl={streamWsUrl} fallbackSrc={STREAM_SCENE} onLog={setWsLog} onReady={() => { if (mountedRef.current) setSimStatus('online'); }} onDisconnect={() => { if (mountedRef.current) setSimStatus('offline'); }} />
                                    </div>

                                    {/* Vue MJPEG */}
                                    {viewMode === 'mjpeg' && (
                                        <img src={STREAM_SCENE} alt="MJPEG"
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '8px' }}
                                            onError={() => setWsLog('⚠️ MJPEG non disponible')} />
                                    )}
                                </div>

                                {/* URL streaming 3D */}
                                <div style={{ display: 'flex', gap: '.4rem', width: '100%', flexShrink: 0 }}>
                                    <input className="ws-input" value={streamWsUrl} onChange={e => setStreamWsUrl(e.target.value)} placeholder="ws://localhost:1234" title="URL streaming 3D Webots" />
                                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '.48rem', color: GT(.55), display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>3D</span>
                                </div>

                                <div className="ws-log">{wsLog}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div ref={bottomBarRef} data-tut="bottomBar" className="nomad-bottombar">
                    <TutorialButton onClick={() => setShowTutorial(true)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                        <button className="nomad-tool-btn" onClick={doUndo} title="Annuler">↩</button>
                        <button className="nomad-tool-btn" onClick={doRedo} title="Rétablir">↪</button>
                        <div style={{ width: 1, height: 22, background: G(.16), margin: '0 .18rem' }} />
                        <button className="nomad-tool-btn" onClick={doZoomO} style={{ fontSize: '1.1rem', fontWeight: 700 }}>−</button>
                        <button className="nomad-tool-btn" onClick={doZoomI} style={{ fontSize: '1.1rem', fontWeight: 700 }}>+</button>
                    </div>
                    <div ref={uploadRef} data-tut="upload">
                        <NomadUploadButton />
                    </div>
                </div>
            </div>

            {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
            <LevelUpOverlayInline />
        </div>
    );
}

function Playground() {
    return (
        <GameProvider>
            <PlaygroundInner />
        </GameProvider>
    );
}

export default Playground;