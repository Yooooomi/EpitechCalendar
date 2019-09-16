

const config = {

    // Refresh rate of the application
    REFRESH: 1000 * 5,// * 60 * 30,

    // Reminders in minutes
    REMINDERS: [24 * 60, 60, 10],

    // Epitech credentials
    LOGIN: 'timothee.boussus@epitech.eu',
    AUTOLOGIN: '/auth-05f1d03357f9660c3dd0438f800cea275a15d606',

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