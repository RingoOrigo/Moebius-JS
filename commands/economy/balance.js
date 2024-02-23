/*
    Display the the balance of the specified user
        If the user doesn't exist in the database, then create their profile and set their balance to zero.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');
const UserProfile = require('../../schemas/UserProfile.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
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

            const balance = userProfile.balance;
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
                    { name: 'Current Balance: ', value: `${balance}` },
                );

            await interaction.reply({ embeds: [embed], ephemeral: ephemeral });
        }

        catch (error) {
            console.log(error);
        }
    },
};