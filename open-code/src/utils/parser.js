// ═══════════════════════════════════════
// 🤖 PARSER.JS — OpenBot → Webots Bridge
// Placer dans : src/utils/parser.js
// ═══════════════════════════════════════

let _ws = null;

// ─ Initialiser avec le WebSocket ─
export function initParser(ws) {
    _ws = ws;
    console.log("✅ Parser initialisé");
}

// ─ Envoyer une commande ─
function send(cmd) {
    if (_ws && _ws.readyState === WebSocket.OPEN) {
        console.log("📤 SEND:", cmd);
        _ws.send(cmd);
    } else {
        console.warn("⚠️ WebSocket non connecté");
    }
}

// ═══ COMMANDES DE BASE ═══
export function moveForward(speed = 192) {
    send("FORWARD:" + speed);
}

export function moveBackward(speed = 192) {
    send("BACKWARD:" + speed);
}

export function turnLeft(speed = 192) {
    send("LEFT:" + speed);
}

export function turnRight(speed = 192) {
    send("RIGHT:" + speed);
}

export function stopRobot() {
    send("STOP");
}

// ═══ EXÉCUTER LE CODE BLOCKLY ═══
export function runBlocklyCode(code) {
    try {
        console.log("▶ Code Blockly:\n", code);

        // Créer une fonction avec les commandes disponibles
        const fn = new Function( // eslint-disable-line no-new-func
            'moveForward',
            'moveBackward',
            'turnLeft',
            'turnRight',
            'stopRobot',
            `
            ${code}
            if (typeof start === 'function') {
                console.log("▶ start()");
                start();
            }
            if (typeof forever === 'function') {
                console.log("🔁 forever()");
                for (let i = 0; i < 5; i++) forever();
            }
            `
        );

        fn(moveForward, moveBackward, turnLeft, turnRight, stopRobot);

    } catch (e) {
        console.error("❌ Erreur runBlocklyCode:", e);
    }
}