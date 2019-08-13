const fs = require('fs');

const INITIAL_FOLDER_PATH = "C:/For_testing";
const REPORT_FILE_PATH = `${INITIAL_FOLDER_PATH}/Report.txt`;

let reportStream;

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
    await createReportFile();
    if(await !checkInitialFolderExistence()) {
        return
    }
}

async function createReportFile() {
    reportStream = await fs.createWriteStream(REPORT_FILE_PATH);
    await addLogToReportFile("--- Testing is running... ---");
}

function addLogToReportFile(text) {
    reportStream.write(`${returnCurrentDate()} ${text}\n`);
}

function returnCurrentDate() {
    return new Date().toISOString();
}

async function checkInitialFolderExistence() {
    await addLogToReportFile(`--- Checking the folder ${INITIAL_FOLDER_PATH} existence... ---`);
    fs.readdir(INITIAL_FOLDER_PATH, (err) => {
        if(err) {
            addLogToReportFile(`*** ERROR **** The folder ${INITIAL_FOLDER_PATH} doesn\'t exist. Testing is stopped!!! ***`);
            return false;
        } else {
            addLogToReportFile(`--- The folder ${INITIAL_FOLDER_PATH} exists... ---`);
            return true;
        };
    });
}

module.exports = { validateAnswer, startTesting };