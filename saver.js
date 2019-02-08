const fs = require('fs');

let init = false;
let lastInfos = null;

const loadInfos = () => {
    try {
        let data = fs.readFileSync('./config/save.json');
        data = data.toString();
        return JSON.parse(data);
    } catch (e) {
        return ({});
    }
}

const saveInfos = infos => {
    lastInfos = { ...lastInfos, ...infos };
    fs.writeFileSync('./config/save.json', JSON.stringify(lastInfos));
}

const getLastInfos = () => {
    if (!init && !lastInfos) {
        init = true;
        lastInfos = loadInfos();
        return lastInfos;
    }
    return lastInfos;
}

module.exports = {
    loadInfos,
    saveInfos,
    getLastInfos,
};