/*
    This is a basic help command
        When run, Moebius will send a message with interactive buttons corresponding to each category of command.
        When a category is selected, information on all commands within the category will be detailed in a separate message
*/

const { SlashCommandBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View a menu to receive detailed information on various commands'),

    async execute(interaction) {
        // Build a default embed to be edited based upon the user's choice of button later.
        const helpEmbed = new EmbedBuilder()
            .setColor('f0b3be')
            .setAuthor({
                name: `${botName}`,
                iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
            })
            .setTimestamp()
            .setFooter({
                text: `Brought to you by ${botName}`,
                iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
            });

        // Create a button for each category of command
        const econButton = new ButtonBuilder()
            .setCustomId('economy')
            .setLabel('Economy')
            .setStyle(ButtonStyle.Primary);

        const utilButton = new ButtonBuilder()
            .setCustomId('utility')
            .setLabel('Utility')
            .setStyle(ButtonStyle.Primary);

        const funButton = new ButtonBuilder()
            .setCustomId('fun')
            .setLabel('Fun')
            .setStyle(ButtonStyle.Primary);

        const quitButton = new ButtonBuilder()
            .setCustomId('quit')
            .setLabel('Close')
            .setStyle(ButtonStyle.Secondary);

        // Add each button to an action row that will be attached to the interaction's reply
        const row = new ActionRowBuilder()
            .addComponents(econButton, utilButton, funButton, quitButton);

        const response = await interaction.reply({
            content : 'Click or tap on one of the buttons below to view detailed information on every supported command!',
            components: [row],
            ephemeral: true,
        });

        const collector = response.createMessageComponentCollector({
            // Component type 2 corresponds to Button input
            componentType: 2,
            time: 300_000,
            idle: 120_000,
        });

        collector.on('collect', async selection => {
            // Now that the button interaction has been stored, act accordingly
            if (selection.customId == 'economy') {
                helpEmbed.setTitle(`${botName} Economy Commands`)
                    .addFields(
                        { name: '/shop:', value: `Spend your ${currencyName}s for profile items.`, inline: true },
                        { name : '/stats:', value: 'View detailed statistics regarding the specified user\'s hauls.', inline: true },
                        { name: '/leaderboard:', value: `View the global ${currencyName} leaderboard.`, inline: true },
                        { name: '/haul:', value: `Earn a random amount of ${currencyName}s for yourself or another server member once every 90 minutes! You can choose to be reminded when the cooldown has expired.`, inline: true },
                        { name: '`/pay`:', value: `Pay another user the amount of ${currencyName}s specified from your own balance.`, inline: true },
                    );
            }
            if (selection.customId == 'utility') {
                helpEmbed.setTitle(`${botName} Utility Commands`)
                    .addFields(
                        { name: '/blacklist', value: `Choose to put yourself on the list of users that ${botName} will NOT respond to outside of commands.`, inline: true },
                        { name: '/info', value: 'Displays information on various specified topics', inline: true },
                        { name: '/profile', value: 'Display a user\'s customized profile card.', inline: true },
                    );
            }
            if (selection.customId == 'fun') {
                helpEmbed.setTitle(`${botName} Fun Commands`)
                    .addFields(
                        { name: '/cool', value: 'Display how cool you are on a scale of 1 - 10.', inline: true },
                        { name: '/roulette', value: 'Play a roulette with your choice of difficulty. (Most difficulties are wildly unfair)', inline: true },
                        { name: '/moeb', value: 'Display an on-command "IT\'S MOEBIN TIME" message.', inline: true },
                        { name: '/echo', value: `Have ${botName} echo your message in standard text or bubble letters. Choose whether to remain anonymous or be quoted.`, inline: true },
                    );
            }
            // Update the interaction message
            if (selection.customId != 'quit') {
                await selection.update({
                    content : `Displaying the ${selection.customId} command menu:`,
                    components: [row],
                    embeds: [helpEmbed],
                    ephemeral: true,
                });
            }
            else {
                await selection.update({
                    content: 'Successfully closed the menu, you may now dismiss this message.',
                    ephemeral: true,
                    embeds: [],
                    components: [],
                });
            }
        });

        // Update the interaction when the collector times out.
        // eslint-disable-next-line no-unused-vars
        collector.on('end', async i => {
            await interaction.editReply({
                content: 'Interactions with this menu have been disabled due to inactivity. You may now dismiss this message.',
                ephemeral: true,
                embeds: interaction.embeds,
                components: [],
            });
        });
    },
};