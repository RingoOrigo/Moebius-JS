/*
    This is an event that will run when the bot is ready.
    The bot is "ready" when it is started and fully loaded.
*/

const { Events, ActivityType } = require('discord.js');
const { status } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        client.user.setActivity(status, { type: ActivityType.Watching });
	},
};
