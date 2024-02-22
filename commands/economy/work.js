/*
    This is the command that users will perform in order to work to earn their money.
    Simply generate a random number between 0 and 100.
        From there, if the number is equal
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');
const UserProfile = require('../../schemas/UserProfile.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription(`Earn ${currencyName}s by working`),

    async execute(interaction) {
        // First, try and find the user running the command in the database.
        try {
            let userProfile = await UserProfile.findOne({
                userID: interaction.member.id,
            });
            // If the user's profile exists, check to see if they can run this command (once daily)
            if (userProfile) {
              const lastDate = userProfile.lastCurrencyEarned?.toDateString();
              const currentDate = new Date().toDateString();

              if (lastDate === currentDate) {
                interaction.reply({ content: `You cannot collect any more ${currencyName} today. Come back tomorrow`, ephemeral: true });
                return;
              }
            }
            // If the user's profile does NOT exist, make one
            else {
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

            console.log(rngVal);

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
            userProfile.lastCurrencyEarned = new Date();
            // Sync the data to the database
            // await userProfile.save();
            await interaction.reply({ embeds: [earningEmbed] });
        }
        catch (error) {
            console.log(`Error handling daily command: ${error}`);
        }

    },
};