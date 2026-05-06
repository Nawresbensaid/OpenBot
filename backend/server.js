const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const sessions = {};
const MAX_USERS = 10;

// ─── Chemin Webots et monde ───
const WEBOTS_EXE = 'C:\\Program Files\\Webots\\msys64\\mingw64\\bin\\webots.exe';
const WORLD_FILE = 'C:\\Users\\IRIS\\Desktop\\my_project\\worlds\\openbot.wbt';

// ─── Démarrer une instance Webots pour un utilisateur ───
app.post("/start", (req, res) => {
    const { userId, level } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "userId requis" });
    }

    if (Object.keys(sessions).length >= MAX_USERS) {
        return res.status(503).json({ error: "Serveur plein — réessaie plus tard" });
    }

    if (sessions[userId]) {
        return res.json({ ok: true, message: "Session déjà active", userId, level });
    }

    const proc = spawn(WEBOTS_EXE, [
        WORLD_FILE
    ], {
        stdio: ["pipe", "pipe", "pipe"]
    });

    sessions[userId] = { proc, level, startedAt: Date.now() };

    proc.stdout.on("data", (data) => {
        console.log(`[Webots user=${userId}] ${data.toString().trim()}`);
    });

    proc.stderr.on("data", (data) => {
        console.error(`[Webots ERR user=${userId}] ${data.toString().trim()}`);
    });

    proc.on("close", (code) => {
        console.log(`[Webots user=${userId}] Terminé (code ${code})`);
        delete sessions[userId];
    });

    proc.on("error", (err) => {
        console.error(`[Webots user=${userId}] Erreur spawn:`, err.message);
        delete sessions[userId];
    });

    console.log(`✅ Webots lancé — user=${userId} level=${level}`);
    res.json({ ok: true, userId, level });
});

// ─── Arrêter la session d'un utilisateur ───
app.post("/stop", (req, res) => {
    const { userId } = req.body;

    if (sessions[userId]) {
        sessions[userId].proc.kill();
        delete sessions[userId];
        console.log(`🛑 Webots arrêté — user=${userId}`);
    }

    res.json({ ok: true });
});

// ─── Statut d'une session ───
app.get("/status/:userId", (req, res) => {
    const session = sessions[req.params.userId];
    res.json({
        active: !!session,
        level: session?.level || null,
        uptime: session ? Math.round((Date.now() - session.startedAt) / 1000) + 's' : null,
    });
});

// ─── Liste toutes les sessions actives ───
app.get("/sessions", (req, res) => {
    const list = Object.entries(sessions).map(([userId, s]) => ({
        userId,
        level: s.level,
        uptime: Math.round((Date.now() - s.startedAt) / 1000) + 's',
    }));
    res.json({ count: list.length, max: MAX_USERS, sessions: list });
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Backend NomadVerse démarré`);
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → Webots : ${WEBOTS_EXE}`);
    console.log(`   → World  : ${WORLD_FILE}`);
    console.log(`   → Sessions max : ${MAX_USERS}\n`);
});