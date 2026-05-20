import { Constants, errorToast, localStorageKeys } from "../utils/constants";
import { FormatDate, getCurrentProject } from "./workspace";

/**
 * function that upload project data on Google Drive
 * @param data
 * @param fileType
 * @returns {Promise<void>}
 */
export const uploadToGoogleDrive = async (data, fileType) => {
    const accessToken = getAccessToken();

    // ══ DEBUG ══
    console.log('🔑 accessToken:', accessToken ? accessToken.substring(0, 20) + '...' : 'NULL ← PROBLÈME ICI');
    console.log('📁 fileType:', fileType);
    console.log('📄 data:', typeof data === 'string' ? data.substring(0, 80) + '...' : data);
    console.log('🔐 isSigIn:', localStorage.getItem('isSigIn'));
    console.log('📦 currentProject:', localStorage.getItem('currentProject'));
    // ══════════

    if (!accessToken) {
        errorToast('Token Google manquant — reconnecte-toi avec Google');
        throw new Error('Token Google manquant');
    }

    let folderId = await getFolderId();
    console.log('📂 folderId:', folderId);

    if (!folderId) {
        console.log('📂 Création du dossier OpenBot...');
        folderId = await CreateFolder(accessToken);
        console.log('📂 Nouveau folderId:', folderId);
    }

    let response;

    if (fileType === Constants.xml || fileType === Constants.js || fileType === Constants.json) {
        response = await uploadFileToFolder(accessToken, data, folderId, fileType);
    } else if (fileType === Constants.tflite) {
        response = await uploadTfliteFile(accessToken, data, folderId);
    }

    console.log('✅ Upload response:', response);
    return response;
};


/**
 * uploading file to folder
 */
const uploadFileToFolder = async (accessToken, data, folderId, fileType) => {
    let fileMetadata = {
        name: getCurrentProject().projectName + ".js",
        parents: [folderId],
        mimeType: "text/javascript",
        content_type: "application/json; charset=UTF-8",
        appProperties: {
            date: FormatDate().currentDate,
            time: FormatDate().currentTime,
            updatedTime: new Date(),
            storage: "drive",
        },
    };
    let metadataFields = 'appProperties,id,name,createdTime';
    let mediaPart;

    if (fileType === Constants.xml) {
        fileMetadata = {
            ...fileMetadata,
            name: data.projectName + ".xml",
            mimeType: "text/xml",
        };
    } else if (fileType === Constants.json) {
        fileMetadata = {
            ...fileMetadata,
            name: "config.json",
            mimeType: "application/json",
        };
    }

    const boundary = "foo_bar_baz";
    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(fileMetadata)}\r\n`;

    if (fileType === Constants.xml) {
        mediaPart = `--${boundary}\r\nContent-Type: ${fileMetadata.mimeType}\r\n\r\n${data.xmlValue}\r\n`;
    } else {
        mediaPart = `--${boundary}\r\nContent-Type: ${fileMetadata.mimeType}\r\n\r\n${data}\r\n`;
    }

    const requestBody = `${metadataPart}${mediaPart}--${boundary}--\r\n`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": requestBody?.length,
    };

    let fileExistWithFileID;
    if (fileType === Constants.xml) {
        fileExistWithFileID = await checkFileExistsInFolder(folderId, data.projectName, 'xml');
    } else if (fileType === Constants.js) {
        fileExistWithFileID = await checkFileExistsInFolder(folderId, getCurrentProject().projectName, 'js');
    } else if (fileType === Constants.json) {
        fileExistWithFileID = await checkFileExistsInFolder(folderId, "config", 'json');
    }

    console.log('📝 fileExistWithFileID:', fileExistWithFileID);
    return await updateExistingFile(fileExistWithFileID, data, folderId, metadataFields, headers, requestBody);
};


/**
 * function to update existing drive file
 */
async function updateExistingFile(fileExistWithFileID, data, folderId, metadataFields, headers, requestBody) {
    let res;
    if (fileExistWithFileID.exists) {
        console.log('🗑️ Fichier existant — suppression puis recréation...');
        await deleteFileFromGoogleDrive(fileExistWithFileID.fileId).then(async () => {
            res = await CreateFile(data, folderId, metadataFields, headers, requestBody);
        });
    } else {
        console.log('🆕 Nouveau fichier — création...');
        res = await CreateFile(data, folderId, metadataFields, headers, requestBody);
    }
    return res;
}


/**
 * check file exist or not
 */
export async function checkFileExistsInFolder(folderId, fileName, fileType) {
    const accessToken = getAccessToken();
    let fileNameWithExtension = fileName;
    if (fileType === Constants.js) {
        fileNameWithExtension += `.${Constants.js}`;
    } else if (fileType === Constants.xml) {
        fileNameWithExtension += `.${Constants.xml}`;
    } else if (fileType === Constants.json) {
        fileNameWithExtension += `.${Constants.json}`;
    }
    const response = await fetch(`${Constants.baseUrl}/files?q=name='${encodeURIComponent(fileNameWithExtension)}'+and+'${encodeURIComponent(folderId)}'+in+parents+and+trashed=false&access_token=${accessToken}`);
    const result = await response.json();
    if (result && result.files.length > 0) {
        return { exists: true, fileId: result.files[0].id };
    } else {
        return { exists: false };
    }
}


/**
 * Create folder
 */
async function CreateFolder(accessToken) {
    const folderMetadata = {
        name: Constants.FolderName,
        mimeType: "application/vnd.google-apps.folder"
    };
    const data = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(folderMetadata)
    };
    return await fetch(`${Constants.baseUrl}/files/`, data)
        .then(response => response.json())
        .then(folder => {
            console.log('📂 Dossier créé:', folder.id);
            makeFolderPublic(folder.id, accessToken);
            return folder.id;
        })
        .catch(error => {
            console.error('❌ Erreur création dossier:', error);
        });
}


/**
 * get folder id
 */
export async function getFolderId() {
    const accessToken = getAccessToken();
    const searchResponse = await fetch(`${Constants.baseUrl}/files?q=name='${encodeURIComponent(Constants.FolderName)}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&access_token=${accessToken}`);
    const searchResult = await searchResponse.json();
    return searchResult?.files[0]?.id || null;
}


