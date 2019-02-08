# Epitech Calendar to Google Calendar

Registers activities (kick-offs, etc.) and soutenances (follow-up, review, etc.) to your google calendar.

## Requirements

You need several things to get it working:

* `nodejs`: Version 8 min
* `client_id.json`: Google credentials to get in your API portal (console.google.com)
    * Put it in /config/client_id.json
* `config.json`: You need to fill the required informations in this file
    * `REFRESH`: Application's refresh rate
    * `REMINDERS`: Array of 'minutes', representing the reminders on your phone before the event
    * `LOGIN`: Your Epitech E-mail address
    * `AUTOLOGIN`: Your autologin link (begins with `/auth-`)

## Installation

1. `git clone https://github.com/Yooooomi/EpitechCalendar.git`
2. `cd EpitechCalendar && npm install`
3. `node scheduler.js`
4. Optional: Instead of just launching, prevent it from crashing by: `while [ 1 ]; do node scheduler.js; done`

## Roadmap

| Type              |     Working     | Depends on master of group | Incoming |
| :---------------- | :-------------: | :------------------------: | :------: |
| Activities        |        X        |                            |          |
| Soutenances       |                 |              X             |          |
| Projects Deadline |                 |                            |     X    |

## Miscellaneous

Hosting it on AWS really costs 0$ :)