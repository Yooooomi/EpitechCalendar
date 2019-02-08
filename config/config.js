

const config = {

    // Refresh rate of the application
    REFRESH: 1000 * 60 * 30,

    // Reminders in minutes
    REMINDERS: [24 * 60, 60, 10],

    // Epitech credentials
    LOGIN: 'timothee.boussus@epitech.eu',
    AUTOLOGIN: '/auth-6091d7718eb2a31e89e0ba5c71f804d34ff98e15',

    /*
    -----
    You should not have to edit the following fields
    -----
    */

    TOKEN_PATH: `${__dirname}/token.json`,
    ERROR_FILE: `${__dirname}/errors`,

    // Scopes needed in order for the app to work
    SCOPES: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],

    // Google client id
    CLIENT_ID_PATH: `${__dirname}/client_id.json`,
}

module.exports = config;