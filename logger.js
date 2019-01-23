const fs = require('fs');

let writeErrorsToFile = false;

const Logger = {
    setErrorToFile: (status) => writeErrorsToFile = status,
    log: (...args) => console.log(`${(new Date()).toUTCString()} [INFO]`, ...args),
    warn: (...args) => console.log(`${(new Date()).toDateString()} [WARN]`, ...args),
    error: (...args) => console.log(`${(new Date()).toDateString()} [ERROR]`, ...args),
    printError: (...args) => {
        if (writeErrorsToFile) {
            fs.appendFileSync();
        } else {
            console.error(...args)
        }
    }
};

module.exports = { Logger };