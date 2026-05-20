import { useContext, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { colors } from "../../utils/color";
import icon from "../../assets/images/icon/OBplaygroundLogo.png"
import { qrStyles } from "./styles";
import { StoreContext } from "../../context/context";
import { useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * functional component for qr code
 * Le QR encode le lien Drive de téléchargement direct
 * Format : https://drive.google.com/uc?export=download&id=FILE_ID
 * → l'app OpenBot scanne ce QR, télécharge le .js et l'exécute sur le robot
 */
const QrCode = () => {
    const [qrValue, setQrValue] = useState(undefined);
    const { code, generateCode: generate, driveLink } = useContext(StoreContext);
    const themes = useTheme();
    const isMobile = useMediaQuery(themes.breakpoints.down('md'));

    useEffect(() => {
        if (driveLink) {
            // ✅ Cas 1 : fichier uploadé sur Drive → QR = lien téléchargement direct
            setQrValue(driveLink);
            console.log('📲 QR encode le lien Drive:', driveLink);
        } else if (code) {
            // ⚠️ Cas 2 : pas encore uploadé → QR encode le code brut (fallback)
            setQrValue(JSON.stringify(code));
            console.log('⚠️ QR encode le code brut (pas encore uploadé sur Drive)');
        }
    }, [code, generate, driveLink]);

    const qrcode = qrValue ? (
        <QRCodeCanvas
            id="qrCode"
            value={qrValue}
            size={isMobile ? 130 : 200}
            bgColor={colors.whiteFont}
            includeMargin={true}
            imageSettings={{ src: icon }}
        />
    ) : null;

    return (
        <div className="qrcode__container">
            <div style={isMobile ? qrStyles.mobileMain : qrStyles.main}>
                {qrcode}
                {driveLink && (
                    <p style={{ fontSize: 10, textAlign: 'center', marginTop: 4, wordBreak: 'break-all', color: '#555' }}>
                        {driveLink}
                    </p>
                )}
            </div>
        </div>
    );
};

export default QrCode;