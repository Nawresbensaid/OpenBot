/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { javascriptGenerator } from 'blockly/javascript';

/**
 * code generation of blocks in javascript
 * @returns {string}
 */

//Javascript generated function for start block
javascriptGenerator.forBlock['start'] = function (block) {
    const statements_start_blocks = javascriptGenerator.statementToCode(block, 'start_blocks');
    let code = "";
    code += "function start(){\n" + statements_start_blocks + "}";
    return code;
};

//Javascript generated function for forever block
javascriptGenerator.forBlock['forever'] = function (block) {
    const statements_start_blocks = javascriptGenerator.statementToCode(block, 'forever_loop_blocks');
    let code = "";
    code += "function forever (){\n while(true){\n" + statements_start_blocks + "}\n}";
    return code;
};

//Javascript generated function for type of sound block
javascriptGenerator.forBlock['soundType'] = function (block) {
    let dropdown_type = block.getFieldValue('type');
    let code = '';
    code += "playSoundSpeed('" + dropdown_type + "');\n";
    return code;
};

//Javascript generated function for type of drive sound block
javascriptGenerator.forBlock['soundMode'] = function (block) {
    let dropdown_mode_type = block.getFieldValue('mode_type');
    let code = '';
    code += "playSoundMode('" + dropdown_mode_type + "');\n";
    return code;
};

// ✅ PATCH — forward/backward : lit input_value, défaut 192 si vide
javascriptGenerator.forBlock['forward&BackwardAtSpeed'] = function (block) {
    let dropdown_direction_type = block.getFieldValue('direction_type');
    let speed = javascriptGenerator.valueToCode(block, 'speed', javascriptGenerator.ORDER_NONE);
    // ✅ Si rien n'est connecté, valueToCode retourne '' → on met 192 par défaut
    if (!speed || speed.trim() === '') speed = '192';
    return dropdown_direction_type + "(" + speed + ");\n";
};

// ✅ PATCH — left/right : lit input_value, défaut 192 si vide
javascriptGenerator.forBlock['left&RightAtSpeed'] = function (block) {
    let dropdown_direction_type = block.getFieldValue('direction_type');
    let speed = javascriptGenerator.valueToCode(block, 'speed', javascriptGenerator.ORDER_NONE);
    if (!speed || speed.trim() === '') speed = '192';
    return dropdown_direction_type + "(" + speed + ");\n";
};

// ✅ PATCH — moveLeft&Right : lit deux input_value, défaut 192 si vide
javascriptGenerator.forBlock['moveLeft&Right'] = function (block) {
    let left = javascriptGenerator.valueToCode(block, 'left_speed', javascriptGenerator.ORDER_NONE);
    let right = javascriptGenerator.valueToCode(block, 'right_speed', javascriptGenerator.ORDER_NONE);
    if (!left || left.trim() === '') left = '192';
    if (!right || right.trim() === '') right = '192';
    return "moveOpenBot(" + left + "," + right + ");\n";
};

//Javascript generated function for stop movement block
javascriptGenerator.forBlock['movementStop'] = function () {
    let code = '';
    code += "stopRobot();\n"
    return code;
};

