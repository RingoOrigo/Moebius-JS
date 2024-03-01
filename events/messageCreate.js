/*
    This event runs every time that a message in a server with Moebius is sent.
    To prevent this from lagging the bot, expensive logic will only be run when the bot is mentioned.
        Users who opted into the blacklist will not have the bot respond to their messages.
*/

const { Events } = require('discord.js');
const Blacklist = require('../utils/schemas/Blacklist.js');
const { messageResponses, testID } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // If the author of the message is a bot OR
        //  if the message is an @everyone or @here, do nothing.
        if (message.author.bot) { return; }
        else if (message.mentions.everyone) { return; }
        else if (message.mentions.has(testID)) {
            // Get the user's entry on the blacklist
            // If the user isn't in the blacklist, then this will be undefined.
            const blacklistStatus = await Blacklist.findOne({
                userID: message.author.id,
            });

            // If the user is NOT in the blacklist, respond with a random message from the list in the config file.
            if (!blacklistStatus) {
                return await message.reply(messageResponses[Math.floor(Math.random() * messageResponses.length)]);
            }
        }
    },
};