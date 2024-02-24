/*
    This is a simple shop system via a select menu.
        Currently, only shopping for backgrounds is supported
*/

const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const UserProfile = require('../../utils/schemas/UserProfile.js');
const { currencyName } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription(`Use ${currencyName}s to purchase various items`)
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The category of items to purchase')
                .addChoices(
                    { name: 'backgrounds', value: 'background' },
                )),

    async execute(interaction) {
        // Find the user's profile, and if it doesn't exist, create it.
        let profile;
        const target = interaction.user;
        const category = interaction.options.getString('category');

        try {
            // Attempt to find the profile
            profile = await UserProfile.findOne({
                userID: target.id,
            });
            // If it doesn't exist, create one!
            if (!profile) {
                profile = new UserProfile({
                    userID: target.id,
                });
            }
        }
        catch (e) {
            console.log(e);
        }

        let menu;
        switch (category) {
            case 'background':
                menu = new StringSelectMenuBuilder()
                    .setCustomId('bgShop')
                    .setPlaceholder('Select a background to purchase')
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setLabel('Cloudy Sea').setValue('bg2').setDescription(`1,000 ${currencyName}s: A serene view of the vast Alrestian Cloud Sea`),
                        new StringSelectMenuOptionBuilder().setLabel('Wooden Pier').setValue('bg3').setDescription(`1,000 ${currencyName}s: Torigoth's wooden pier above the Cloud Sea`),
                        new StringSelectMenuOptionBuilder().setLabel('Magenta Forest').setValue('bg4').setDescription(`2,500 ${currencyName}s: Uraya's signature pink foliage`),
                        new StringSelectMenuOptionBuilder().setLabel('Metal Castle').setValue('bg5').setDescription(`5,000 ${currencyName}s: Mor Ardain's towering Hardhaigh Palace`),
                        new StringSelectMenuOptionBuilder().setLabel('Sunset Field').setValue('bg6').setDescription(`2,500 ${currencyName}s: A calming Leftherian field`),
                        new StringSelectMenuOptionBuilder().setLabel('Tundra').setValue('bg7').setDescription(`1,000 ${currencyName}s: Tantal's cold, empty wasteland`),
                        new StringSelectMenuOptionBuilder().setLabel('Golden Shrine').setValue('bg8').setDescription(`10,000 ${currencyName}s: The Vault of Heroes looming in the Spirit Crucible`),
                        new StringSelectMenuOptionBuilder().setLabel('City Street').setValue('bg9').setDescription(`10,000 ${currencyName}s: The lost city of Morytha`),
                        new StringSelectMenuOptionBuilder().setLabel('World Tree').setValue('bg10').setDescription(`10,000 ${currencyName}s: The massive, dense World Tree`),
                        new StringSelectMenuOptionBuilder().setLabel('Rhadamanthus').setValue('bg11').setDescription(`25,000 ${currencyName}s: "Let's begin the experiment!"`),
                    );
        }

        const row = new ActionRowBuilder().addComponents(menu);
        const response = await interaction.reply({
            content: `Choose a ${category} to purchase (You cannot purchase anything you cannot afford)`,
            components: [row],
            ephemeral: true,
        });

        // Wait for the user to respond
        try {
            const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300000 });
            let price;

            collector.on('collect', async i => {
                const selection = i.values[0];

                if (selection == 'bg4' || selection == 'bg6') price = 2500;
                else if (selection == 'bg5') price = 5000;
                else if (selection == 'bg8' || selection == 'bg9' || selection == 'bg10') price = 10000;
                else if (selection == 'bg11') price = 25000;
                else price = 1000;

                if (profile.backgrounds.includes(selection)) {
                    await interaction.followUp({
                        content: 'You already own this item!',
                        ephemeral: true,
                    });
                }
                else if (price > profile.balance) {
                    await interaction.followUp({
                        content: 'You cannot afford that item!',
                        ephemeral: true,
                    });
                }
                else {
                    profile.balance -= price;
                    profile.backgrounds.push(selection);
                    await profile.save();

                    await interaction.editReply({
                        content: `Thank you for your purchase!\nYour new balance is ${profile.balance} ${currencyName}s`,
                        components: [],
                        ephemeral: true,
                    });
                }
            });
        }
        catch (error) {
            await interaction.editReply({
                content: 'This menu has expired',
                components: [],
                ephemeral: true,
            });
        }
    },
};