/**
 * getting access token from local storage
 */
export function getAccessToken() {
    return localStorage.getItem(localStorageKeys.accessToken);
}


/**
 * create file in google drive
 */
export function CreateFile(data, folderId, metadataFields, headers, requestBody) {
    let apiEndpoint = 'https://www.googleapis.com/upload/drive/v3/files/?uploadType=multipart';
    if (metadataFields) {
        apiEndpoint += `&fields=${metadataFields}`;
    }
    return fetch(apiEndpoint, {
        method: "POST",
        headers: headers,
        body: requestBody
    })
        .then(response => response.json())
        .catch(() => errorToast("error in upload"))
        .then(async (file) => {
            if (!file) return null;
            if (file.error) {
                console.error('❌ Erreur API Drive:', file.error);
                errorToast(file.error.message);
                return null;
            }
            console.log('✅ Fichier créé:', file.name, file.id);
            const isJSFile = file?.name.endsWith('.js');
            file && SharingFileFromGoogleDrive(file?.id, isJSFile);
            if (isJSFile) {
                const link = await getShareableLink(file.id, folderId);
                console.log('🔗 Lien Drive:', link);
                return link;
            } else {
                return true;
            }
        })
        .catch(error => {
            errorToast("error in upload");
            console.error('❌ CreateFile error:', error);
        });
}


/**
 * get all projects from Google Drive
 */
export async function getAllFilesFromGoogleDrive() {
    const accessToken = getAccessToken();
    const folderId = await getFolderId();
    if (folderId) {
        const filesResponse = await fetch(`${Constants.baseUrl}/files?q=trashed=false and parents='${folderId}'&fields=files(id,name,createdTime,modifiedTime,appProperties,mimeType)&access_token=${accessToken}`);
        const filesResult = await filesResponse.json();
        await Promise.all(filesResult.files?.map(async (file) => {
            if (file.id) {
                file.xmlValue = await getSelectedProjectFromGoogleDrive(folderId, file.id, accessToken);
            }
        }));
        return filesResult.files;
    } else {
        return [];
    }
}


/**
 * get selected project data
 */
