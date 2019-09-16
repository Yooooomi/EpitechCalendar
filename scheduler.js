const saver = require('./saver');
const { axios } = require('./api');
const { REFRESH, AUTOLOGIN } = require('./config/config');
const { compute, initGoogle } = require('./compute')
const { Logger } = require('./logger');

const checkReturn = {
    SUCCESS: 0,
    FAILURE: 1,
    RETRY: 2,
};

const sleep = ms => new Promise((res, _) => setTimeout(res, ms));

const login = async () => {
    try {
        const answer = await axios.get(AUTOLOGIN, {
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
        const objs = answer.data.history.reduce((acc, curr) => {
            if (curr.title.startsWith('You have joined the activity') || curr.title.startsWith('You have been force-registered to the event')) acc.activities.push(curr);
            else if (curr.title.startsWith('You have registered') || curr.title.startsWith('Your group has been force-registered to the appointment slot'))
                acc.soutenances.push(curr);
            return acc;
        }, { activities: [], soutenances: [] });
        compute(objs.activities, objs.soutenances);
    } catch (e) {
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
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
    Logger.setErrorToFile(false);
    Logger.log('Start of program, initializing Google tokens');
    await initGoogle();
    Logger.done('Initialized Google tokens');
    Logger.log(`Starting loop, syncing every ${REFRESH / 1000 / 60} minutes`)
    while (true) {
        Logger.log('Syncing...')
        const res = await check();
        if (res !== checkReturn.RETRY) {
            Logger.log('Sleeping...');
            await sleep(REFRESH);
        }
    }
}

main();