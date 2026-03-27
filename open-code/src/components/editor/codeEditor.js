import React, { useContext, useEffect, useRef } from 'react';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-one_dark';
import { StoreContext } from "../../context/context";
import { javascriptGenerator } from "blockly/javascript";
import { pythonGenerator } from "blockly/python";
import { Constants } from "../../utils/constants";

function CodeEditor() {
    const editorRef = useRef(null);
    const aceEditorRef = useRef(null);
    const { workspace, currentProjectXml, category, drawer } = useContext(StoreContext);

    // Initialiser Ace Editor une seule fois
    useEffect(() => {
        if (!editorRef.current) return;
        const editor = ace.edit(editorRef.current);
        aceEditorRef.current = editor;

        // Thème sombre personnalisé
        editor.setTheme("ace/theme/one_dark");
        editor.setOption("useWorker", false);
        editor.setReadOnly(true);
        editor.setShowPrintMargin(false);
        editor.setOptions({
            fontSize: "13px",
            fontFamily: "'Space Mono', monospace",
            showLineNumbers: true,
            highlightActiveLine: false,
            showGutter: true,
            scrollPastEnd: false,
        });

        // Style custom du gutter (numéros de ligne)
        const gutterEl = editor.renderer.$gutter;
        if (gutterEl) {
            gutterEl.style.background = 'rgba(2,5,16,0.6)';
            gutterEl.style.borderRight = '1px solid rgba(108,190,255,0.1)';
        }

        return () => { editor.destroy(); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Mettre à jour le code quand workspace/category change
    useEffect(() => {
        const editor = aceEditorRef.current;
        if (!editor || !workspace) return;

        try {
            let code = '';
            let mode = '';
            if (category === Constants.py) {
                code = pythonGenerator.workspaceToCode(workspace);
                mode = "ace/mode/python";
            } else {
                code = javascriptGenerator.workspaceToCode(workspace);
                mode = "ace/mode/javascript";
            }
            editor.session.setMode(mode);
            editor.setValue(code || '', -1);
        } catch (e) {
            console.warn('[CodeEditor]', e);
        }
    }, [workspace, currentProjectXml, category, drawer]);


    return (
        <div style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(3,7,20,0.85)',
        }}>


            {/* Éditeur Ace */}
            <div
                ref={editorRef}
                style={{
                    flex: 1,
                    width: '100%',
                    background: 'transparent',
                    overflow: 'hidden',
                }}
            />

            {/* Ligne de scan décorative */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(108,190,255,.025) 19px,rgba(108,190,255,.025) 20px)',
                pointerEvents: 'none',
                borderRadius: '0',
                zIndex: 0,
            }} />
        </div>
    );
}

export default CodeEditor;