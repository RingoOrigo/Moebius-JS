/*
    This is an event that will run when the bot is ready.
    The bot is "ready" when it is started and fully loaded.
*/

const { Events, ActivityType } = require('discord.js');
const { statuses } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.displayName}`);

		// Immediately set a status, before the interval code begins.
        client.user.setActivity(statuses[Math.floor(Math.random() * statuses.length)], {
			type: ActivityType.Custom,
		});

		// Set this code to execute in a set interval. In milliseconds.
		setInterval(() => {
			// Choose a random status from the list within the config file.
			client.user.setActivity(statuses[Math.floor(Math.random() * statuses.length)], {
				type: ActivityType.Custom,
			});
		}, 900000);

	},
};
