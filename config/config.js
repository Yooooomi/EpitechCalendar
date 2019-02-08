

const config = {
    SCOPES: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    TOKEN_PATH: `${__dirname}/token.json`,
    CLIENT_ID_PATH: `${__dirname}/client_id.json`,
    ERROR_FILE: `${__dirname}/errors`,
    REFRESH: 1000 * 60 * 30,
    REMINDERS: [24 * 60, 60, 10],
    LOGIN: 'timothee.boussus@epitech.eu',
}

module.exports = config;