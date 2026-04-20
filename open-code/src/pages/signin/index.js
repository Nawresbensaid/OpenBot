import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { emailSignIn, googleSignIn } from "../../services/firebase";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await emailSignIn(email, password);
            navigate("/playground");
        } catch (err) {
            setError("Invalid email or password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            await googleSignIn();
            navigate("/playground");
        } catch (err) {
            setError("Google sign-in failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.arabesqueLayer1} />
            <div style={styles.arabesqueLayer2} />
            <div style={styles.arabescueMask} />
            <div style={styles.nebulaGold} />
            <div style={styles.nebulaBlue} />

            <svg style={styles.svgBg} viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
                {[[120, 80], [300, 200], [900, 60], [1100, 150], [1350, 300], [200, 700], [1300, 700], [650, 30]].map(([x, y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r="1.5" fill="rgba(201,168,76,0.8)" />
                        <circle cx={x} cy={y} r="5" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
                    </g>
                ))}
                {[[500, 120], [800, 200], [1200, 80], [350, 350], [1050, 400], [180, 500], [1380, 150], [750, 750]].map(([x, y], i) => (
                    <circle key={`w${i}`} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.35)" />
                ))}
            </svg>

            <svg style={styles.dune} viewBox="0 0 1440 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0,220 C180,140 360,260 540,190 C720,120 900,240 1080,170 C1200,130 1340,200 1440,160 L1440,300 L0,300 Z" fill="rgba(201,168,76,0.06)" />
                <path d="M0,220 C180,140 360,260 540,190 C720,120 900,240 1080,170 C1200,130 1340,200 1440,160" stroke="rgba(201,168,76,0.15)" strokeWidth="1" fill="none" />
                <path d="M0,260 C300,200 500,280 750,240 C950,210 1150,265 1440,230 L1440,300 L0,300 Z" fill="rgba(180,130,40,0.08)" />
            </svg>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navTopLine} />
                <div style={styles.navLogo} onClick={() => navigate("/")}>
                    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                        <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" stroke="#c9a84c" strokeWidth="1.2" fill="none" />
                        <polygon points="11,5 17,8 17,14 11,17 5,14 5,8" stroke="#c9a84c" strokeWidth="0.7" fill="rgba(201,168,76,0.1)" />
                        <circle cx="11" cy="11" r="2" fill="#c9a84c" />
                    </svg>
                    <span><span style={styles.navLogoN}>N</span>omadVerse</span>
                </div>
                <span style={styles.navBack} onClick={() => navigate("/")}>← Back to Home</span>
            </nav>

            {/* Card */}
            <div style={styles.center}>
                <div style={styles.card}>
                    <div style={styles.cornerTL} />
                    <div style={styles.cornerTR} />
                    <div style={styles.cornerBL} />
                    <div style={styles.cornerBR} />

                    <div style={styles.cardHeader}>
                        <span style={styles.badge}>
                            <span style={styles.badgeDot} />
                            NOMADVERSE · 2026
                        </span>
                        <h1 style={styles.cardTitle}>Welcome Back</h1>
                        <p style={styles.cardSub}>Sign in to continue your mission</p>
                    </div>

                    <button
                        style={styles.googleBtn}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={styles.divider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>or</span>
                        <div style={styles.dividerLine} />
                    </div>

                    <form onSubmit={handleEmailSignIn} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="nomad@example.com"
                                style={styles.input}
                                onFocus={e => e.target.style.borderColor = "#c9a84c"}
                                onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={styles.input}
                                onFocus={e => e.target.style.borderColor = "#c9a84c"}
                                onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.2)"}
                                required
                            />
                        </div>

                        {error && <p style={styles.error}>⚠ {error}</p>}

                        <button
                            type="submit"
                            style={styles.submitBtn}
                            disabled={loading}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "scale(1.03)";
                                e.currentTarget.style.boxShadow = "0 0 40px rgba(201,168,76,0.8)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 0 25px rgba(201,168,76,0.4)";
                            }}
                        >
                            {loading ? "Signing in..." : "⚔️ Enter the World"}
                        </button>
                    </form>

                    <p style={styles.footerText}>
                        No account yet?{" "}
                        <span
                            style={styles.link}
                            onClick={() => navigate("/signup")}
                            onMouseEnter={e => e.currentTarget.style.color = "#f0d080"}
                            onMouseLeave={e => e.currentTarget.style.color = "#c9a84c"}
                        >
                            Join NomadVerse →
                        </span>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; box-shadow: 0 0 6px #c9a84c; }
                    50% { opacity: 0.3; box-shadow: 0 0 2px #c9a84c; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        background: `
            radial-gradient(ellipse at 15% 60%, #0f2050 0%, transparent 50%),
            radial-gradient(ellipse at 85% 30%, #0a1535 0%, transparent 45%),
            radial-gradient(ellipse at 50% 100%, #2a1200 0%, transparent 45%),
            #04080f
        `,
        color: "white", fontFamily: "Poppins, sans-serif",
        overflow: "hidden", position: "relative",
    },
    arabesqueLayer1: {
        position: "absolute", inset: 0,
        backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`,
        backgroundSize: "320px 320px", opacity: 0.1,
        pointerEvents: "none", zIndex: 0,
    },
    arabesqueLayer2: {
        position: "absolute", inset: 0,
        backgroundImage: `url("https://www.transparenttextures.com/patterns/arabesque.png")`,
        backgroundSize: "160px 160px", backgroundPosition: "80px 80px",
        opacity: 0.04, filter: "invert(1)",
        pointerEvents: "none", zIndex: 0,
    },
    arabescueMask: {
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(4,8,15,0.65) 70%)",
        pointerEvents: "none", zIndex: 0,
    },
    nebulaGold: {
        position: "absolute", top: "5%", left: "-5%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,76,0.09) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
    },
    nebulaBlue: {
        position: "absolute", top: "0%", right: "-5%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,80,180,0.09) 0%, transparent 70%)",
        filter: "blur(70px)", pointerEvents: "none", zIndex: 0,
    },
    svgBg: {
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
    },
    dune: {
        position: "absolute", bottom: 0, left: 0,
        width: "100%", height: "300px",
        pointerEvents: "none", zIndex: 0,
    },
    navbar: {
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "18px 60px",
        background: "rgba(4,8,20,0.45)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.08)",
    },
    navTopLine: {
        position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
        background: "linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)",
    },
    navLogo: {
        fontSize: "17px", fontFamily: "Cinzel, serif", fontWeight: "700",
        letterSpacing: "3px", color: "rgba(255,255,255,0.92)",
        display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
    },
    navLogoN: { color: "#c9a84c", fontWeight: "900" },
    navBack: {
        fontSize: "12px", color: "rgba(255,255,255,0.45)",
        cursor: "pointer", letterSpacing: "1px",
    },
    center: {
        flex: 1, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "40px 20px", position: "relative", zIndex: 1,
    },
    card: {
        position: "relative", width: "100%", maxWidth: "440px",
        background: "rgba(4,8,20,0.75)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(201,168,76,0.25)",
        borderRadius: "20px", padding: "40px",
        boxShadow: "0 0 60px rgba(201,168,76,0.08), 0 30px 80px rgba(0,0,0,0.6)",
        animation: "fadeUp 0.8s ease",
    },
    cornerTL: { position: "absolute", top: 0, left: 0, width: "22px", height: "22px", borderTop: "2px solid #c9a84c", borderLeft: "2px solid #c9a84c", borderRadius: "20px 0 0 0" },
    cornerTR: { position: "absolute", top: 0, right: 0, width: "22px", height: "22px", borderTop: "2px solid #c9a84c", borderRight: "2px solid #c9a84c", borderRadius: "0 20px 0 0" },
    cornerBL: { position: "absolute", bottom: 0, left: 0, width: "22px", height: "22px", borderBottom: "2px solid #c9a84c", borderLeft: "2px solid #c9a84c", borderRadius: "0 0 0 20px" },
    cornerBR: { position: "absolute", bottom: 0, right: 0, width: "22px", height: "22px", borderBottom: "2px solid #c9a84c", borderRight: "2px solid #c9a84c", borderRadius: "0 0 20px 0" },
    cardHeader: {
        textAlign: "center", marginBottom: "28px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
    },
    badge: {
        display: "inline-flex", alignItems: "center", gap: "7px",
        background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)",
        borderRadius: "50px", padding: "4px 12px",
        fontSize: "9px", color: "#c9a84c", letterSpacing: "2px",
    },
    badgeDot: {
        width: "5px", height: "5px", borderRadius: "50%",
        background: "#c9a84c", display: "inline-block",
        animation: "pulse 1.5s infinite",
    },
    cardTitle: {
        margin: 0, fontSize: "1.8rem", fontWeight: "900",
        fontFamily: "Cinzel, serif",
        background: "linear-gradient(135deg, #f0d080, #c9a84c, #fff)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    cardSub: {
        margin: 0, fontSize: "13px",
        color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px",
    },
    googleBtn: {
        width: "100%", padding: "12px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px", color: "white",
        fontSize: "14px", fontWeight: "500",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        gap: "10px", transition: "background 0.2s",
        fontFamily: "Poppins, sans-serif",
    },
    divider: {
        display: "flex", alignItems: "center",
        gap: "12px", margin: "20px 0",
    },
    dividerLine: { flex: 1, height: "1px", background: "rgba(201,168,76,0.15)" },
    dividerText: { fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    label: {
        fontSize: "11px", color: "rgba(255,255,255,0.5)",
        letterSpacing: "1.5px", textTransform: "uppercase",
    },
    input: {
        padding: "12px 16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "8px", color: "white",
        fontSize: "14px", outline: "none",
        transition: "border-color 0.2s",
        fontFamily: "Poppins, sans-serif",
    },
    error: {
        margin: 0, fontSize: "12px", color: "#f87171",
        textAlign: "center", background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: "6px", padding: "8px",
    },
    submitBtn: {
        marginTop: "4px", padding: "14px",
        background: "linear-gradient(135deg, #b8860b, #c9a84c, #f0d080)",
        border: "none", borderRadius: "8px", color: "#000",
        fontWeight: "800", letterSpacing: "1.5px", cursor: "pointer",
        boxShadow: "0 0 25px rgba(201,168,76,0.4)",
        transition: "transform 0.2s, box-shadow 0.2s",
        fontSize: "13px", fontFamily: "Cinzel, serif",
    },
    footerText: {
        marginTop: "20px", textAlign: "center",
        fontSize: "13px", color: "rgba(255,255,255,0.4)",
    },
    link: {
        color: "#c9a84c", cursor: "pointer",
        fontWeight: "600", transition: "color 0.2s",
    },
};