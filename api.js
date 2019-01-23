const AxiosLib = require('axios');
const saver = require('./saver');

const axios = AxiosLib.create({
    baseURL: "https://intra.epitech.eu",
    headers: {
        Accept: 'application/json',
    },
});

const get = (url, options = {}) => {
    if (saver.getLastInfos().cookies) {
        return axios.get(url, {
            ...options,
            headers: {
                Cookie: saver.getLastInfos().cookies,
                ...options.headers,
            },
        });
    } else {
        return axios.get(url, options);
    }
}

module.exports = {
    axios,
    get,
};