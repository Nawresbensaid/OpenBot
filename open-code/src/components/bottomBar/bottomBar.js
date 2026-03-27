import React, { useContext, useEffect, useRef, useState } from "react";
import Blockly from "blockly/core";
import styles from "./style.module.css"
import { javascriptGenerator } from 'blockly/javascript';
import { StoreContext } from "../../context/context";
import { colors } from "../../utils/color";
import { ThemeContext } from "../../App";
import { aiBlocks, Constants, Errors, errorToast, PlaygroundConstants } from "../../utils/constants";
import { CircularProgress, circularProgressClasses, Popper, useTheme } from "@mui/material";
import WhiteText from "../fonts/whiteText";
import BlackText from "../fonts/blackText";
import { Images } from "../../utils/images";
import useMediaQuery from "@mui/material/useMediaQuery";
import { uploadToGoogleDrive } from "../../services/googleDrive";
import { getCurrentProject, handleChildBlockInWorkspace } from "../../services/workspace";
import navbarStyle from "../navBar/navbar.module.css";
import BlueText from "../fonts/blueText";
import { ModelUploadingComponent } from "./modelUploadingComponent";
import SubscriptionModel from "../subscription/subscriptionModel";
import { setProjectDetails } from "../../apis/projects";

export const BottomBar = () => {
    const [buttonSelected, setButtonSelected] = useState({ backgroundColor: colors.openBotBlue });
    const [buttonActive, setButtonActive] = useState(false);
    const [isLoader, setIsLoader] = useState(false);
    const { theme } = useContext(ThemeContext);
    const themes = useTheme();
    const isMobile = useMediaQuery(themes.breakpoints.down('sm'));
    const [isLandscape, setIsLandscape] = useState(window.matchMedia("(max-height: 500px) and (max-width: 1000px) and (orientation: landscape)").matches);
    const isDesktopSmallerScreen = useMediaQuery(themes.breakpoints.down('md'));
    const [isAIModelComponent, setIsAIModelComponent] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [isSubscriptionExpire, setIsSubscriptionExpire] = useState(null);
    const {
        isOnline, generate, setGenerateCode, setCode, setDrawer,
        workspace, isError, setIsError, setCategory,
    } = useContext(StoreContext);

    function handleError(errorMessage) {
        setDrawer(false);
        setIsLoader(false);
        setIsError(true);
        setError(errorMessage);
    }

    function handlingMultipleAIBlocks(start) {
        let child = [], allChildBlocks = [], configuredAIBlocks = [];
        if (start.length !== 0) {
            if (start[0].childBlocks_.length > 0) {
                allChildBlocks = handleChildBlockInWorkspace(start[0].childBlocks_, child);
                for (let i = 0; i < allChildBlocks.length; i++) {
                    if (aiBlocks.includes(allChildBlocks[i])) configuredAIBlocks.push(allChildBlocks[i]);
                    else if (allChildBlocks[i] === PlaygroundConstants.disableAI) configuredAIBlocks.pop();
                    if (configuredAIBlocks.length > 1) return true;
                }
                return false;
            } else return false;
        }
    }

    // ── Générer le code JS depuis les blocs et le sauvegarder ──
    const generatePythonForPanel = () => {
        if (!workspace) return;
        try {
            const jsCode = javascriptGenerator.workspaceToCode(workspace);
            console.log('[JS Code généré]', jsCode);

            // ✅ Sauvegarder pour le bouton Run dans index.js
            window.__currentPythonCode = jsCode;

            if (window.__setPythonCode) {
                window.__setPythonCode(jsCode);
            }
        } catch (e) {
            console.error('[Code Gen]', e);
        }
    };

    // ── Mettre à jour à chaque changement de workspace ──
    useEffect(() => {
        if (!workspace) return;
        const updatePython = () => generatePythonForPanel();
        workspace.addChangeListener(updatePython);
        return () => workspace.removeChangeListener(updatePython);
    }, [workspace]); // eslint-disable-line react-hooks/exhaustive-deps

    const generateCode = () => {
        if (isOnline) {
            if (localStorage.getItem("isSigIn") === "true") {
                setDrawer(false);
                setIsLoader(true);
                let code = javascriptGenerator.workspaceToCode(workspace);
                const start = workspace.getBlocksByType(PlaygroundConstants.start);
                const forever = workspace.getBlocksByType(PlaygroundConstants.forever);
                const detection = workspace.getBlocksByType(PlaygroundConstants.detectionOrUndetection);
                const multipleObjectTracking = workspace.getBlocksByType(PlaygroundConstants.multipleObjectTracking);
                const variableDetection = workspace.getBlocksByType(PlaygroundConstants.variableDetection);
                let objNameArray = [];
                if (variableDetection?.length > 0) {
                    for (let i = 0; i < variableDetection.length; i++)
                        objNameArray.push(variableDetection[i].getFieldValue(PlaygroundConstants.labels));
                }
                let isClassesSimiliar = false;
                for (let i = 0; i < objNameArray.length; i++)
                    for (let j = i + 1; j < objNameArray.length; j++)
                        if (objNameArray[i] === objNameArray[j]) isClassesSimiliar = true;

                let multipleObjectTrackingEnabledBlocks = multipleObjectTracking?.filter(obj => obj.disabled === false);
                let isAIBlocksAdjacent = handlingMultipleAIBlocks(start);
                let array = [];
                let foreverChildBlocks = handleChildBlockInWorkspace(forever, array);
                let isForeverContainsAI;
                foreverChildBlocks.forEach(item => { if (aiBlocks.includes(item)) isForeverContainsAI = true; });
                let object_1 = PlaygroundConstants.object_1;
                let object_2 = PlaygroundConstants.object_2;
                if (multipleObjectTrackingEnabledBlocks.length > 0) {
                    object_1 = multipleObjectTrackingEnabledBlocks[0].getFieldValue(PlaygroundConstants.labels1);
                    object_2 = multipleObjectTrackingEnabledBlocks[0].getFieldValue(PlaygroundConstants.labels2);
                }
                if (start.length === 0 && forever.length === 0 && detection.length === 0 && variableDetection.length === 0)
                    handleError(Errors.error1);
                else if (isAIBlocksAdjacent === true && start.length > 0) handleError(Errors.error2);
                else if (object_1 === object_2) handleError(Errors.error3);
                else if (isForeverContainsAI === true) handleError(Errors.error4);
                else if (isClassesSimiliar === true) handleError(Errors.error5);
                else {
                    let codeWithoutComments = code.replace(/\/\/.*$/gm, '');
                    if (start.length > 0) codeWithoutComments += "\nstart();";
                    if (forever.length > 0) codeWithoutComments += "\nforever();";
                    setGenerateCode(!generate);
                    uploadToGoogleDrive(codeWithoutComments, "js").then(res => {
                        let linkCode = { driveLink: res, projectName: getCurrentProject().projectName };
                        const data = {
                            projectName: getCurrentProject().projectName,
                            xmlValue: getCurrentProject().xmlValue,
                            createdDate: new Date().toLocaleDateString()
                        };
                        uploadToGoogleDrive(data, "xml").then(async () => {
                            setCode(linkCode);
                            setCategory(Constants.qr);
                            setIsLoader(false);
                            setDrawer(true);
                        }).catch(err => { errorToast("Failed to upload"); setIsLoader(false); });
                    }).catch(err => { setIsLoader(false); errorToast("Failed to Upload"); });
                }
            } else errorToast("Please sign-In to upload code.");
        } else errorToast(Constants.InternetOffMsg);
    };

    useEffect(() => {
        const button = document.querySelector("#uploadCode");
        if (button) button.disabled = isLoader;
    }, [isLoader]);

    useEffect(() => {
        const handleOrientationChange = () => {
            setIsLandscape(window.matchMedia("(max-height: 500px) and (max-width: 1000px) and (orientation: landscape)").matches);
        };
        window.addEventListener("resize", handleOrientationChange);
    }, []);

    const clickedButton = async (e) => {
        const { name } = e.target;
        setButtonSelected(name);
        setButtonActive(true);
        setTimeout(() => setButtonActive(false), 100);
        const isUndo = () => {
            const ws = Blockly.getMainWorkspace();
            return ws && (ws.undoStack_.length !== 0 || (ws.undoStack_.length === 0 && ws.redoStack_.length === 0));
        };
        const isRedo = () => {
            const ws = Blockly.getMainWorkspace();
            return ws && ws.redoStack_.length !== 0;
        };
        switch (name) {
            case "redo": { const ws = Blockly.getMainWorkspace(); if (ws && isRedo()) ws.undo(true); break; }
            case "undo": { if (isUndo()) { const ws = Blockly.getMainWorkspace(); if (ws && ws.getUndoStack().length !== 0) ws.undo(false); } break; }
            case "minus": { Blockly.getMainWorkspace().zoom(1, 2, -1.5); break; }
            case "plus": { Blockly.getMainWorkspace().zoom(1, 2, 1.5); break; }
            case "uploadCode": { generateCode(); break; }
            default: break;
        }
    };

    const CompilationLoader = () => (
        <div>
            <CircularProgress variant="determinate" sx={{ color: theme === 'light' ? "#E8E8E8" : "gray" }} size={isMobile ? 20 : 40} thickness={6.5} value={100} style={{ position: "absolute" }} />
            <CircularProgress variant="indeterminate" disableShrink sx={{ color: theme === 'light' ? 'black' : '#FFFFFF', animationDuration: '550ms', left: 0, [`& .${circularProgressClasses.circle}`]: { strokeLinecap: 'round' } }} size={isMobile ? 20 : 40} thickness={6.5} />
        </div>
    );

    return (
        <>
            {isSubscriptionExpire && <SubscriptionModel isSubscriptionExpire={isSubscriptionExpire} setIsSubscriptionExpire={setIsSubscriptionExpire} />}
            <div className={isLoader || isError ? styles.loaderBarDiv + " " + (theme === "dark" ? styles.barDivDark : styles.barDivLight) : styles.barDiv + " " + (theme === "dark" ? styles.barDivDark : styles.barDivLight)}>
                <div>
                    {isError && <div style={{ display: "flex", flexDirection: "column" }} className={styles.errorDiv}>
                        <div>Compilation failed due to following error(s).</div>
                        <div className={styles.errorItems}>error : &nbsp;&nbsp; {error}</div>
                    </div>}
                    {isLoader && <div className={styles.loaderText}>
                        <CompilationLoader />
                        {theme === "dark" ? <WhiteText text={"Compiling Code..."} extraStyle={styles.textItem} /> : <BlackText text={"Compiling Code..."} extraStyle={styles.textItem} />}
                    </div>}
                </div>
                <div className={styles.buttonsDiv}>
                    <UploadCodeButton buttonSelected={buttonSelected} setDrawer={setDrawer} buttonActive={buttonActive} clickedButton={clickedButton} setIsAIModelComponent={setIsAIModelComponent} setFile={setFile} />
                    {isAIModelComponent && <ModelUploadingComponent isAIModelComponent={isAIModelComponent} setIsSubscriptionExpire={setIsSubscriptionExpire} setIsAIModelComponent={setIsAIModelComponent} file={file} />}
                    <div className={styles.operationsDiv}>
                        <UndoRedo clickedButton={clickedButton} buttonSelected={buttonSelected} buttonActive={buttonActive} />
                        {isMobile || isLandscape || isDesktopSmallerScreen ? "" : <ZoomInOut clickedButton={clickedButton} buttonSelected={buttonSelected} buttonActive={buttonActive} />}
                    </div>
                </div>
            </div>
        </>
    );
};

