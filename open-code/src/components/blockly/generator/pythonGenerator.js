import { pythonGenerator } from "blockly/python";

/**
 * code generation of blocks in python
 * @returns {string}
 */

pythonGenerator.forBlock['start'] = function (block) {
    const statements_start_blocks = pythonGenerator.statementToCode(block, 'start_blocks');
    let code = "";
    code += "def start():\n" + statements_start_blocks;
    return code;
};

pythonGenerator.forBlock['forever'] = function (block) {
    const statements_start_blocks = pythonGenerator.statementToCode(block, 'forever_loop_blocks');
    let code = "";
    code += "def forever():\n while(true):\n" + statements_start_blocks + "\n";
    return code;
};

pythonGenerator.forBlock['soundType'] = function (block) {
    let dropdown_type = block.getFieldValue('type');
    let code = '';
    code += "playSoundSpeed('" + dropdown_type + "')\n";
    return code;
};

pythonGenerator.forBlock['soundMode'] = function (block) {
    let dropdown_mode_type = block.getFieldValue('mode_type');
    let code = '';
    code += "playSoundMode('" + dropdown_mode_type + "')\n";
    return code;
};

// ✅ PATCH — forward/backward : lit input_value, défaut 192 si vide
pythonGenerator.forBlock['forward&BackwardAtSpeed'] = function (block) {
    let dropdown_direction_type = block.getFieldValue('direction_type');
    let speed = pythonGenerator.valueToCode(block, 'speed', pythonGenerator.ORDER_NONE);
    if (!speed || speed.trim() === '') speed = '192';
    return dropdown_direction_type + "(" + speed + ")\n";
};

// ✅ PATCH — left/right : lit input_value, défaut 192 si vide
pythonGenerator.forBlock['left&RightAtSpeed'] = function (block) {
    let dropdown_direction_type = block.getFieldValue('direction_type');
    let speed = pythonGenerator.valueToCode(block, 'speed', pythonGenerator.ORDER_NONE);
    if (!speed || speed.trim() === '') speed = '192';
    return dropdown_direction_type + "(" + speed + ")\n";
};

// ✅ PATCH — moveLeft&Right : lit deux input_value, défaut 192 si vide
pythonGenerator.forBlock['moveLeft&Right'] = function (block) {
    let left = pythonGenerator.valueToCode(block, 'left_speed', pythonGenerator.ORDER_NONE);
    let right = pythonGenerator.valueToCode(block, 'right_speed', pythonGenerator.ORDER_NONE);
    if (!left || left.trim() === '') left = '192';
    if (!right || right.trim() === '') right = '192';
    return "moveOpenBot(" + left + "," + right + ")\n";
};

pythonGenerator.forBlock['movementStop'] = function () {
    let code = '';
    code += "stopRobot()\n";
    return code;
};

