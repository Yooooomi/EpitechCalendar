const fs = require('fs');
const colors = require('colors');

let writeErrorsToFile = false;

const Logger = {
    setErrorToFile: (status) => writeErrorsToFile = status,
    done: (...args) => console.log((new Date()).toUTCString(), '[DONE]'.green, ...args),
    log: (...args) => console.log((new Date()).toUTCString(), '[INFO]'.blue, ...args),
    warn: (...args) => console.log((new Date()).toDateString(), '[WARN]'.orange, ...args),
    error: (...args) => console.log((new Date()).toDateString(), '[ERROR]'.red, ...args),
    printError: (...args) => {
        if (writeErrorsToFile) {
            fs.appendFileSync();
        } else {
            console.error(...args)
        }
    }
};

module.exports = { Logger };