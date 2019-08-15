const fs = require('fs');

const INITIAL_FOLDER_PATH = "C:\\For_testing";
const REPORT_FILE_PATH = `${INITIAL_FOLDER_PATH}/Report.txt`;
const DEST_FOLDER_PATH_64 = "C:\\Program Files (x86)\\StoreLine\\Office\\Import";
const DEST_FOLDER_PATH_32 = "C:\\Program Files\\StoreLine\\Office\\Import";

let reportStream,
    initialFolderContent = [],
    trueDestFolder;

function validateAnswer(answer) {
    if(answer !== "done") {
        console.error(`*** ERROR *** You must type "done" after you finish importing into ${INITIAL_FOLDER_PATH}. Testing is stopped!!!`);
        return false;
    } else {
        return true;
    }
}

// The main function
async function startTesting() {
    console.info("--- Testing is started... ---");

    let initialFolderExists = await checkInitialFolderExistence();
    if(!initialFolderExists) return;

    let initialFolderIsNotEmpty = await checkInitialFolderContent();
    if(!initialFolderIsNotEmpty) return;

    await showInitialFolderContent();

    let truePathToImportFolder = await searchForStorelineImportFolder();
    if(!truePathToImportFolder) return;


}

function checkInitialFolderExistence() {
    console.log(`--- Checking the folder ${INITIAL_FOLDER_PATH} existence... ---`);
    try {
        initialFolderContent = fs.readdirSync(INITIAL_FOLDER_PATH);
        createReportFile();
        addLogToReportFile(`--- The folder ${INITIAL_FOLDER_PATH} exists... ---`);
        return true;
    }
    catch(err) {
        console.log(`*** ERROR **** The folder ${INITIAL_FOLDER_PATH} doesn\'t exist. Testing is stopped!!! ***`);
        return false;
    }
}

function createReportFile() {
    reportStream = fs.createWriteStream(REPORT_FILE_PATH, {flags: 'a'});
    reportStream.write(`${returnCurrentDate()} --- Testing is started... ---\r\n`);
}

function addLogToReportFile(text) {
    reportStream.write(`${returnCurrentDate()} ${text}\r\n`);
    console.log(text);
}

function returnCurrentDate() {
    return new Date().toISOString();
}

function checkInitialFolderContent() {
    if(initialFolderContent.length === 0) {
        addLogToReportFile(`*** ERROR **** The folder ${INITIAL_FOLDER_PATH} is empty. Testing is stopped!!! ***`);
        return false;
    } else {
        return true;
    }
}

function showInitialFolderContent() {
    addLogToReportFile(`--- The folder contains the next files: ---`);
    for(let i = 0, len = initialFolderContent.length; i < len; i++) {
        addLogToReportFile(`${initialFolderContent[i]}`);
    }
}

function searchForStorelineImportFolder() {
    addLogToReportFile(`--- Searching for ".../StoreLine/Office/Import" folder... ---`);
    let contentOfDestFolder;
    try {
        contentOfDestFolder = fs.readdirSync(DEST_FOLDER_PATH_32);
        if(contentOfDestFolder.length) {
            addLogToReportFile(`--- The folder ${DEST_FOLDER_PATH_32} was successfully found... ---`);
            trueDestFolder = DEST_FOLDER_PATH_32;
            return true;
        } else {
            addLogToReportFile(`*** ERROR *** The folder ${DEST_FOLDER_PATH_32} was successfully found but it's empty... ---`);
            return false;
        }
    }
    catch(err) {
        try {
            contentOfDestFolder = fs.readdirSync(DEST_FOLDER_PATH_64);
            if(contentOfDestFolder.length) {
                addLogToReportFile(`--- The folder ${DEST_FOLDER_PATH_64} was successfully found... ---`);
                trueDestFolder = DEST_FOLDER_PATH_64;
                return true;
            } else {
                addLogToReportFile(`*** ERROR *** The folder ${DEST_FOLDER_PATH_64} was successfully found but it's empty... ---`);
                return false;
            }
        }
        catch(error) {
            addLogToReportFile(`*** ERROR *** The folder ".../StoreLine/Office/Import" was not found ***`);
            return false;
        }
    }
}

module.exports = { validateAnswer, startTesting };