/*
    Display the the in-depth breakdown of the specified user's haul statistics
        If the user doesn't exist in the database, then create their profile and set everything to its default value.
            In this event, do not display any stats, as the user does not have any.
        If the user DOES exist, display their whole statistical breakdown
            This includes their balance, total number of hauls, and the percentage breakdown of each haul found.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');
const UserProfile = require('../../schemas/UserProfile.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription(`View the user's specified balance of${currencyName}s.`)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user\'s balance to display, defaults to yourself'))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)')),
    async execute(interaction) {
        const target = interaction.options.getUser('target') ?? interaction.user;
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

        // First, get the user's profile. If it doesn't exist, make it.
        try {
            let userProfile = await UserProfile.findOne({
                userID: target.id,
            });

            // If the account isn't found, create one!
            if (!userProfile) {
                userProfile = new UserProfile({
                    userID: target.id,
                });
                return await interaction.reply({ content: 'You\'ve never found any hauls, so you have no stats! Use `/haul` to put yourself on the board.', ephemeral: ephemeral });
            }

            const balance = userProfile.balance;
            const hauls = userProfile.totalHauls;
            const embed = new EmbedBuilder()
                .setColor('f0b3be')
                .setAuthor({
                    name : `${botName}`,
                    iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
                })
                .setTimestamp()
                .setFooter({
                    text: `Brought to you by ${botName}. (More stats coming soon)`,
                    iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
                })
                .setTitle(`${target.displayName}'s Haul Stats`)
                .addFields(
                    { name: '__Current Balance__:', value: `${balance} ${currencyName}s` },
                    // I hate having this extremely long line, but the formatting is awful if this is split into multiple lines, so unfortunately I am keeping it.
                    { name: '__Numeric Haul Stats__:', value: `Total Hauls Found: **${hauls}**\nLegendary Hauls Found: **${userProfile.legendaryHauls}**\nEpic Hauls Found: **${userProfile.epicHauls}**\nUncommon Hauls Found: **${userProfile.uncommonHauls}**\nCommon Hauls Found: **${userProfile.commonHauls}**\nHaul Failures: **${userProfile.haulFailures}**`, inline: true },
                    { name: '__Haul-Type Percentages__:', value: `Legendary Hauls: **${(userProfile.legendaryHauls / hauls * 100).toFixed(1)}%**\nEpic Hauls: **${(userProfile.epicHauls / hauls * 100).toFixed(1)}%**\nUncommon Hauls: **${(userProfile.uncommonHauls / hauls * 100).toFixed(1)}%**\nCommon Hauls: **${(userProfile.commonHauls / hauls * 100).toFixed(1)}%**\nHaul Failures: **${(userProfile.haulFailures / hauls * 100).toFixed(1)}%**\n`, inline: true },
                );

            await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
        }

        catch (error) {
            console.log(error);
        }
    },
};