// ✅ Une seule définition correcte de sonarReading
pythonGenerator.forBlock['sonarReading'] = function () {
    return ["sonarReading()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['speedReading'] = function () {
    return ["speedReading()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['wheelOdometerSensors'] = function (block) {
    let dropdown_wheel_sensors = block.getFieldValue('wheel_sensors');
    return [dropdown_wheel_sensors + "()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['voltageDividerReading'] = function () {
    return ["voltageDividerReading()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['gyroscope_reading'] = function (block) {
    let dropdown_type = block.getFieldValue('axis');

    function scaleType() {
        switch (dropdown_type) {
            case "x": return "X";
            case "y": return "Y";
            case "z": return "Z";
            default: return "X";
        }
    }

    return ["gyroscopeReading" + scaleType() + "()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['acceleration_reading'] = function (block) {
    let dropdown_type = block.getFieldValue('axis');

    function scaleType() {
        switch (dropdown_type) {
            case "x": return "X";
            case "y": return "Y";
            case "z": return "Z";
            default: return "X";
        }
    }

    return ["accelerationReading" + scaleType() + "()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['magnetic_reading'] = function (block) {
    let dropdown_type = block.getFieldValue('axis');

    function scaleType() {
        switch (dropdown_type) {
            case "x": return "X";
            case "y": return "Y";
            case "z": return "Z";
            default: return "X";
        }
    }

    return ["magneticReading" + scaleType() + "()", pythonGenerator.ORDER_NONE];
};

pythonGenerator.forBlock['speedControl'] = function (block) {
    let dropdown_type = block.getFieldValue('type');
    let code = '';
    code += "speedControl(" + dropdown_type + ")\n";
    return code;
};

pythonGenerator.forBlock['controllerMode'] = function (block) {
    let dropdown_controller = block.getFieldValue('controller');
    let code = '';
    code += "controllerMode(" + dropdown_controller + ")\n";
    return code;
};

pythonGenerator.forBlock['driveModeControls'] = function (block) {
    let dropdown_driveModeControls = block.getFieldValue('controller');
    let code = '';
    code += "driveModeControls(" + dropdown_driveModeControls + ")\n";
    return code;
};

pythonGenerator.forBlock['brightness'] = function (block) {
    let value = block.getFieldValue('slider');
    let code = "";
    code += "ledBrightness(" + value + ")\n";
    return code;
};

pythonGenerator.forBlock['wait'] = function (block) {
    let value = block.getFieldValue('time');
    let code = "";
    code += "pause(" + value + ")\n";
    return code;
};

pythonGenerator.forBlock['indicators'] = function (block) {
    const dropdown_side = block.getFieldValue('side');
    const toggleState = block.getFieldValue('TOGGLE_STATE');

    function indicatorStatus() {
        if (toggleState === "ON") {
            return "On";
        } else if (toggleState === "OFF") {
            return "Off";
        }
    }

    let code = "";
    code += dropdown_side + "Indicator" + indicatorStatus() + "()\n";
    return code;
};

pythonGenerator.forBlock['brightnessHighOrLow'] = function (block) {
    const toggleState = block.getFieldValue('TOGGLE_STATE');

    function indicatorStatus() {
        if (toggleState === "ON") {
            return "'ON'";
        } else if (toggleState === "OFF") {
            return "'OFF'";
        }
    }

    let code = "";
    code += "toggleLed(" + indicatorStatus() + ")\n";
    return code;
};

pythonGenerator.forBlock['autopilot'] = function (block) {
    let dropdown_autopilot_models = block.getFieldValue('autopilot models');
    let code = '';
    code += "autopilot('" + dropdown_autopilot_models + "')\n";
    return code;
};

pythonGenerator.forBlock['navigateForwardAndLeft'] = function (block) {
    let forward_position = block.getFieldValue('forward');
    let left_position = block.getFieldValue('left');
    let dropdown_navigation_models = block.getFieldValue('navigation_models');
    let code = '';
    code += "navigateForwardAndLeft(" + forward_position + "," + left_position + ",'" + dropdown_navigation_models + "')\n";
    return code;
};

pythonGenerator.forBlock['objectTracking'] = function (block) {
    const dropdown_class = block.getFieldValue('class');
    const dropdown_models = block.getFieldValue('models');
    let code = "";
    code += "objectTracking('" + dropdown_class + "','" + dropdown_models + "')\n";
    return code;
};

pythonGenerator.forBlock['disableAI'] = function () {
    let code = '';
    code += "disableAI()\n";
    return code;
};

pythonGenerator.forBlock['multipleAIDetection'] = function (block) {
    let autopilot_models = block.getFieldValue('autopilot_models');
    let labels = block.getFieldValue('labels');
    let objectTracking_models = block.getFieldValue('objectTracking_models');
    let tasks = pythonGenerator.statementToCode(block, 'tasks');
    let code = "";
    code += "multipleAIDetection('" + autopilot_models + "','" + labels + "','" + objectTracking_models + "', function(){\n" + tasks + "})\n";
    return code;
};

pythonGenerator.forBlock['multipleObjectTracking'] = function (block) {
    let labels1 = block.getFieldValue('labels1');
    let models = block.getFieldValue('models');
    let labels2 = block.getFieldValue('labels2');
    let tasks = pythonGenerator.statementToCode(block, 'tasks');
    let code = "";
    code += "multipleObjectTracking('" + labels1 + "','" + models + "','" + labels2 + "', function(){\n" + tasks + "})\n";
    return code;
};

pythonGenerator.forBlock['variableDetection'] = function (block) {
    let labels = block.getFieldValue('labels');
    let models = block.getFieldValue('models');
    let detect_tasks = pythonGenerator.statementToCode(block, 'detect_tasks');
    let frames = block.getFieldValue("frames");
    let framesLost_tasks = pythonGenerator.statementToCode(block, 'framesLost_tasks');
    let code = "";
    code += "variableDetection('" + labels + "','" + models + "', function(){\n" + detect_tasks + "}, function(){\n" + framesLost_tasks + "})\n";
    return code;
};

pythonGenerator.forBlock['inputSound'] = function (block) {
    let text = block.getFieldValue('text');
    let code = "";
    code += "inputSound('" + text + "')\n";
    return code;
};

// ✅ FIX : display_sensors appelle la fonction réelle (sans guillemets)
pythonGenerator.forBlock['display_sensors'] = function (block) {
    const value = pythonGenerator.valueToCode(block, 'value', pythonGenerator.ORDER_NONE) || '0';
    return "displaySensorData(" + value + ")\n";
};

pythonGenerator.forBlock['display_string'] = function (block) {
    let text = block.getFieldValue('text');
    let code = "";
    code += "displayString('" + text + "')\n";
    return code;
};