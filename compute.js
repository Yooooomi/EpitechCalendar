const fs = require('fs');
const { google } = require('googleapis');
const { get } = require('./api');
const { TOKEN_PATH, CLIENT_ID_PATH, REMINDERS } = require('./config/config');
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

const computeJSON = async activities => {
    const events = await listEvents((new Date()).toISOString(), (new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)).toISOString());
    activities = activities.map(e => {
        let yaya = e.title.split('href="')[1];
        yaya = yaya.substr(0, yaya.indexOf('"'));
        return get(yaya);
    });
    try {
        activities = await Promise.all(activities);
    } catch (e) {
        Logger.log('Failed to get all activities in notifications');
        Logger.error(e);
    }
    activities.forEach(async e => {
        const intraEvents = e.data.events.filter(e => e.user_status === 'present');
        const url = e.config.url;

        // If no event is linked to the registration or the user isn't registered to any
        if (!intraEvents || intraEvents.length || !intraEvents.some(e => e.user_status == 'present')) return;
        // If an upcoming event already has the same name then dont do anything
        if (events.length && events.some(g_event => g_event.summary === e.data.title)) {
            return;
        }

        intraEvents.forEach(async intraEvent => {
            // If the event is before now
            if (Date.parse(intraEvent.begin) < Date.now()) return;

            const eventObj = {
                title: e.data.title,
                desc: url,
                location: intraEvent.location,
                timeStart: new Date(intraEvent.begin),
                timeEnd: new Date(intraEvent.end),
            }
            try {
                await recordEvent(eventObj);
                Logger.log('Event created for', e.data.title);
            } catch (e) {
                Logger.log('Failed to record an event for', e.data.title);
                Logger.error(e);
            }
        });
    });
}

module.exports = {
    computeJSON,
    initGoogle,
};