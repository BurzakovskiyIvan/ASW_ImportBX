const INITIAL_FOLDER_PATH = "C:/For_testing";

function validateAnswer(answer) {
    if(answer !== "done") {
        console.error(`*** ERROR *** You must type "done" after you finish importing into ${INITIAL_FOLDER_PATH}. Testing is stopped!!!`);
        return false;
    } else {
        return true;
    }
}

// The main function
function startTesting() {
    console.info("--- Testing is started... ---");
}

module.exports = { validateAnswer, startTesting };