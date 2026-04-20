// ═══════════════════════════════════════
// 🤖 PARSER.JS — OpenBot → Webots Bridge (CORRIGÉ)
// src/utils/parser.js
// ═══════════════════════════════════════

let _ws = null;
window.__sensorData = { dist: 999, speed: 0, gyro: 0, accel: 0, voltage: 0 };

export function initParser(ws) {
    _ws = ws;
    console.log("✅ Parser initialisé");
    ws.addEventListener('message', (e) => {
        if (typeof e.data !== 'string') return;
        if (e.data.startsWith("DATA:")) {
            const parts = e.data.substring(5).split(',');
            parts.forEach(p => {
                const [k, v] = p.split('=');
                if (k && v) window.__sensorData[k.trim()] = parseFloat(v);
            });
            return;
        }
        if (e.data.startsWith("CAM:")) {
            const img = e.data.substring(4);
            const camEl = document.getElementById('cam-view');
            if (camEl) camEl.src = 'data:image/jpeg;base64,' + img;
            return;
        }
        console.log("📩 Webots:", e.data);
    });
}

function send(cmd) {
    if (_ws && _ws.readyState === WebSocket.OPEN) {
        console.log("📤 SEND:", cmd);
        _ws.send(cmd);
    } else {
        console.warn("⚠️ WebSocket non connecté");
    }
}

// ═══ MOUVEMENT ═══
const moveForward = (s = 192) => send("FORWARD:" + s);
const moveBackward = (s = 192) => send("BACKWARD:" + s);
const turnLeft = (s = 192) => send("LEFT:" + s);
const turnRight = (s = 192) => send("RIGHT:" + s);
const moveLeft = (s = 192) => send("LEFT:" + s);
const moveRight = (s = 192) => send("RIGHT:" + s);
const stopRobot = () => send("STOP");

// ═══ TIMING ═══
const pause = (ms = 1000) => new Promise(r => setTimeout(r, ms));
const wait = (ms = 1000) => new Promise(r => setTimeout(r, ms));
const delay = (ms = 1000) => new Promise(r => setTimeout(r, ms));

// ═══ BOUCLES ═══
const repeat = (n, fn) => { for (let i = 0; i < Math.min(n, 20); i++) fn(); };

// ═══ CAPTEURS ═══
const getSonar = () => window.__sensorData.dist ?? 999;
const getUltrasonicDistance = () => window.__sensorData.dist ?? 999;
const getDistance = () => window.__sensorData.dist ?? 999;
const getSonarDistance = () => window.__sensorData.dist ?? 999;
const getSpeed = () => window.__sensorData.speed ?? 0;
const getLeftWheelSpeed = () => window.__sensorData.speed ?? 0;
const getRightWheelSpeed = () => window.__sensorData.speed ?? 0;
const getObstacle = () => (window.__sensorData.dist ?? 999) < 100;
const getSensor = () => window.__sensorData.dist ?? 999;
const getBatteryLevel = () => window.__sensorData.voltage ?? 100;
const getSignalStrength = () => 100;
const sonarReading = () => window.__sensorData.dist ?? 999;
const speedReading = () => window.__sensorData.speed ?? 0;
const voltageDividerReading = () => window.__sensorData.voltage ?? 0;
const wheelOdometerSensors = () => window.__sensorData.speed ?? 0;

const gyroscopeReading = (axis) => window.__sensorData['gyro_' + axis] ?? 0;
const accelerationReading = (axis) => window.__sensorData['accel_' + axis] ?? 0;
const magneticReading = (axis) => window.__sensorData['mag_' + axis] ?? 0;

const gyroscopeReadingX = () => gyroscopeReading('x');
const gyroscopeReadingY = () => gyroscopeReading('y');
const gyroscopeReadingZ = () => gyroscopeReading('z');
const accelerationReadingX = () => accelerationReading('x');
const accelerationReadingY = () => accelerationReading('y');
const accelerationReadingZ = () => accelerationReading('z');
const magneticReadingX = () => magneticReading('x');
const magneticReadingY = () => magneticReading('y');
const magneticReadingZ = () => magneticReading('z');

