/*
    Detail how cool the target user is
        - The "coolness" of a user is a random number between 1 and 10.
*/

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cool')
        .setDescription('Display how cool the target user is.')
        .addUserOption(option =>
            option.setName('target').setDescription('The target user').setRequired(true)),

    async execute(interaction) {
        // Generate the "cool value" between 1 and 10
        const coolVal = Math.floor(Math.random() * 10 + 1);
        const target = interaction.options.getUser('target');
        let content = `${target.displayName}, on a scale of 1 - 10, you get a ${coolVal} on the Moebius Cool Meter:tm:\n**|**`;
        let emote;

        // Use a different color for the bar depending on how full it will be.
        if (coolVal < 4) emote = ':red_square:';
        else if (coolVal < 7) emote = ':yellow_square:';
        else if (coolVal < 10) emote = ':green_square:';
        else emote = ':blue_square:';

        // Fill the bar according to the user's coolness.
        for (let i = 0; i < coolVal; i++) {
            content += emote;
        }
        // Finish the bar with the empty (if applicable)
        for (let i = coolVal; i < 10; i++) {
            content += ':black_large_square:';
        }
        // Finish the bar
        content += '**|**';

        await interaction.reply(content);

    },
};