// ✅ Une seule définition correcte de sonarReading
javascriptGenerator.forBlock['sonarReading'] = function () {
    return ["sonarReading()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for speed reading block
javascriptGenerator.forBlock['speedReading'] = function () {
    return ["speedReading()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for wheel odometer block
javascriptGenerator.forBlock['wheelOdometerSensors'] = function (block) {
    let dropdown_wheel_sensors = block.getFieldValue('wheel_sensors');
    return [dropdown_wheel_sensors + "()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for voltage divider reading block
javascriptGenerator.forBlock['voltageDividerReading'] = function () {
    return ["voltageDividerReading()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for gyroscope reading block
javascriptGenerator.forBlock['gyroscope_reading'] = function (block) {
    let dropdown_type = block.getFieldValue('axis');

    function scaleType() {
        switch (dropdown_type) {
            case "x": return "X";
            case "y": return "Y";
            case "z": return "Z";
            default: return "X";
        }
    }

    return ["gyroscopeReading" + scaleType() + "()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for acceleration reading block
javascriptGenerator.forBlock['acceleration_reading'] = function (block) {
    let dropdown_type = block.getFieldValue('axis');

    function scaleType() {
        switch (dropdown_type) {
            case "x": return "X";
            case "y": return "Y";
            case "z": return "Z";
            default: return "X";
        }
    }

    return ["accelerationReading" + scaleType() + "()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for magnetic reading block
javascriptGenerator.forBlock['magnetic_reading'] = function (block) {
    let dropdown_type = block.getFieldValue('axis');

    function scaleType() {
        switch (dropdown_type) {
            case "x": return "X";
            case "y": return "Y";
            case "z": return "Z";
            default: return "X";
        }
    }

    return ["magneticReading" + scaleType() + "()", javascriptGenerator.ORDER_NONE];
};

//Javascript generated function for static speed block
javascriptGenerator.forBlock['speedControl'] = function (block) {
    let dropdown_type = block.getFieldValue('type');
    let code = '';
    code += "speedControl(" + dropdown_type + ");\n";
    return code;
};

//Javascript generated function for changing controller mode block
javascriptGenerator.forBlock['controllerMode'] = function (block) {
    let dropdown_controller = block.getFieldValue('controller');
    let code = '';
    code += "controllerMode(" + dropdown_controller + ");\n";
    return code;
};

//Javascript generated function for changing drive mode block
javascriptGenerator.forBlock['driveModeControls'] = function (block) {
    let dropdown_driveModeControls = block.getFieldValue('controller');
    let code = '';
    code += "driveModeControls(" + dropdown_driveModeControls + ");\n";
    return code;
};

//Javascript generated function for setting led brightness block
javascriptGenerator.forBlock['brightness'] = function (block) {
    let value = block.getFieldValue('slider');
    let code = "";
    code += "ledBrightness(" + value + ");\n";
    return code;
};

//Javascript generated function for wait block
javascriptGenerator.forBlock['wait'] = function (block) {
    let value = block.getFieldValue('time');
    let code = "";
    code += "pause(" + value + ");\n";
    return code;
};

//Javascript generated function for indicators block
javascriptGenerator.forBlock['indicators'] = function (block) {
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
    code += dropdown_side + "Indicator" + indicatorStatus() + "();\n";
    return code;
};

//Javascript generated function for switching brightness block
javascriptGenerator.forBlock['brightnessHighOrLow'] = function (block) {
    const toggleState = block.getFieldValue('TOGGLE_STATE');

    function indicatorStatus() {
        if (toggleState === "ON") {
            return "'ON'";
        } else if (toggleState === "OFF") {
            return "'OFF'";
        }
    }

    let code = "";
    code += "toggleLed(" + indicatorStatus() + ");\n";
    return code;
};

//Javascript generated function for AI autopilot block
javascriptGenerator.forBlock['autopilot'] = function (block) {
    let dropdown_autopilot_models = block.getFieldValue('autopilot models');
    let code = '';
    code += "autopilot('" + dropdown_autopilot_models + "');\n";
    return code;
};

//Javascript generated function for AI point goal navigation block
javascriptGenerator.forBlock['navigateForwardAndLeft'] = function (block) {
    let forward_position = block.getFieldValue('forward');
    let left_position = block.getFieldValue('left');
    let dropdown_navigation_models = block.getFieldValue('navigation_models');
    let code = '';
    code += "navigateForwardAndLeft(" + forward_position + "," + left_position + ",'" + dropdown_navigation_models + "');\n";
    return code;
};

//Javascript generated function for AI object tracking block
javascriptGenerator.forBlock['objectTracking'] = function (block) {
    const dropdown_class = block.getFieldValue('class');
    const dropdown_models = block.getFieldValue('models');
    let code = "";
    code += "objectTracking('" + dropdown_class + "','" + dropdown_models + "');\n";
    return code;
};

//Javascript generated function for stop AI block
javascriptGenerator.forBlock['disableAI'] = function () {
    let code = '';
    code += "disableAI();\n";
    return code;
};

//Javascript generated function for multiple AI detection block
javascriptGenerator.forBlock['multipleAIDetection'] = function (block) {
    let autopilot_models = block.getFieldValue('autopilot_models');
    let labels = block.getFieldValue('labels');
    let objectTracking_models = block.getFieldValue('objectTracking_models');
    let tasks = javascriptGenerator.statementToCode(block, 'tasks');
    let code = "";
    code += "multipleAIDetection('" + autopilot_models + "','" + labels + "','" + objectTracking_models + "', function(){\n" + tasks + "});\n";
    return code;
};

//Javascript generated function for AI multiple object tracking block
javascriptGenerator.forBlock['multipleObjectTracking'] = function (block) {
    let labels1 = block.getFieldValue('labels1');
    let models = block.getFieldValue('models');
    let labels2 = block.getFieldValue('labels2');
    let tasks = javascriptGenerator.statementToCode(block, 'tasks');
    let code = "";
    code += "multipleObjectTracking('" + labels1 + "','" + models + "','" + labels2 + "', function(){\n" + tasks + "});\n";
    return code;
};

//Javascript generated function for AI on frame detection
javascriptGenerator.forBlock['variableDetection'] = function (block) {
    let labels = block.getFieldValue('labels');
    let models = block.getFieldValue('models');
    let detect_tasks = javascriptGenerator.statementToCode(block, 'detect_tasks');
    let frames = block.getFieldValue("frames");
    let framesLost_tasks = javascriptGenerator.statementToCode(block, 'framesLost_tasks');
    let code = "";
    code += "variableDetection('" + labels + "','" + models + "', function(){\n" + detect_tasks + "}, function(){\n" + framesLost_tasks + "});\n";
    return code;
};

//Javascript generated function for input sound block
javascriptGenerator.forBlock['inputSound'] = function (block) {
    let text = block.getFieldValue('text');
    let code = "";
    code += "inputSound('" + text + "');\n";
    return code;
};

// ✅ FIX : display_sensors appelle la fonction réelle (sans guillemets)
javascriptGenerator.forBlock['display_sensors'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_NONE) || '0';
    return "displaySensorData(" + value + ");\n";
};

//Javascript generated function for display string block
javascriptGenerator.forBlock['display_string'] = function (block) {
    let text = block.getFieldValue('text');
    let code = "";
    code += "displayString('" + text + "');\n";
    return code;
};