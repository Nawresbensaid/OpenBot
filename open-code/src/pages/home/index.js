import { Header } from "../../components/navBar/header";
import React, { useEffect } from "react";
import { HomeCarousel } from "../../components/homeComponents/carousel/carousel";
import { NewProject } from "../../components/homeComponents/myProjects/newProject";
import CookiesComponent from "../../components/homeComponents/cookies/cookies";
import { updateLocalProjects } from "../../services/workspace";

// Même fond univers que le Playground
const UniversBG = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <style>{`
            @keyframes ufloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
            @keyframes ufloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
            @keyframes upulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
            @keyframes uorbit{from{transform:rotate(0deg) translateX(55px) rotate(0deg)}to{transform:rotate(360deg) translateX(55px) rotate(-360deg)}}
        `}</style>
        {/* Fond */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, #0d1b4b 0%, #030714 45%, #000008 100%)' }} />
        {/* Nébuleuses */}
        {[
            { t: '-8%', r: '8%', w: '520px', h: '520px', bg: 'rgba(167,139,250,.14)' },
            { t: 'auto', b: '8%', l: '3%', w: '640px', h: '440px', bg: 'rgba(20,80,200,.18)' },
            { t: '38%', r: '33%', w: '320px', h: '320px', bg: 'rgba(244,114,182,.09)' },
            { t: '15%', l: '30%', w: '280px', h: '280px', bg: 'rgba(52,211,153,.06)' },
        ].map((n, i) => (
            <div key={i} style={{ position: 'absolute', top: n.t, bottom: n.b, right: n.r, left: n.l, width: n.w, height: n.h, background: `radial-gradient(circle,${n.bg} 0%,transparent 70%)`, borderRadius: '50%', filter: 'blur(65px)' }} />
        ))}
        {/* Saturne */}
        <div style={{ position: 'absolute', top: '8%', right: '3%', animation: 'ufloat 10s ease-in-out infinite' }}>
            <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%, #fef3c7, #d97706, #92400e)', boxShadow: '0 0 35px rgba(251,191,36,.4)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '145px', height: '32px', border: '6px solid rgba(251,191,36,.38)', borderRadius: '50%', transform: 'translate(-50%,-50%) rotateX(65deg)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8', marginTop: '-6px', marginLeft: '-6px', animation: 'uorbit 6s linear infinite' }} />
            </div>
        </div>
        {/* Terre */}
        <div style={{ position: 'absolute', bottom: '10%', left: '1%', animation: 'ufloat2 12s 2s ease-in-out infinite' }}>
            <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #67e8f9, #0284c7, #1e3a5f)', boxShadow: '0 0 25px rgba(103,232,249,.4)' }} />
        </div>
        {/* Mars */}
        <div style={{ position: 'absolute', top: '50%', right: '1%', animation: 'ufloat 8s 1s ease-in-out infinite' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #fca5a5, #dc2626, #7f1d1d)', boxShadow: '0 0 18px rgba(252,165,165,.35)' }} />
        </div>
        {/* Étincelles */}
        {[{ t: '20%', l: '10%', d: '0s', e: '✨' }, { t: '60%', l: '50%', d: '1.2s', e: '⭐' }, { t: '30%', l: '80%', d: '2.4s', e: '💫' }, { t: '75%', l: '25%', d: '3s', e: '🌟' }].map((p, i) => (
            <div key={i} style={{ position: 'absolute', top: p.t, left: p.l, fontSize: '1.3rem', animation: `upulse 3s ${p.d} ease-in-out infinite` }}>{p.e}</div>
        ))}
    </div>
);

function Home() {
    useEffect(() => {
        updateLocalProjects();
    }, []);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', background: 'transparent' }}>
            <UniversBG />
            {/* Contenu par dessus le fond */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Header />
                <HomeCarousel />
                <NewProject />
                <CookiesComponent />
            </div>
        </div>
    );
}

export default Home;