const fs = require('fs');

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
    lastInfos = {...lastInfos, ...infos};
    fs.writeFileSync('./config/save.json', JSON.stringify(lastInfos));
}

const getLastInfos = () => lastInfos;

module.exports = {
    loadInfos,
    saveInfos,
    getLastInfos,
};