function UploadCodeButton(params) {
    const { clickedButton, buttonSelected, buttonActive, setDrawer, setIsAIModelComponent, setFile } = params;
    const themes = useTheme();
    const { setCategory } = useContext(StoreContext);
    const isMobile = useMediaQuery(themes.breakpoints.down('sm'));
    const theme = useContext(ThemeContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openPopupArrow, setOpenPopupArrow] = useState(false);
    const [arrowClick, setArrowClicked] = useState(false);
    const [isTabletQuery, setIsTabletQuery] = useState(window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches);
    const popUpRef = useRef(null);
    const [isLandscape, setIsLandscape] = useState(window.matchMedia("(max-height: 500px) and (max-width: 1000px) and (orientation: landscape)").matches);
    const isDesktopSmallerScreen = useMediaQuery(themes.breakpoints.down('lg'));
    const inputRef = useRef();

    const handleClick = (event) => {
        event.stopPropagation();
        setOpenPopupArrow(!openPopupArrow);
        setAnchorEl(anchorEl ? null : event.currentTarget);
        setArrowClicked(true);
    };
    const id = openPopupArrow ? 'simple-popper' : undefined;

    const handleLanguageDropDown = (lang) => {
        setCategory(lang);
        setDrawer(true);
        setAnchorEl(null);
        setOpenPopupArrow(!openPopupArrow);
    };

    const handleChange = (e) => {
        setFile(e.target.files[0]);
        setIsAIModelComponent(true);
    };

    useEffect(() => {
        const handleOrientationChange = () => {
            setIsLandscape(window.matchMedia("(max-height: 500px) and (max-width: 1000px) and (orientation: landscape)").matches);
            setIsTabletQuery(window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches);
        };
        window.addEventListener("resize", handleOrientationChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popUpRef.current && !popUpRef.current.contains(event.target)) {
                setOpenPopupArrow(false); setAnchorEl(null);
            }
        };
        const handleMouseDown = (event) => {
            if (popUpRef.current && !popUpRef.current.contains(event.target)) setArrowClicked(false);
        };
        document.addEventListener("mousedown", handleMouseDown, { passive: true });
        document.addEventListener("click", handleClickOutside, { passive: true });
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popUpRef, arrowClick]);

    return (
        <div className={styles.iconMargin + " " + styles.noSpace} style={{ width: "25%" }}>
            <button id={"uploadCode"} className={`${styles.uploadCodeButton} ${buttonSelected === "uploadCode" && buttonActive ? styles.buttonColor : ""}`} name={"uploadCode"} onClick={clickedButton}>
                {isMobile || isLandscape || isTabletQuery.matches || isDesktopSmallerScreen ? "" : <span className={styles.leftButton + " " + styles.iconMargin}>Upload Code </span>}
                <img alt={""} className={styles.iconDiv} src={Images.uploadIcon} />
            </button>
            <div title={"Features"} className={`${styles.features}`} ref={popUpRef} onClick={handleClick}>
                <img alt={"features"} className={styles.iconDiv} src={Images.darkDots} />
            </div>
            <Popper ref={popUpRef} id={id} open={openPopupArrow} anchorEl={anchorEl}>
                <div className={`${styles.langOption} ${theme.theme === "dark" ? styles.darkTitleModel : styles.lightTitleModel}`}>
                    <div onClick={e => handleLanguageDropDown(Constants.js, e)} className={`${styles.langItem} ${styles.jsDivMargin} ${theme.theme === "dark" ? navbarStyle.darkItem : navbarStyle.lightItem}`}>
                        <img alt="Icon" className={styles.langIcon} src={theme.theme === "dark" ? Images.jsIconDarkTheme : Images.jsIconLightTheme} />
                        {theme.theme === "dark" ? <WhiteText inlineStyle={{ fontWeight: 400 }} text={"Javascript"} /> : <BlueText text={"Javascript"} />}
                    </div>
                    <div onClick={e => handleLanguageDropDown(Constants.py, e)} className={`${styles.langItem} ${styles.pyDivMargin} ${theme.theme === "dark" ? navbarStyle.darkItem : navbarStyle.lightItem}`}>
                        <img alt="Icon" className={styles.langIcon} src={theme.theme === "dark" ? Images.pyIconDarkTheme : Images.pyIconLightTheme} />
                        {theme.theme === "dark" ? <WhiteText extraStyle={styles.pyText} text={"Python"} /> : <BlueText extraStyle={styles.pyText} text={"Python"} />}
                    </div>
                    <div onClick={() => inputRef.current?.click()} style={{ marginTop: 0 }} className={`${styles.langItem} ${styles.jsDivMargin} ${theme.theme === "dark" ? navbarStyle.darkItem : navbarStyle.lightItem}`}>
                        <img alt="Icon" className={styles.langIcon} src={theme.theme === "dark" ? Images.darkPlusIcon : Images.lightPlusIcon} />
                        {theme.theme === "dark" ? <WhiteText text={"Add Model"} /> : <BlueText text={"Add Model"} />}
                        <input ref={inputRef} style={{ display: "none" }} type="file" accept=".tflite" onChange={handleChange} />
                    </div>
                </div>
            </Popper>
        </div>
    );
}

