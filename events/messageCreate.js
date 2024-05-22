/*
This event runs every time that a message in a server with Moebius is sent.
To prevent this from lagging the bot, expensive logic will only be run when the bot is mentioned.
Users who opted into the blacklist will not have the bot respond to their messages.
*/

/* eslint-disable no-unused-vars */
const { Events } = require('discord.js');
const Blacklist = require('../utils/schemas/Blacklist.js');
const { messageResponses, clientID } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // If the author of the message is a bot OR
        //  if the message is an @everyone or @here, do nothing.
        if (message.author.bot) { return; }
        else if (message.mentions.everyone) { return; }

        // Get the user's entry on the blacklist
        // If the user isn't in the blacklist, then this will be undefined.
        const blacklistStatus = await Blacklist.findOne({
            userID: message.author.id,
        });

        // Only respond when mentioned
        if (!blacklistStatus) {
            const content = message.content.toLowerCase();
            if (message.mentions.has(clientID)) {
                // If the user is NOT in the blacklist, respond with a random message from the list in the config file.
                return message.reply(messageResponses[Math.floor(Math.random() * messageResponses.length)]).catch(error => {
                    console.log('Unable to respond to ping.');
                });
            }
            if (content.includes('time')) {
                // If the user is NOT in the blacklist, respond to any message containing the word "time"
                return message.reply('It\'s moebin\' time!').catch(error => {
                    console.log('Cannot reply to message containing time');
                });
            }
            if (content.includes('yippee')) {
                // If the user is NOT in the blacklist, react to any message containing the word "yippee"
                return message.react('<:yippee:1219088376783831182>').catch(error => {
                    console.log('Cannot react to message containing yippee');
                });
            }
        }
    },
};