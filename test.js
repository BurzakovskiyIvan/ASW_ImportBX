const fs = require("fs");
const LineByLineReader = require("line-by-line");
const sql = require("mssql");

const INITIAL_FOLDER_PATH = "C:\\For_testing";
const REPORT_FILE_PATH = `${INITIAL_FOLDER_PATH}/Report.txt`;
const DEST_FOLDER_PATH_64 = "C:\\Program Files (x86)\\StoreLine\\Office\\Import";
const DEST_FOLDER_PATH_32 = "C:\\Program Files\\StoreLine\\Office\\Import";

let reportStream,
    initialFolderContent = [],
    trueDestFolder,
    promotionsInBX257 = [],
    promotionsInStorelineDB = [];

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

    let connectedToStorelineDB = await connectToStorelineDB();
    if(!connectedToStorelineDB) return;

    let bx257Exists = await searchForBX257();
    if(!bx257Exists) return;
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

async function connectToStorelineDB() {
    addLogToReportFile("--- Connecting to StoreLine's database... ---");
    const config = {
        server: "localhost",
        user: "SA",
        password: "S@pwd01",
        database: "FrontOff",
    };
    const configWithoutPassword = {
        server: "localhost",
        user: "SA",
        password: "",
        database: "FrontOff",
    };
    let pool;
    try {
        pool = await sql.connect(config);
        addLogToReportFile("--- Connected to the database! ---");
        console.log(pool);
        await readStorelineDB(pool);
        addLogToReportFile("--- All needed information from StoreLine DB was successfully received ---");
        sql.close();
        return true;
    }
    catch(err) {
        try {
            pool = await sql.connect(configWithoutPassword);
            addLogToReportFile("--- Connected to the database without the password! ---");
            console.log(pool);
            await readStorelineDB(pool);
            addLogToReportFile("--- All needed information from StoreLine DB was successfully received ---");
            sql.close();
            return true;
        }
        catch(err) {
            addLogToReportFile("*** ERROR *** Can't connect to Storeline's database ***");
            sql.close();
            return false;
        }
    }
}

async function readStorelineDB(pool) {
    addLogToReportFile("--- Getting needed information from the Storeline database (promoID, promoDescription, promoStartDate, promoEndDate)... ---");
    const querySelectPromotionID = "select MMBR_PROM_ID from dbo.MMBR_PROM";
    const querySelectPromotionName = "select PROM_DESC from dbo.MMBR_PROM";
    const querySelectPromotionStartDate = "select STRT_DATE from dbo.MMBR_PROM";
    const querySelectPromotionEndDate = "select END_DATE from dbo.MMBR_PROM";

}

function searchForBX257() {
    addLogToReportFile("--- Searching for the file BX257 in C:/For_testing... ---");
    let bx257Exists = false;
    for(let i = 0, len = initialFolderContent.length; i < len; i++) {
        if(initialFolderContent[i].toUpperCase().substr(0, 5) === "BX257") {
            addLogToReportFile(`--- File ${initialFolderContent[i]} was found ---`);
            readBX257(initialFolderContent[i]);
            bx257Exists = true;
            break;
        }
    }
    if(!bx257Exists) addLogToReportFile("--- File BX257 was not found... ---");
    return bx257Exists;
}

function readBX257(file) {
    addLogToReportFile(`--- Start reading the file ${file} ---`);
    let fullPathToBX257 = INITIAL_FOLDER_PATH + "/" + file;
    let lineReader = new LineByLineReader(fullPathToBX257);

    lineReader.on("error", err => { throw err });

    lineReader.on("line", line => {
        promotionsInBX257.push({
            id: parseInt(line.substring(64, 74)),
            name: line.substring(80, 100).trim(),
            startDate: convertDate(line.substring(117, 124).trim()),
            endDate: convertDate(line.substring(74, 81).trim())
        })
    });

    lineReader.on("end", () => {
        promotionsInBX257.shift(); // Delete the first line because it contains '00000000'
        addLogToReportFile(`--- All needed information from ${file} was successfully read (promoID, promoName, promoStartDate, promoEndDate) ---`);
    });
}

function convertDate(date) {
    let splittedDate = date.split('');
    let decimalValue = parseInt(splittedDate[0], 16); // Convert hex value to decimal (A=10; B=11; C=12...)
    splittedDate[0] = decimalValue - 10;
    let convertedDate = splittedDate[0] + splittedDate[1] + '-' + splittedDate[2] + splittedDate[3] + '-' + splittedDate[4] + splittedDate[5];
    return convertedDate;
}

module.exports = { 
    validateAnswer, 
    startTesting
};