function UndoRedo(params) {
    const { clickedButton, buttonSelected, buttonActive } = params;
    return (
        <div className={styles.buttonMargin + " " + styles.iconMargin}>
            <button title={"Undo"} onClick={clickedButton} className={`${styles.buttonStyle} ${styles.minusStyle} ${styles.borderStyle} ${buttonSelected === "undo" && buttonActive ? styles.buttonColor : ""}`} name={"undo"}>
                <img alt={""} className={styles.commandSize} src={Images.undoIcon} />
            </button>
            <button onClick={clickedButton} title={"Redo"} className={`${styles.buttonStyle} ${styles.plusStyle} ${buttonSelected === "redo" && buttonActive ? styles.buttonColor : ""}`} name={"redo"}>
                <img alt={""} className={styles.commandSize} src={Images.redoIcon} />
            </button>
        </div>
    );
}

function ZoomInOut(params) {
    const { clickedButton, buttonSelected, buttonActive } = params;
    return (
        <div className={styles.iconMargin}>
            <button onClick={clickedButton} title={"Zoom Out"} className={`${styles.buttonStyle} ${styles.minusStyle} ${styles.borderStyle} ${buttonSelected === "minus" && buttonActive ? styles.buttonColor : ""}`} name={"minus"}>
                <span className={styles.operationSize}>-</span>
            </button>
            <button onClick={clickedButton} title={"Zoom In"} className={`${styles.buttonStyle} ${styles.plusStyle} ${buttonSelected === "plus" && buttonActive ? styles.buttonColor : ""}`} name={"plus"}>
                <span className={styles.operationSize}>+</span>
            </button>
        </div>
    );
}