const frontWheelReading = () => window.__sensorData.speed ?? 0;
const backWheelReading = () => window.__sensorData.speed ?? 0;
const leftWheelReading = () => window.__sensorData.speed ?? 0;
const rightWheelReading = () => window.__sensorData.speed ?? 0;
const frontLeftWheelReading = () => window.__sensorData.speed ?? 0;
const frontRightWheelReading = () => window.__sensorData.speed ?? 0;

// ═══ LUMIÈRES ═══
const setIndicator = (side, state) => send(`INDICATOR:${side}:${state ? 1 : 0}`);
const indicators = (side, state) => setIndicator(side, state);
const leftIndicatorOn = () => setIndicator('left', 1);
const leftIndicatorOff = () => setIndicator('left', 0);
const rightIndicatorOn = () => setIndicator('right', 1);
const rightIndicatorOff = () => setIndicator('right', 0);
const hazardLightsOn = () => { setIndicator('left', 1); setIndicator('right', 1); };
const hazardLightsOff = () => { setIndicator('left', 0); setIndicator('right', 0); };
const setBrightness = (val) => send(`BRIGHTNESS:${val}`);
const brightness = (val) => setBrightness(val);
const brightnessHighOrLow = (val) => send(`BRIGHTNESS:${val === 'high' ? 100 : 0}`);
const setHeadlights = (val) => send(`BRIGHTNESS:${val}`);
const setBrakeLight = (val) => send(`BRIGHTNESS:${val ? 100 : 0}`);
const setLed = (...a) => send(`LED:${a.join(',')}`);
const setLight = (...a) => send(`LED:${a.join(',')}`);
const setLedColor = (r, g, b) => send(`LED_COLOR:${r},${g},${b}`);
const setFrontLed = (val) => send(`LED:front:${val}`);
const setBackLed = (val) => send(`LED:back:${val}`);
const headlightsOn = () => setBrightness(100);
const headlightsOff = () => setBrightness(0);
const brakeLightOn = () => setBrightness(100);
const brakeLightOff = () => setBrightness(0);
const ledBrightness = (val) => setBrightness(val);
const ledBrightnessHigh = () => setBrightness(100);
const ledBrightnessLow = () => setBrightness(0);
const ledBrightnessOn = () => setBrightness(100);
const ledBrightnessOff = () => setBrightness(0);
const toggleLed = (s) => send(`LED:${(s === 'ON' || s === 1 || s === true) ? 1 : 0}`);
const toggleFrontLed = (s) => send(`LED:front:${(s === 'ON' || s === 1) ? 1 : 0}`);
const toggleBackLed = (s) => send(`LED:back:${(s === 'ON' || s === 1) ? 1 : 0}`);

// ═══ SON ═══
function playBeep(freq = 440, duration = 0.5) {
    try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    } catch (e) { console.log("🔊 Son ignoré:", e.message); }
}
const freqMap = {
    slow: 330, fast: 880, stop: 220, 'dual drive': 660,
    beep: 440, straight: 550, normal: 440, left: 400, right: 500
};
const soundType = (type) => playBeep(freqMap[type] || 440);
const soundMode = (mode) => playBeep(freqMap[mode] || 440);
const inputSound = (text) => { console.log("🔊 inputSound:", text); playBeep(440, 0.3); };
const playSoundSpeed = (type) => playBeep(freqMap[type] || 440);
const playSoundMode = (mode) => playBeep(freqMap[mode] || 440);
const playSoundStraight = () => playBeep(550, 0.3);
const playSound = (type) => playBeep(freqMap[type] || 440);
const speak = (msg) => {
    console.log("🔊 speak:", msg);
    if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
};

// ═══ AFFICHAGE ═══
const displayString = (msg) => {
    console.log("📺 display:", msg);
    send(`DISPLAY:${msg}`);
    const el = document.getElementById('display-text');
    if (el) el.textContent = msg;
};

