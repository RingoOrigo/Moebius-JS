/*
    This is the command that users will perform in order to work to earn their money.
    Simply generate a random number between 0 and 100.
        From there, if the number is equal
    Also allow a user to haul for another user, sacrificing their cooldown
        in order to give the other user a second haul.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName, currencyName } = require('../../config.json');
const UserProfile = require('../../utils/schemas/UserProfile.js');
const onCooldown = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('haul')
        .setDescription(`Find a random-sized haul of ${currencyName}s.`)
        .addUserOption(option =>
            option.setName('target')
                    .setDescription('The user that you will find a haul for, defaults to yourself.'))
        .addBooleanOption(option =>
            option.setName('reminder')
                .setDescription('Choose whether or not to receive a DM reminder when your cooldown has expired.')),

    async execute(interaction) {
        const target = interaction.options.getUser('target') ?? interaction.user;
        const user = interaction.user;
        const reminder = interaction.options.getBoolean('reminder') ?? false;

        // First, fail out of the command if the user is on cooldown.
        if (onCooldown.has(user.id)) {
            // Store the current remaining time of the user's cooldown
            const currentTime = onCooldown.get(user.id);

            // Use the current remaining cooldown time to calculate the remaining minutes and seconds
            // Start minutes at 89, as the cooldown length is 90 minutes.
            const mins = 89 - Math.floor(((Date.now() - currentTime) / 1000) / 60);
            const secs = 60 - Math.floor(((Date.now() - currentTime) / 1000) % 60);

            await interaction.reply({ content:`You're on cooldown! You can find a new haul in **${mins > 0 ? mins + ' minutes and ' : ''}${secs} seconds.**`, ephemeral: true });
            return;
        }

        // First, try and find the user running the command in the database.
        try {
            let userProfile = await UserProfile.findOne({
                userID: target.id,
                displayName: target.globalName ?? target.displayName,
            });

            // If the user's profile doesn't exist, make one for them.
            if (!userProfile) {
                userProfile = new UserProfile({
                    userID: target.id,
                    displayName: target.globalName ?? target.displayName,
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
                .setTitle(`<:gold:1210674875023491072> ${target.displayName}'s Haul:`)
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
                // Increment the number of times the user has gotten a haul of this rarity.
                userProfile.legendaryHauls++;
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: '**LEGENDARY**' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else if (rngVal <= 10) {
                // 9% Epic Event
                // Range: 250 - 500
                earnings = Math.floor(Math.random() * 251 + 250);
                userProfile.epicHauls++;
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: '**Epic**' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else if (rngVal <= 20) {
                // 10% chance to earn nothing
                earnings = 0;
                userProfile.haulFailures++;
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: 'Haul Failure' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else if (rngVal <= 40) {
                // 20% Uncommon Event
                // Range: 100 - 200
                userProfile.uncommonHauls++;
                earnings = Math.floor(Math.random() * 101 + 100);
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: '*Uncommon*' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }
            else {
                // 60% chance common event
                // Range: 1 - 65
                earnings = Math.floor(Math.random() * 65 + 1);
                userProfile.commonHauls++;
                earningEmbed.addFields(
                    { name: 'Haul Rarity:', value: 'Common' },
                    { name: `${currencyName}s Earned:`, value: `${earnings}` },
                );
            }

            userProfile.balance += earnings;
            userProfile.netWorth += earnings;
            userProfile.totalHauls++;
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
        onCooldown.set(user.id, interaction.createdTimestamp);
        setTimeout(() => {
                // Remove the user from the set after 90 minutes
                onCooldown.delete(user.id);

                // Check if the user is on the Moebius Blacklist
                // And DM the user when their haul is ready (if they aren't on the blacklist)
                if (reminder) {
                    try {
                        user.send('Your haul cooldown has expired and you are now free to use the command again!');
                    }
                    catch (e) {
                        console.log(`${interaction.user.globalName} does not allow messages.`);
                    }
                }
            }, 5400000,
        );

    },
};