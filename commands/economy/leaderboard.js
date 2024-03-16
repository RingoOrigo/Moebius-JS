/*
    Display the ten users with the highest currency balances
        Allow the user to choose whether the leaderboard is global or local (per guild)
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');
const UserProfile = require('../../utils/schemas/UserProfile.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription(`View a leaderboard of the users with the top ${currencyName} balances.`)
        .addStringOption(option =>
            option.setName('leaderboard')
                .setDescription('The type of leaderboard to display. Defaults to the persistent net worth leaderboard.')
                .addChoices(
                    { name: 'Current Balance', value: 'balance' },
                    { name: 'Net Worth', value: 'net' },
                ))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)')),

    async execute(interaction) {
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
        const type = interaction.options.getString('leaderboard') ?? 'net';
        let userList = await UserProfile.find();

        // Defer the reply as this can take a while
        await interaction.deferReply({ ephemeral: ephemeral });

        const embed = new EmbedBuilder()
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

        // Depending on the type of leaderboard selected, sort the list accordingly
        if (type == 'net') {
            // Sort all users by their net worth. Descending order.
            userList.sort((a, b) => {
                return b.netWorth - a.netWorth;
            });
            // Cut the list down to only the first 10 entries
            userList = userList.slice(0, 10);
            // Fill the embed's description with the users' net worths
            embed.setTitle(`Global ${currencyName} Net Worth Leaderboard:`)
                .setDescription(userList.map((profile, index) => {
                    return `**${index + 1}.** ${profile.displayName}: ${profile.netWorth}`;
                }).join('\n'));
        }
        else {
            // Sort all users by their balances. Descending order.
            userList.sort((a, b) => {
                return b.balance - a.balance;
            });
            // Cut the user list down to the first 10 entries
            userList = userList.slice(0, 10);
            // Fill the embed's description with the users' balances
            embed.setTitle(`Global ${currencyName} Balance Leaderboard:`)
                .setDescription(userList.map((profile, index) => {
                    return `**${index + 1}.** ${profile.displayName}: ${profile.balance}`;
                }).join('\n'));
        }

        await interaction.followUp({ embeds: [embed], ephemeral: ephemeral });
    },
};