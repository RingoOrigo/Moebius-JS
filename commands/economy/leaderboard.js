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
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)')),

    async execute(interaction) {
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
        let userList = await UserProfile.find();

        // Defer the reply as this can take a while
        await interaction.deferReply({ ephemeral: ephemeral });

        // Sort all users by their balances. Descending order.
        userList.sort((a, b) => {
            return b.balance - a.balance;
        });
        // Slice the list to only the first 10 entries
        userList = userList.slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor('f0b3be')
            .setAuthor({
                name: `${botName}`,
                iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
            })
            .setTitle(`Global ${currencyName} Leaderboard:`)
            .setDescription(userList.map((profile, index) => {
                return `**${index + 1}.** <@${profile.userID}>: ${profile.balance}`;
            }).join('\n'))
            .setTimestamp()
            .setFooter({
                text: `Brought to you by ${botName}`,
                iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
            });

        await interaction.followUp({ embeds: [embed], ephemeral: ephemeral });
    },
};