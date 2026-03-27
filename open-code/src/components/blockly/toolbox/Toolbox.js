import React from 'react';
import { Block, Category, Field, Label, Shadow, Value } from "../index";
import { controlsBlocks, loopBlocks } from "../blocks/generalBlocks";
import { controlBlocksType, loopBlocksType } from "../../../utils/constants";
import '../generator/javascriptGenerator';
import '../blocks/customblocks';
import "../generator/pythonGenerator"

// Lire le niveau depuis localStorage
const getUserLevel = () => {
    try {
        const lvl = localStorage.getItem('currentLevel');
        if (lvl) return parseInt(JSON.parse(lvl).num) || 1;
    } catch (_) { }
    return 6; // Si pas de level sélectionné → tout débloqué
};

// Catégorie verrouillée
const LockedCategory = ({ name, colour, requiredLevel }) => (
    <Category name={`🔒 ${name} — Lvl ${requiredLevel}`} colour={colour}>
        <Label text={`Débloque au Level ${requiredLevel}`} web-class="Heading" />
    </Category>
);

export const Toolbox = (props) => {
    const level = getUserLevel();

    return (
        <>
            {/* ── LEVEL 1 : Control (toujours visible) ── */}
            <Category name="Control" colour={"#567AE4"}>
                <Label text="Control" web-class="Heading"></Label>
                <Block type="start" />
                <Block type="forever" />
                <Block type="wait" />
                <Block type="display_sensors" />
                <Block type="display_string" />
                <Block type="controls_if" gap="8">
                    <Value name="IF0">
                        <Shadow type="logic_boolean">
                            <Field name="BOOL">TRUE</Field>
                        </Shadow>
                    </Value>
                </Block>
                {controlBlocksType.map((type, index) => controlsBlocks(type, index))}
                <Block type="logic_compare" gap="8">
                    <Value name="A">
                        <Shadow type="math_number">
                            <Field name="NUM">0</Field>
                        </Shadow>
                    </Value>
                    <Value name="B">
                        <Shadow type="math_number">
                            <Field name="NUM">0</Field>
                        </Shadow>
                    </Value>
                </Block>
            </Category>

            {/* ── LEVEL 1 : Movement ── */}
            <Category name="Movement" colour={"#d56235"}>
                <Label text="Movement" web-class="Heading"></Label>
                <Block type="forward&BackwardAtSpeed" />
                <Block type="left&RightAtSpeed" />
                <Block type="moveLeft&Right" />
                <Block type="movementStop" />
            </Category>

            {/* ── LEVEL 2 : Loops ── */}
            {level >= 2 ? (
                <Category name={level === 2 ? "✨ Loops" : "Loops"} colour={"#C54E30"}>
                    <Label text="Loops" web-class="Heading"></Label>
                    {loopBlocksType.map((type, index) => loopBlocks(type, index))}
                    <Block type="controls_for">
                        <Value name="FROM">
                            <Shadow type="math_number"><Field name="NUM">1</Field></Shadow>
                        </Value>
                        <Value name="TO">
                            <Shadow type="math_number"><Field name="NUM">10</Field></Shadow>
                        </Value>
                        <Value name="BY">
                            <Shadow type="math_number"><Field name="NUM">1</Field></Shadow>
                        </Value>
                    </Block>
                </Category>
            ) : (
                <LockedCategory name="Loops" colour={"#C54E30"} requiredLevel={2} />
            )}

            {/* ── LEVEL 2 : Operators (avec Loops) ── */}
            {level >= 2 ? (
                <Category name="Operators" colour={"#8156C9"}>
                    <Label text="Operators" web-class="Heading"></Label>
                    <Block type="math_arithmetic" />
                    <Block type="math_number" />
                    <Block type="math_modulo" />
                    <Block type="math_single" />
                    <Block type="math_constant" />
                    <Block type="math_number_property" />
                    <Block type="math_round" />
                    <Block type="math_random_int" />
                </Category>
            ) : null}

            {/* ── LEVEL 2 : Variables (avec Loops) ── */}
            {level >= 2 ? (
                <Category name="Variables" colour={"#D030BA"}>
                    <Label text="Variables" web-class="Heading"></Label>
                    <Block type="variables_set" />
                    <Block type="variables_get" />
                    <Block type="math_change" />
                    <Block type="math_number" />
                </Category>
            ) : null}

            {/* ── LEVEL 3 : Sensors ── */}
            {level >= 3 ? (
                <Category name={level === 3 ? "✨ Sensors" : "Sensors"} colour={"#49a2a5"}>
                    <Label text="Phone Sensors" web-class="sensorsHeading"></Label>
                    <Block type="gyroscope_reading" />
                    <Block type="acceleration_reading" />
                    <Block type="magnetic_reading" />
                    <Label text="Car Sensors" web-class="sensorsHeading"></Label>
                    <Block type="sonarReading" />
                    <Block type="speedReading" />
                    <Block type="voltageDividerReading" />
                    <Block type="wheelOdometerSensors" />
                </Category>
            ) : (
                <LockedCategory name="Sensors" colour={"#49a2a5"} requiredLevel={3} />
            )}

            {/* ── LEVEL 4 : Lights ── */}
            {level >= 4 ? (
                <Category name={level === 4 ? "✨ Lights" : "Lights"} colour={"#506481"}>
                    <Label text="Lights" web-class="Heading"></Label>
                    <Block type="indicators" />
                    <Block type="brightness" />
                    <Block type="brightnessHighOrLow" />
                </Category>
            ) : (
                <LockedCategory name="Lights" colour={"#506481"} requiredLevel={4} />
            )}

            {/* ── LEVEL 4 : Sound (avec Lights) ── */}
            {level >= 4 ? (
                <Category name="Sound" colour={"#5BBC73"}>
                    <Label text="Sound" web-class="Heading"></Label>
                    <Block type="soundType" />
                    <Block type="soundMode" />
                    <Block type="inputSound" />
                </Category>
            ) : null}

            {/* ── LEVEL 4 : Controller (avec Lights) ── */}
            {level >= 4 ? (
                <Category name="Controller" colour={"#bf778b"}>
                    <Label text="Controller" web-class="Heading"></Label>
                    <Block type="controllerMode" />
                    <Block type="driveModeControls" />
                    <Block type="speedControl" />
                </Category>
            ) : null}

            {/* ── LEVEL 5 : AI ── */}
            {level >= 5 ? (
                <Category name={level === 5 ? "✨ AI" : "AI"} colour={"#458ff7"}>
                    <Label text="Artificial Intelligence" web-class="Heading"></Label>
                    <Block type="disableAI" />
                    <Block type="objectTracking" />
                    <Block type="autopilot" />
                    <Block type="navigateForwardAndLeft" />
                    <Block type="variableDetection" />
                    <Block type="multipleObjectTracking" />
                    <Block type="multipleAIDetection" />
                </Category>
            ) : (
                <LockedCategory name="AI" colour={"#458ff7"} requiredLevel={5} />
            )}
        </>
    );
}