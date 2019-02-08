const fs = require('fs');
const { google } = require('googleapis');
const { get } = require('./api');
const { TOKEN_PATH, CLIENT_ID_PATH, REMINDERS, LOGIN } = require('./config/config');
const getAccessToken = require('./getAccessToken');
const { Logger } = require('./logger');

// If modifying these scopes, delete token.json.
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

let auth = null;
let calendar = null;

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */

const initGoogle = async () => {
    const clientId = fs.readFileSync(CLIENT_ID_PATH).toString();
    const credentials = JSON.parse(clientId);
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    let token = null;
    try {
        token = fs.readFileSync(TOKEN_PATH).toString();
        oAuth2Client.setCredentials(JSON.parse(token));
    } catch (e) {
        token = await getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(token);
    }
    auth = oAuth2Client;
    calendar = google.calendar({ version: 'v3', auth });
}

// Load client secrets from a local file.

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const listEvents = (dateStart, dateEnd) => new Promise((s, f) => {
    calendar.events.list({
        calendarId: 'primary',
        timeMin: dateStart,
        timeMax: dateEnd,
        maxResults: 10,
    }, (err, res) => {
        if (err) return f(err);
        const events = res.data.items;
        s(events);
    });
})

const recordEvent = async event => new Promise((s, f) => {
    calendar.events.insert({
        calendarId: 'primary',
        resource: {
            summary: event.title,
            location: event.location,
            description: event.desc,
            start: {
                dateTime: event.timeStart,
                timeZone: 'Europe/Paris'
            },
            end: {
                dateTime: event.timeEnd,
                timeZone: 'Europe/Paris'
            },
            reminders: {
                useDefault: false,
                overrides: REMINDERS.map(e => ({ method: 'popup', minutes: e })),
            }
        }
    }, (err, res) => {
        if (err) return f(err);
        s(res);
    })
});

const compute = (activities, soutenances) => {
    const events = await listEvents((new Date()).toISOString(), (new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)).toISOString());

    computeActivities(activities, events);
    computeSoutenances(soutenances, events);
};

const computeSoutenances = async (soutenances, events) => {
    soutenances = soutenances.map(e => {
        let yaya = e.title.split('href="')[1];
        yaya = yaya.substr(0, yaya.indexOf('"'));
        return get(yaya);
    });
    try {
        soutenances = await Promise.all(soutenances);
    } catch (e) {
        Logger.error('Failed to get all soutenances in notifications');
        Logger.printError(e);
    }
    soutenances.forEach(e => {
        const sout = e.data;

        if (!sout.student_registered) return Logger.error(`Registered to soutenance indicating not registered (${sout.title})`);

        const location = sout.slots.room;
        const registeredSlot = sout.slots.slots.find(slot => slot.master.login === LOGIN || slot.members.some(mbs => mbs.login === LOGIN));

        if (!registeredSlot) return Logger.error(`No slot on registered soutenance (${sout.title})`);
        if (events.length && events.some(g_event => g_event.summary === registeredSlot.acti_title)) return;

        const startEvent = new Date(registeredSlot.date);

        // Already past event
        if (startEvent < Date.now()) return;

        const eventObj = {
            title: registeredSlot.acti_title,
            desc: sout.project.title + '\n\n' + e.config.url,
            location: location,
            timeStart: startEvent,
            timeEnd: new Date(startEvent.getTime() + registeredSlot.duration * 60 * 1000),
        }
        try {
            await recordEvent(eventObj);
            Logger.done('Event of type soutenance created for', registeredSlot.acti_title);
        } catch (e) {
            Logger.log('Failed to record an event for', registeredSlot.acti_title);
            Logger.error(e);
        }
    });
};

const computeActivities = async (activities, events) => {
    activities = activities.map(e => {
        let yaya = e.title.split('href="')[1];
        yaya = yaya.substr(0, yaya.indexOf('"'));
        return get(yaya);
    });
    try {
        activities = await Promise.all(activities);
    } catch (e) {
        Logger.error('Failed to get all activities in notifications');
        Logger.printError(e);
    }
    activities.forEach(async e => {
        const intraEvents = e.data.events.filter(e => e.user_status === 'present' || e.already_register !== null);
        const url = e.config.url;

        // If no event is linked to the registration or the user isn't registered to any
        if (!intraEvents || !intraEvents.length) return;
        // If an upcoming event already has the same name then dont do anything
        if (events.length && events.some(g_event => g_event.summary === e.data.title)) {
            return;
        }

        intraEvents.forEach(async intraEvent => {
            // If the event is before now
            if (Date.parse(intraEvent.begin) < Date.now()) return;

            const eventObj = {
                title: e.data.title,
                desc: e.data.module_title + '\n\n' + url,
                location: intraEvent.location,
                timeStart: new Date(intraEvent.begin),
                timeEnd: new Date(intraEvent.end),
            }
            try {
                await recordEvent(eventObj);
                Logger.done('Event of type activity created for', e.data.title);
            } catch (e) {
                Logger.log('Failed to record an event for', e.data.title);
                Logger.error(e);
            }
        });
    });
}

module.exports = {
    compute,
    initGoogle,
};