export async function getSelectedProjectFromGoogleDrive(folderId, fileId, accessToken) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    return await fetch(`${Constants.baseUrl}/files/${fileId}?parents=${folderId}&alt=media`, {
        method: "GET",
        headers: headers,
    })
        .then((response) => response.text())
        .then((data) => data)
        .catch((error) => { console.log(error); });
}


/**
 * deleting file
 */
export async function deleteFileFromGoogleDrive(fileId) {
    const folderId = await getFolderId();
    const accessToken = getAccessToken();
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    fetch(`${Constants.baseUrl}/files/${fileId}?supportsAllDrives=true&parents=${folderId}`, {
        method: "DELETE",
        headers: headers
    }).catch((err) => {
        errorToast("Something went wrong.");
        console.log(err);
    });
}


/**
 * permissions for sharing Google Drive files
 */
export function SharingFileFromGoogleDrive(fileId, isJSFile) {
    const accessToken = getAccessToken();
    if (isJSFile === true) {
        const permission = { 'type': 'anyone', 'role': 'reader' };
        const params = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(permission)
        };
        fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=false&supportsAllDrives=true`, params)
            .then(response => {
                if (!response.ok) throw new Error('An error occurred while sharing the file.');
            })
            .catch(error => console.error(error));
    }
}


/**
 * ✅ MODIFIÉE — retourne le lien de téléchargement direct pour OpenBot
 * Format : https://drive.google.com/uc?export=download&id=FILE_ID
 * L'app OpenBot scanne ce QR et télécharge directement le .js
 */
export async function getShareableLink(fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
}


/**
 * function to get download link
 */
export async function getDownloadedLink(fileId, folderId) {
    const accessToken = getAccessToken();
    const params = {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + accessToken }
    };
    return await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?parents=${folderId}&fields=webContentLink&supportsAllDrives=true`, params)
        .then(response => {
            if (!response.ok) throw new Error('An error occurred.');
            return response.json();
        })
        .then(data => data.webContentLink)
        .catch(error => console.error(error));
}


/**
 * Rename file
 */
export async function fileRename(newFileName, oldName, fileType) {
    const folderId = await getFolderId();
    const accessToken = getAccessToken();
    let fileId = undefined;
    let body;
    if (fileType === Constants.xml) {
        fileId = await checkFileExistsInFolder(folderId, oldName, Constants.xml);
        body = { "name": newFileName + `.${Constants.xml}` };
    } else {
        fileId = await checkFileExistsInFolder(folderId, oldName, Constants.js);
        body = { "name": newFileName + `.${Constants.js}` };
    }
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId.fileId}?parents=${folderId}&fields=name`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((res) => res.json())
        .catch(err => console.log(err));
}


/**
 * Google Drive folder made public
 */
export const makeFolderPublic = async (folderId, accessToken) => {
    const url = `${Constants.baseUrl}/files/${folderId}/permissions`;
    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'anyone', role: 'reader' }),
    };
    await fetch(url, options).catch(() => errorToast("Something went wrong"));
};


/**
 * upload tflite file
 */
const uploadTfliteFile = async (accessToken, data, folderId) => {
    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
    const metadata = {
        name: data.name + `.${Constants.tflite}`,
        mimeType: 'application/octet-stream',
        parents: [folderId]
    };
    const metadataStr = JSON.stringify(metadata);
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
    };
    const initiateResponse = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: metadataStr,
    }).catch((err) => { console.log(err); });

    const locationUrl = initiateResponse.headers.get('Location');
    const fileContentHeaders = {
        'Content-Type': 'application/octet-stream',
        'Content-Length': data.fileData.size,
    };
    return await fetch(locationUrl, {
        method: 'POST',
        headers: fileContentHeaders,
        body: data.fileData,
    })
        .then(response => response.json())
        .catch(() => errorToast("error in upload"))
        .then(async (file) => {
            const isTfliteFile = file?.name.endsWith('.tflite');
            file && SharingFileFromGoogleDrive(file?.id, isTfliteFile);
            if (isTfliteFile) {
                return await getDownloadedLink(file.id, folderId);
            } else {
                return true;
            }
        })
        .catch((err) => { console.log(err); });
};