const displaySensorData = (data) => {
    let val;
    if (typeof data === 'number') {
        val = data.toFixed(2);
    } else if (typeof data === 'string') {
        const fnName = data.trim().replace(/\(\s*\)$/, '').trim();
        const sensorMap = {
            sonarReading, speedReading, voltageDividerReading, wheelOdometerSensors,
            gyroscopeReadingX, gyroscopeReadingY, gyroscopeReadingZ,
            accelerationReadingX, accelerationReadingY, accelerationReadingZ,
            magneticReadingX, magneticReadingY, magneticReadingZ,
            frontWheelReading, backWheelReading, leftWheelReading, rightWheelReading,
            frontLeftWheelReading, frontRightWheelReading,
            getDistance, getSpeed, getSonar, getSonarDistance,
            getLeftWheelSpeed, getRightWheelSpeed, getBatteryLevel,
        };
        if (sensorMap[fnName]) {
            const raw = sensorMap[fnName]();
            val = typeof raw === 'number' ? raw.toFixed(2) : String(raw);
        } else {
            val = '0.00';
            console.error(`❌ Capteur inconnu: "${fnName}"`);
        }
    } else {
        const dist = window.__sensorData.dist ?? 999;
        const spd = window.__sensorData.speed ?? 0;
        val = `dist:${dist.toFixed(0)} spd:${spd.toFixed(0)}`;
    }
    console.log(`📺 ${val}`);
    send(`DISPLAY:${val}`);
    const el = document.getElementById('display-text');
    if (el) el.textContent = val;
};

const displayToast = (msg) => console.log("📺 toast:", msg);
const showText = (msg) => displayString(msg);

// ═══ AI ═══
// FIX [9] : disableAI désactive aussi follow_mode
const disableAI = () => {
    send("AUTOPILOT:0");
    send("FOLLOW:0");
    send("STOP");
};

// FIX [6] : objectTracking envoie FOLLOW:1 à Webots
// Webots gère la logique sonar — JS reçoit juste les callbacks
const objectTracking = (model, onDetect, onLost) => {
    send("FOLLOW:1");
    // Polling local pour les callbacks Blockly (onDetect / onLost)
    const dist = window.__sensorData.dist ?? 999;
    if (dist < 80) {
        if (typeof onDetect === 'function') onDetect();
    } else {
        if (typeof onLost === 'function') onLost();
    }
};

const autopilot = (model) => send("AUTOPILOT:1");

const navigateForwardAndLeft = (fwd, left, model) => {
    // fwd et left sont normalisés 0-1 depuis Blockly
    send(`NAVIGATE:${fwd},${left}`);
};

// FIX [7] : seuil 100cm documenté — acceptable pour simulation
const variableDetection = (obj, model) => (window.__sensorData.dist ?? 999) < 100;
const multipleObjectTracking = (m, o1, o2, fn) => { };
const multipleAIDetection = (m, o, fn1, fn2) => { };
const detectObject = () => (window.__sensorData.dist ?? 999) < 100;
const getDetection = () => null;
const startTracking = () => send("AUTOPILOT:1");
const stopTracking = () => { send("AUTOPILOT:0"); send("FOLLOW:0"); send("STOP"); };
const isDetected = () => (window.__sensorData.dist ?? 999) < 100;
const getDetectedClass = () => null;

// FIX [10] : fonctions follow/detect ajoutées pour les blocs Blockly
const followPerson = () => {
    send("FOLLOW:1");
    console.log("👁️ followPerson → FOLLOW:1");
};

const onPersonDetected = (onDetect, onLost, lostFrames = 90) => {
    const dist = window.__sensorData.dist ?? 999;
    if (dist < 100) {
        if (typeof onDetect === 'function') onDetect();
    } else {
        if (typeof onLost === 'function') onLost();
    }
};

const onDetected = (onDetect, onLost) => onPersonDetected(onDetect, onLost);
const onLost = (frames, fn) => {
    const dist = window.__sensorData.dist ?? 999;
    if (dist > 100 && typeof fn === 'function') fn();
};

// ═══ CONTROLLER ═══
let _speedLimit = 192;
const controllerMode = (mode) => send("CONTROLLER:" + mode);
const driveModeControls = (mode) => send("DRIVE_MODE:" + mode);
const speedControl = (limit) => {
    const speeds = { slow: 64, medium: 128, normal: 128, fast: 192, 'very fast': 255 };
    _speedLimit = speeds[limit] ?? 128;
    send("SPEED_LIMIT:" + _speedLimit);
    console.log(`🎮 speedControl: ${limit} → ${_speedLimit}/255`);
};

