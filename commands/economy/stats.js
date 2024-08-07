/*
    Display the the in-depth breakdown of the specified user's haul statistics
        If the user doesn't exist in the database, then create their profile and set everything to its default value.
            In this event, do not display any stats, as the user does not have any.
        If the user DOES exist, display their whole statistical breakdown
            This includes their balance, total number of hauls, and the percentage breakdown of each haul found.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName, embedImageURL } = require('../../config.json');
const UserProfile = require('../../utils/schemas/UserProfile.js');

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
            }

            userProfile.displayName = target.globalName ?? target.displayName;

            const balance = userProfile.balance;
            const netWorth = userProfile.netWorth;
            const hauls = userProfile.totalHauls;

            if (hauls == 0) {
                // Exit the command to prevent displaying an embed mostly composed of "NaN%",
                //     which is produced by a divide by zero error when hauls is equal to zero
                return await interaction.reply({ content: 'This user has no stats, as they have never used /haul.', ephemeral: ephemeral });
            }

            const embed = new EmbedBuilder()
                .setColor('f0b3be')
                .setAuthor({
                    name : `${botName}`,
                    iconURL: embedImageURL,
                })
                .setTimestamp()
                .setFooter({
                    text: `Brought to you by ${botName}. (More stats coming soon)`,
                    iconURL: embedImageURL,
                })
                .setTitle(`${target.displayName}'s Haul Stats`)
                .addFields(
                    { name: '__Current Balance__:', value: `${balance} ${currencyName}s` },
                    { name: '__Net Worth__:', value: `${netWorth} ${currencyName}s` },
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