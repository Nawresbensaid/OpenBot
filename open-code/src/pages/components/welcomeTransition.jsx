import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * WelcomeTransition
 * -----------------
 * Props :
 *   username  : string  — prénom/pseudo affiché ex: "KARIM"
 *   redirectTo: string  — route cible après la transition ex: "/home"
 *   onDone    : func    — callback optionnel appelé avant navigate
 */
export default function WelcomeTransition({ username = "NOMAD", redirectTo = "/home", onDone }) {
    const navigate = useNavigate();
    const [phase, setPhase] = useState(0);
    // 0 = invisible, 1 = letterbox, 2 = texte, 3 = fade out

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 100);
        const t2 = setTimeout(() => setPhase(2), 700);
        const t3 = setTimeout(() => setPhase(3), 3500);
        const t4 = setTimeout(() => {
            if (onDone) onDone();
            navigate(redirectTo);
        }, 4300);

        return () => [t1, t2, t3, t4].forEach(clearTimeout);
    }, []);

    return (
        <div style={{
            ...styles.overlay,
            opacity: phase === 3 ? 0 : 1,
            transition: phase === 3 ? "opacity 0.8s ease" : "opacity 0.5s ease",
        }}>

            {/* Letterbox haut */}
            <div style={{
                ...styles.letterboxTop,
                height: phase >= 1 ? "15%" : "0%",
                transition: "height 0.8s cubic-bezier(0.76,0,0.24,1)",
            }} />

            {/* Letterbox bas */}
            <div style={{
                ...styles.letterboxBottom,
                height: phase >= 1 ? "15%" : "0%",
                transition: "height 0.8s cubic-bezier(0.76,0,0.24,1)",
            }} />

            {/* Contenu central */}
            <div style={styles.center}>

                {/* Ligne fine */}
                <div style={{
                    ...styles.lineBar,
                    width: phase >= 2 ? "320px" : "0px",
                    transition: "width 1.2s ease 0.2s",
                }} />

                {/* Eyebrow */}
                <p style={{
                    ...styles.eyebrow,
                    opacity: phase >= 2 ? 1 : 0,
                    transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
                    transition: "all 0.9s ease 0.4s",
                }}>
                    THE DESERT AWAITS
                </p>

                {/* WELCOME + NOM */}
                <h2 style={{
                    ...styles.title,
                    opacity: phase >= 2 ? 1 : 0,
                    transform: phase >= 2 ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
                    transition: "all 1.1s ease 0.6s",
                }}>
                    WELCOME{" "}
                    <span style={styles.gold}>
                        {username.toUpperCase()}
                    </span>
                </h2>

                {/* Séparateur diamant */}
                <div style={{
                    ...styles.divider,
                    opacity: phase >= 2 ? 1 : 0,
                    transition: "opacity 0.8s ease 1s",
                }}>
                    <div style={styles.dividerLine} />
                    <div style={styles.dividerDiamond} />
                    <div style={styles.dividerLine} />
                </div>

                {/* Citation */}
                <p style={{
                    ...styles.quote,
                    opacity: phase >= 2 ? 1 : 0,
                    transform: phase >= 2 ? "translateY(0)" : "translateY(15px)",
                    transition: "all 0.9s ease 1.1s",
                }}>
                    "Your journey begins now"
                </p>

                {/* Ligne fine bas */}
                <div style={{
                    ...styles.lineBar,
                    width: phase >= 2 ? "320px" : "0px",
                    transition: "width 1.2s ease 1.3s",
                    marginTop: "28px",
                }} />

            </div>

            {/* Ornements coins (dans la zone entre les letterbox) */}
            {[
                { top: "18%", left: "40px", borderTop: "1px", borderLeft: "1px" },
                { top: "18%", right: "40px", borderTop: "1px", borderRight: "1px" },
                { bottom: "18%", left: "40px", borderBottom: "1px", borderLeft: "1px" },
                { bottom: "18%", right: "40px", borderBottom: "1px", borderRight: "1px" },
            ].map((pos, i) => (
                <div key={i} style={{
                    position: "absolute",
                    width: "28px", height: "28px",
                    borderStyle: "solid",
                    borderColor: "rgba(201,168,76,0.45)",
                    borderTopWidth: pos.borderTop || "0",
                    borderBottomWidth: pos.borderBottom || "0",
                    borderLeftWidth: pos.borderLeft || "0",
                    borderRightWidth: pos.borderRight || "0",
                    top: pos.top || "auto",
                    bottom: pos.bottom || "auto",
                    left: pos.left || "auto",
                    right: pos.right || "auto",
                    opacity: phase >= 1 ? 1 : 0,
                    transition: "opacity 0.8s ease 0.3s",
                    zIndex: 3,
                }} />
            ))}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Cormorant+Garamond:ital,wght@1,300&display=swap');
            `}</style>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(3px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "all",
    },

    letterboxTop: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        background: "#000",
        zIndex: 2,
    },

    letterboxBottom: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        background: "#000",
        zIndex: 2,
    },

    center: {
        position: "relative",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
        fontFamily: "Cinzel, serif",
    },

    lineBar: {
        height: "1px",
        background: "linear-gradient(to right, transparent, rgba(201,168,76,0.8), transparent)",
        overflow: "hidden",
    },

    eyebrow: {
        fontFamily: "Cinzel, serif",
        fontSize: "11px",
        letterSpacing: "0.5em",
        color: "rgba(201,168,76,0.85)",
        margin: 0,
        textTransform: "uppercase",
        textShadow: "0 0 20px rgba(0,0,0,1)",
    },

    title: {
        fontFamily: "Cinzel, serif",
        fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
        fontWeight: "900",
        color: "#fff",
        margin: 0,
        lineHeight: 1.1,
        letterSpacing: "0.06em",
        textShadow: "0 0 60px rgba(0,0,0,0.9), 0 2px 40px rgba(0,0,0,0.8)",
    },

    gold: {
        color: "#c9a84c",
        textShadow: "0 0 40px rgba(201,168,76,0.7)",
    },

    divider: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        margin: "4px 0",
    },

    dividerLine: {
        width: "80px",
        height: "1px",
        background: "rgba(201,168,76,0.5)",
    },

    dividerDiamond: {
        width: "7px",
        height: "7px",
        background: "#c9a84c",
        transform: "rotate(45deg)",
    },

    quote: {
        fontFamily: "Cormorant Garamond, serif",
        fontStyle: "italic",
        fontSize: "clamp(0.9rem, 1.4vw, 1.15rem)",
        color: "rgba(255,255,255,0.55)",
        margin: 0,
        letterSpacing: "0.05em",
        textShadow: "0 0 20px rgba(0,0,0,1)",
    },
};