// ═══ DIVERS ═══
const log = msg => console.log("📝 log:", msg);
const print = msg => console.log("📝 print:", msg);

// ═══════════════════════════════════════════════
// ═══ EXÉCUTER LE CODE BLOCKLY ═══════════════════
// ═══════════════════════════════════════════════
export function runBlocklyCode(code) {
    try {
        console.log("▶ Code Blockly reçu:\n", code);

        let safeCode = code
            .replace(/while\s*\(\s*true\s*\)\s*\{/g, 'for(let __fi=0; __fi<5; __fi++){')
            .replace(/while\s*\(true\)/g, 'for(let __fi=0; __fi<5; __fi++)');

        safeCode = safeCode
            .replace(/function\s+start\s*\(\s*\)/, 'async function start()')
            .replace(/function\s+forever\s*\(\s*\)/, 'async function forever()');

        safeCode = safeCode
            .replace(/(?<!await\s)pause\s*\(/g, 'await pause(')
            .replace(/(?<!await\s)wait\s*\(/g, 'await wait(')
            .replace(/(?<!await\s)delay\s*\(/g, 'await delay(');

        // Fix : displaySensorData('fn()') → displaySensorData(fn())
        safeCode = safeCode.replace(
            /displaySensorData\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*['"]\s*\)/g,
            'displaySensorData($1())'
        );
        safeCode = safeCode.replace(
            /displayString\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*['"]\s*\)/g,
            'displayString($1())'
        );

        console.log("✅ Code après fix:\n", safeCode);

        // FIX [10] : followPerson, onPersonDetected, onDetected, onLost ajoutés
        const fn = new Function( // eslint-disable-line no-new-func
            'moveForward', 'moveBackward', 'turnLeft', 'turnRight', 'moveLeft', 'moveRight', 'stopRobot',
            'wait', 'pause', 'delay', 'repeat',
            'getDistance', 'getSonar', 'getSpeed', 'getObstacle', 'getSensor',
            'getUltrasonicDistance', 'getSonarDistance', 'getLeftWheelSpeed', 'getRightWheelSpeed',
            'getBatteryLevel', 'getSignalStrength',
            'sonarReading', 'speedReading', 'voltageDividerReading', 'wheelOdometerSensors',
            'gyroscopeReading', 'accelerationReading', 'magneticReading',
            'gyroscopeReadingX', 'gyroscopeReadingY', 'gyroscopeReadingZ',
            'accelerationReadingX', 'accelerationReadingY', 'accelerationReadingZ',
            'magneticReadingX', 'magneticReadingY', 'magneticReadingZ',
            'frontWheelReading', 'backWheelReading', 'leftWheelReading', 'rightWheelReading',
            'frontLeftWheelReading', 'frontRightWheelReading',
            'setLed', 'setLight', 'setHeadlights', 'setIndicator', 'setBrakeLight',
            'setLedColor', 'setFrontLed', 'setBackLed', 'setBrightness',
            'indicators', 'brightness', 'brightnessHighOrLow',
            'leftIndicatorOn', 'leftIndicatorOff', 'rightIndicatorOn', 'rightIndicatorOff',
            'hazardLightsOn', 'hazardLightsOff', 'headlightsOn', 'headlightsOff',
            'brakeLightOn', 'brakeLightOff',
            'ledBrightness', 'ledBrightnessHigh', 'ledBrightnessLow',
            'ledBrightnessOn', 'ledBrightnessOff',
            'toggleLed', 'toggleFrontLed', 'toggleBackLed',
            'soundType', 'soundMode', 'inputSound', 'speak',
            'playSoundSpeed', 'playSoundMode', 'playSoundStraight', 'playSound',
            'displayString', 'displaySensorData', 'displayToast', 'showText',
            'disableAI', 'objectTracking', 'autopilot', 'navigateForwardAndLeft',
            'variableDetection', 'multipleObjectTracking', 'multipleAIDetection',
            'detectObject', 'getDetection', 'startTracking', 'stopTracking',
            'isDetected', 'getDetectedClass',
            // FIX [10] : nouveaux paramètres IA
            'followPerson', 'onPersonDetected', 'onDetected', 'onLost',
            'controllerMode', 'driveModeControls', 'speedControl',
            'log', 'print',
            `
            return (async () => {
                try {
                    ${safeCode}
                    if (typeof start   === 'function') { console.log("▶ start()");   await start();   console.log("✅ start() terminé"); }
                    if (typeof forever === 'function') { console.log("🔁 forever()"); await forever(); console.log("✅ forever() terminé"); }
                } catch(e) {
                    console.error("❌ Erreur Blockly:", e);
                }
            })();
            `
        );

        fn(
            moveForward, moveBackward, turnLeft, turnRight, moveLeft, moveRight, stopRobot,
            wait, pause, delay, repeat,
            getDistance, getSonar, getSpeed, getObstacle, getSensor,
            getUltrasonicDistance, getSonarDistance, getLeftWheelSpeed, getRightWheelSpeed,
            getBatteryLevel, getSignalStrength,
            sonarReading, speedReading, voltageDividerReading, wheelOdometerSensors,
            gyroscopeReading, accelerationReading, magneticReading,
            gyroscopeReadingX, gyroscopeReadingY, gyroscopeReadingZ,
            accelerationReadingX, accelerationReadingY, accelerationReadingZ,
            magneticReadingX, magneticReadingY, magneticReadingZ,
            frontWheelReading, backWheelReading, leftWheelReading, rightWheelReading,
            frontLeftWheelReading, frontRightWheelReading,
            setLed, setLight, setHeadlights, setIndicator, setBrakeLight,
            setLedColor, setFrontLed, setBackLed, setBrightness,
            indicators, brightness, brightnessHighOrLow,
            leftIndicatorOn, leftIndicatorOff, rightIndicatorOn, rightIndicatorOff,
            hazardLightsOn, hazardLightsOff, headlightsOn, headlightsOff,
            brakeLightOn, brakeLightOff,
            ledBrightness, ledBrightnessHigh, ledBrightnessLow,
            ledBrightnessOn, ledBrightnessOff,
            toggleLed, toggleFrontLed, toggleBackLed,
            soundType, soundMode, inputSound, speak,
            playSoundSpeed, playSoundMode, playSoundStraight, playSound,
            displayString, displaySensorData, displayToast, showText,
            disableAI, objectTracking, autopilot, navigateForwardAndLeft,
            variableDetection, multipleObjectTracking, multipleAIDetection,
            detectObject, getDetection, startTracking, stopTracking,
            isDetected, getDetectedClass,
            // FIX [10]
            followPerson, onPersonDetected, onDetected, onLost,
            controllerMode, driveModeControls, speedControl,
            log, print
        );

    } catch (e) {
        console.error("❌ Erreur runBlocklyCode:", e);
    }
}

export {
    moveForward, moveBackward, turnLeft, turnRight, moveLeft, moveRight, stopRobot,
    wait, pause, delay, repeat,
    getDistance, getSonar, getSpeed, getObstacle, getSensor,
    sonarReading, speedReading, voltageDividerReading, wheelOdometerSensors,
    gyroscopeReading, accelerationReading, magneticReading,
    gyroscopeReadingX, gyroscopeReadingY, gyroscopeReadingZ,
    accelerationReadingX, accelerationReadingY, accelerationReadingZ,
    magneticReadingX, magneticReadingY, magneticReadingZ,
    frontWheelReading, backWheelReading, leftWheelReading, rightWheelReading,
    setLed, setLight, setHeadlights, setIndicator, setBrakeLight, setLedColor,
    indicators, brightness, brightnessHighOrLow,
    leftIndicatorOn, leftIndicatorOff, rightIndicatorOn, rightIndicatorOff,
    hazardLightsOn, hazardLightsOff, headlightsOn, headlightsOff,
    ledBrightness, ledBrightnessHigh, ledBrightnessLow,
    toggleLed, toggleFrontLed, toggleBackLed,
    soundType, soundMode, inputSound, speak, playSoundSpeed, playSoundMode, playSoundStraight,
    displayString, displaySensorData, displayToast, showText,
    disableAI, objectTracking, autopilot, navigateForwardAndLeft,
    detectObject, startTracking, stopTracking,
    followPerson, onPersonDetected, onDetected, onLost,
    controllerMode, driveModeControls, speedControl,
    log, print
};