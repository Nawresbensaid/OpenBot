import './BlocklyComponent.css';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import { StoreContext } from "../../context/context";
import { handleChildBlockInWorkspace, updateCurrentProject } from "../../services/workspace";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material";
import { aiBlocks, Constants } from "../../utils/constants";

Blockly.setLocale(locale);

const UniversTheme = Blockly.Theme.defineTheme('univers', {
    base: Blockly.Themes.Classic,
    componentStyles: {
        workspaceBackgroundColour: 'rgba(3,7,20,0.0)',
        toolboxBackgroundColour: '#050c1a',
        toolboxForegroundColour: '#c8ddf0',
        flyoutBackgroundColour: '#080e1e',
        flyoutForegroundColour: '#c8ddf0',
        flyoutOpacity: 0.97,
        scrollbarColour: 'rgba(108,190,255,0.2)',
        scrollbarOpacity: 0.7,
        insertionMarkerColour: '#6cbefd',
        insertionMarkerOpacity: 0.5,
        markerColour: '#6cbefd',
        cursorColour: '#6cbefd',
        selectedGlowColour: '#6cbefd',
        replacementGlowColour: '#6cbefd',
    },
    fontStyle: { family: 'monospace', weight: 'normal', size: 11 },
    blockStyles: {
        colour_blocks: { colourPrimary: '#4860b7' },
        list_blocks: { colourPrimary: '#745ba5' },
        logic_blocks: { colourPrimary: '#5b80a5' },
        loop_blocks: { colourPrimary: '#5ba55b' },
        math_blocks: { colourPrimary: '#5b67a5' },
        procedure_blocks: { colourPrimary: '#9a5ba5' },
        text_blocks: { colourPrimary: '#5ba58c' },
        variable_blocks: { colourPrimary: '#a55b80' },
        variable_dynamic_blocks: { colourPrimary: '#a55b80' },
        hat_blocks: { colourPrimary: '#4860b7' },
    },
});

function BlocklyComponent(props) {
    const { initialXml, children, onWorkspaceChange, ...rest } = props;
    const blocklyDiv = useRef();
    const toolbox = useRef();
    const primaryWorkspace = useRef();

    const {
        projectName, currentProjectXml,
        setDrawer, setWorkspace, setIsError,
        setCurrentProjectXml, setCategory,
        category,
    } = useContext(StoreContext);

    const themes = useTheme();
    const isMobile = useMediaQuery(themes.breakpoints.down('sm'));



    const handleWorkspaceChange = useCallback(() => { // eslint-disable-line
        if (category === Constants.xml) setDrawer(false);
        setIsError(false);
        if (projectName !== undefined) {
            const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()));
            setCurrentProjectXml(xml);
            updateCurrentProject(projectName, xml);
        }

    }); // eslint-disable-line react-hooks/exhaustive-deps



    const handleDuplicateBlocks = useCallback((event) => { // eslint-disable-line
        ["start", "forever", "onBumper"].forEach(type => handlingBlocks(event, type));
    }); // eslint-disable-line react-hooks/exhaustive-deps

    const handlingBlocks = (event, blockType) => {
        let existingBlocks = primaryWorkspace.current.getBlocksByType(blockType);
        if (event.type === Blockly.Events.CREATE && event.blockId) {
            let block = primaryWorkspace.current.getBlockById(event.blockId);
            if (block.type === blockType) disableChildBlocks(existingBlocks);
        } else if (event.type === Blockly.Events.DELETE && event.blockId) {
            if (existingBlocks.length > 0) {
                existingBlocks[0].setEnabled(true);
                enableAllChildBlocks(existingBlocks[0]);
            }
        }
    };

    const disableChildBlocks = (blocks) => {
        for (let i = 1; i < blocks.length; i++) blocks[i].setEnabled(false);
    };

    const enableAllChildBlocks = (block) => {
        if (!block) return;
        block.setEnabled(true);
        block.getChildren().forEach(c => enableAllChildBlocks(c));
    };

    const handleForeverBlocks = useCallback(() => { // eslint-disable-line
        let childArray = [];
        const start = primaryWorkspace.current.getBlocksByType("start");
        const forever = primaryWorkspace.current.getBlocksByType("forever");
        if (start?.length > 0 && forever.length > 0) {
            let filteredAIBlocks = [];
            handleChildBlockInWorkspace(start[0]?.childBlocks_, childArray)
                ?.forEach(item => { if (aiBlocks.includes(item)) filteredAIBlocks.push(item); });
            if (filteredAIBlocks?.length > 0) {
                forever.forEach(f => f.setEnabled(false));
            } else {
                forever[0].setEnabled(true);
                enableAllChildBlocks(forever[0]);
            }
        }
    }); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { setCategory(Constants.js); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
            theme: UniversTheme,
            renderer: 'geras',
            toolbox: toolbox.current,
            grid: { spacing: 20, length: 2, colour: 'rgba(108,190,255,0.05)', snap: true },
            zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.2, scaleSpeed: 1.5, pinch: true },
            trashcan: true,
            ...rest,
        });

        if (isMobile) primaryWorkspace.current.setScale(0.7);
        setWorkspace(primaryWorkspace.current);
        primaryWorkspace.current.addChangeListener(handleWorkspaceChange);

        // Appliquer transparence une seule fois après injection
        setTimeout(() => {
            const injectionDiv = document.querySelector('.injectionDiv');
            if (injectionDiv) injectionDiv.style.background = 'transparent';
            document.querySelectorAll('.blocklyMainBackground').forEach(el => {
                el.setAttribute('fill', 'rgba(3,7,20,0.72)');
            });
        }, 500);


        primaryWorkspace.current.addChangeListener(Blockly.Events.disableOrphans);
        primaryWorkspace.current.addChangeListener(handleDuplicateBlocks);
        primaryWorkspace.current.addChangeListener(handleForeverBlocks);

        if (currentProjectXml) {
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(currentProjectXml), primaryWorkspace.current);
        } else {
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(initialXml), primaryWorkspace.current);
        }
        Blockly.getMainWorkspace().clearUndo();

        return () => { primaryWorkspace.current.dispose(); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <React.Fragment>
            <div ref={blocklyDiv} id="blocklyDiv" style={{ width: '100%', backgroundColor: 'transparent' }} />
            <div style={{ display: 'none' }} ref={toolbox}>{children}</div>

        </React.Fragment>
    );
}

export default BlocklyComponent;