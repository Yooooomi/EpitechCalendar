const fs = require('fs');
const colors = require('colors');
const { ERROR_FILE } = require('./config/config');

let writeErrorsToFile = false;

const Logger = {
    setErrorToFile: (status) => writeErrorsToFile = status,
    done: (...args) => console.log((new Date()).toUTCString(), '[DONE]'.green, ...args),
    log: (...args) => console.log((new Date()).toUTCString(), '[INFO]'.blue, ...args),
    warn: (...args) => console.log((new Date()).toDateString(), '[WARN]'.orange, ...args),
    error: (...args) => console.log((new Date()).toDateString(), '[ERROR]'.red, ...args),
    printError: e => {
        if (writeErrorsToFile) {
            fs.appendFileSync(ERROR_FILE, e);
        } else {
            console.error(e);
        }
    },
};

module.exports = { Logger };