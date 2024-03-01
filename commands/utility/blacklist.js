/*
    Allow the user to opt into the Moebius Blacklist with a simple command.
    As stated in the Blacklist.js file, a user on the blacklist will not be
        interacted with by Moebius without using a command.
*/

const { SlashCommandBuilder } = require('discord.js');
const { botName } = require('../../config.json');
const Blacklist = require('../../utils/schemas/Blacklist.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Opt in or out of the Moebius Blacklist')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Choose whether to opt in or out')
                .addChoices(
                    { name: 'Opt-In', value: 'in' },
                    { name: 'Opt-Out', value: 'out' },
                )
                .setRequired(true)),

    async execute(interaction) {
        const choice = interaction.options.getString('choice');

        let currentStatus;
        // Check if the user is currently on the blacklist.
        try {
            currentStatus = await Blacklist.findOne({
                userID: interaction.user.id,
            });
        }
        catch (e) { return console.log(e); }

        // Add the user to the blacklist if they so choose
        if (!currentStatus && choice == 'in') {
            currentStatus = new Blacklist({
                userID: interaction.user.id,
            });
            currentStatus.save();
            return await interaction.reply({ content: `You have opted into the ${botName} Blacklist:tm:. You will no longer be interacted with unless you use a ${botName} command.`, ephemeral: true });
        }

        try {
            await Blacklist.findOneAndDelete({
                userID: interaction.user.id,
            });
            return await interaction.reply({ content: `You have opted out of the ${botName} Blacklist:tm:. You will now be interacted with outside of commands.`, ephemeral: true });
        }
        catch (e) {
            return await interaction.reply({ content: `You cannot opt out of the ${botName} Blacklist:tm:, as you never opted into it.`, ephemeral: true });
        }
    },
};