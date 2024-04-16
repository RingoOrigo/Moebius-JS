/*
        Allow a user to pay another user, removing the designated amount from their balance and adding it to the other user's
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { currencyName, botName, embedImageURL } = require('../../config.json');
const UserProfile = require('../../utils/schemas/UserProfile.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription(`Gift some ${currencyName} to the designated user. This does not alter their net worth.`)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to pay')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                    .setDescription(`The amount of ${currencyName} to pay the designated user`)
                    .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const payment = interaction.options.getInteger('quantity');

        if (payment <= 0) {
            return await interaction.reply({ content: 'Try again with a valid amount.', ephemeral: true });
        }

        let loaner;
        let recipient;

        if (target.id == interaction.user.id) {
            return await interaction.reply({ content: 'You cannot pay yourself.', ephemeral: true });
        }

        try {
            // Find the loaner and recipients entries in the database.
            loaner = await UserProfile.findOne({
                userID: interaction.user.id,
            });
            recipient = await UserProfile.findOne({
                userID: target.id,
            });
            // Create entires for the recipient and loaner if they do not already exist.
            if (!loaner) {
                loaner = new UserProfile({
                    userID: interaction.user.id,
                });
            }
            if (!recipient) {
                recipient = new UserProfile({
                    userID: target.id,
                });
            }

            loaner.displayName = interaction.user.globalName;
            recipient.displayName = target.globalName ?? target.displayName;

            // If the loaner does not have a high enough balance, do not allow them to pay
            if (loaner.balance < payment) {
                return await interaction.reply({ content: `You cannot pay ${target.displayName} ${payment} ${currencyName}s, as your current balance is ${loaner.balance}!`, ephemeral: true });
            }

            // remove the payment amount from the loader's acconut, and add it to the recipient's account
            recipient.balance += payment;
            loaner.balance -= payment;

            const embed = new EmbedBuilder()
                .setColor('f0b3be')
                .setAuthor({
                    name: `${botName}`,
                    iconURL: embedImageURL,
                })
                .setTitle('Successful Payment!')
                .addFields(
                    { name: `${target.displayName}'s Balance:`, value: `${recipient.balance} ${currencyName}s` },
                    { name: `${interaction.user.displayName}'s Balance:`, value: `${loaner.balance} ${currencyName}s` },
                )
                .setTimestamp()
                .setFooter({
                    text: `Brought to you by ${botName}`,
                    iconURL: embedImageURL,
                });

            // Sync the data with the database
            await recipient.save();
            await loaner.save();

            await interaction.reply({ embeds: [embed] });
        }
        catch (e) {
            console.log(e);
        }
    },
};