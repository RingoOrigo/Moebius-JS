/*
    This is the command that users will perform in order to work to earn their money.
    Simply generate a random number between 0 and 100.
        From there, if the number is equal
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');
const UserProfile = require('../../schemas/UserProfile.js');
const onCooldown = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('haul')
        .setDescription(`Find a random-sized haul of ${currencyName}s.`),

    async execute(interaction) {
        // First, fail out of the command if the user is on cooldown.
        if (onCooldown.has(interaction.member.id)) {
            // Set the first number here to one less than the length of your cooldown in minutes.
            const mins = 89 - Math.floor(((Date.now() - onCooldown.get(interaction.member.id)) / 1000) / 60);
            const secs = 60 - Math.floor(((Date.now() - onCooldown.get(interaction.member.id)) / 1000) % 60);

            await interaction.reply({ content:`You're on cooldown! You can only find a new haul every 90 minutes.\nYou will be able to find a new haul in ${mins > 0 ? mins + ' minutes and ' : ''}${secs} seconds`, ephemeral: true });
            return;
        }

        // First, try and find the user running the command in the database.
        try {
            let userProfile = await UserProfile.findOne({
                userID: interaction.member.id,
            });

            // If the user's profile doesn't exist, make one for them.
            if (!userProfile) {
                userProfile = new UserProfile({
                    userID: interaction.member.id,
                });
            }

            // Generate a random number between 1 and 100. This is for percent chances
            const rngVal = Math.floor(Math.random() * 100 + 1);
            const earningEmbed = new EmbedBuilder()
                .setColor('f0b3be')
                .setAuthor({
                    name: `${botName}`,
                    iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
                })
                .setTitle(`${interaction.member.displayName}'s Haul:`)
                .setTimestamp()
                .setFooter({
                    text: `Brought to you by ${botName}`,
                    iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
                });
            let earnings = 0;

            if (rngVal == 1) {
                // 1% legendary event
                // Formula for number within range [inclusive]: Math.random() * (max + 1 - min) + min
                // Range: 600 - 1000
                earnings = Math.floor(Math.random() * 401 + 600);
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: '**LEGENDARY** (1%)' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else if (rngVal <= 10) {
                // 9% Epic Event
                // Range: 250 - 500
                earnings = Math.floor(Math.random() * 251 + 250);
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: '**Epic** (10%)' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else if (rngVal <= 20) {
                // 10% chance to earn nothing
                earnings = 0;
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: 'Haul Failure (10%)' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else if (rngVal <= 40) {
                // 20% Uncommon Event
                // Range: 100 - 200
                earnings = Math.floor(Math.random() * 101 + 100);
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: '*Uncommon* (20%)' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else {
                // 60% chance common event
                // Range: 1 - 65
                earnings = Math.floor(Math.random() * 65 + 1);
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: 'Common (60%)' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }

            userProfile.balance += earnings;
            // Sync the data to the database
            await userProfile.save();
            await interaction.reply({ embeds: [earningEmbed] });
        }
        catch (error) {
            console.log(error);
        }

        // Add the user to the list of users on cooldown
        // This should be the last thing to happen, as in events where the API lags,
        //     users can be added to the cooldown list before the command ever properly executes and their hauls will be skipped.
        onCooldown.set(interaction.member.id, interaction.createdTimestamp);
        setTimeout(() => {
                // Remove the user from the set after 90 minutes
                onCooldown.delete(interaction.member.id);
            }, 5400000,
        );

    },
};