/*
    A simple command to respond to the user.
        - Essentially Moebius's version of the "/ping Pong!" loop
*/

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moeb')
        .setDescription('Declares the time of day (It\'s always moebin\' time)'),

    async execute(interaction) {
        // Simply respond to the user
        interaction.reply('IT\'S MOEBIN\' TIME!');
    },
};