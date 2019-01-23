const saver = require('./saver');
const { axios } = require('./api');
const { REFRESH } = require('./config/config');
const { computeJSON, initGoogle } = require('./compute')
const { Logger } = require('./logger');

const checkReturn = {
    SUCCESS: 0,
    FAILURE: 1,
    RETRY: 2,
};

const sleep = ms => new Promise((res, _) => setTimeout(res, ms));

const login = async () => {
    try {
        const answer = await axios.get('/auth-6091d7718eb2a31e89e0ba5c71f804d34ff98e15', {
            maxRedirects: 0,
            validateStatus: status => status === 302,
        });
        Logger.log('Successfully logged to intra.epitech.eu');
        saver.saveInfos({ cookies: answer.headers['set-cookie'] });
        Logger.log('Successfully saved Epitech token to file');
        return answer.headers['set-cookie'];
    } catch (e) {
        Logger.error('Error while logging in to Epitech');
        Logger.printError(e);
        return null;
    }
}

const check = async () => {
    let cookies;
    if (saver.getLastInfos()) {
        cookies = saver.getLastInfos().cookies;
    } else {
        cookies = await login();
    }
    try {
        const answer = await axios.get('/', {
            params: {
                format: 'json',
            },
            headers: {
                Cookie: cookies,
            }
        });
        const activities = answer.data.history.filter(e => e.title.startsWith('You have joined'));
        computeJSON(activities);
    } catch (e) {
        if (e.response && e.response.status === 401) {
            Logger.warn('Epitech token not valid anymore');
            await login();
            return checkReturn.RETRY;
        } else {
            Logger.printError(e);
            return checkReturn.FAILURE;
        }
    }
    return checkReturn.SUCCESS;
}

async function main() {
    Logger.setErrorToFile(true);
    Logger.log('Start of program, initializing Google tokens');
    await initGoogle();
    Logger.log(`Starting loop, syncing every ${REFRESH / 1000 / 60} minutes`)
    while (true) {
        Logger.log('Syncing...')
        const res = await check();
        if (res !== checkReturn.RETRY) {
            await sleep(REFRESH);
            Logger.log('Sleeping...');
        }
    }
}

main();