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
                .setRequired(true)
                .addChoices(
                    { name: 'backgrounds', value: 'background' },
                    { name: 'fonts', value: 'font' },
                    { name: 'text colors', value: 'color' },
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
                displayName: target.globalName,
            });
            // If it doesn't exist, create one!
            if (!profile) {
                profile = new UserProfile({
                    userID: target.id,
                    displayName: target.globalName,
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
                        new StringSelectMenuOptionBuilder().setLabel('Cloudy Sea').setValue('bg2 500').setDescription(`500 ${currencyName}s: A serene view of the vast Alrestian Cloud Sea`),
                        new StringSelectMenuOptionBuilder().setLabel('Wooden Pier').setValue('bg3 500').setDescription(`500 ${currencyName}s: Torigoth's wooden pier above the Cloud Sea`),
                        new StringSelectMenuOptionBuilder().setLabel('Magenta Forest').setValue('bg4 1500').setDescription(`1,500 ${currencyName}s: Uraya's signature pink foliage`),
                        new StringSelectMenuOptionBuilder().setLabel('Monado (Day)').setValue('bg12 1500').setDescription(`1,500 ${currencyName}s: The Monado shining in the daylight sun`),
                        new StringSelectMenuOptionBuilder().setLabel('Monado (Sunset)').setValue('bg13 2500').setDescription(`2,500 ${currencyName}s: The Monado shining in the evening sunset`),
                        new StringSelectMenuOptionBuilder().setLabel('Metal Castle').setValue('bg5 3500').setDescription(`3,500 ${currencyName}s: Mor Ardain's towering Hardhaigh Palace`),
                        new StringSelectMenuOptionBuilder().setLabel('Sunset Field').setValue('bg6 2500').setDescription(`2,500 ${currencyName}s: A calming Leftherian field`),
                        new StringSelectMenuOptionBuilder().setLabel('Tundra').setValue('bg7 500').setDescription(`500 ${currencyName}s: Tantal's cold, empty wasteland`),
                        new StringSelectMenuOptionBuilder().setLabel('Golden Shrine').setValue('bg8 5000').setDescription(`5,000 ${currencyName}s: The Vault of Heroes looming in the Spirit Crucible`),
                        new StringSelectMenuOptionBuilder().setLabel('City Street').setValue('bg9 5000').setDescription(`5,000 ${currencyName}s: The lost city of Morytha`),
                        new StringSelectMenuOptionBuilder().setLabel('World Tree').setValue('bg10 5000').setDescription(`5,000 ${currencyName}s: The massive, dense World Tree`),
                        new StringSelectMenuOptionBuilder().setLabel('Monado (Night)').setValue('bg14 10000').setDescription(`10,000 ${currencyName}s: The Monado brilliantly glowing at night`),
                        new StringSelectMenuOptionBuilder().setLabel('Rhadamanthus').setValue('bg11 10000').setDescription(`10,000 ${currencyName}s: "Let's begin the experiment!"`),
                    );
                break;

            case 'font':
                menu = new StringSelectMenuBuilder()
                        .setCustomId('fontShop')
                        .setPlaceholder('Select a font to purchase')
                        .addOptions(
                            new StringSelectMenuOptionBuilder().setLabel('Meme').setValue('Impact 1000').setDescription(`1,000 ${currencyName}s: The default meme font from the early internet.`),
                            new StringSelectMenuOptionBuilder().setLabel('Programmer').setValue('Courier New 1000').setDescription(`1,000 ${currencyName}s: The default font used by most programming IDEs`),
                        );
                break;

            case 'color':
                menu = new StringSelectMenuBuilder()
                        .setCustomId('colorShop')
                        .setPlaceholder('Select a text color to purchase')
                        .addOptions(
                            new StringSelectMenuOptionBuilder().setLabel('Light Blue').setValue('#00C9FF 100').setDescription(`100 ${currencyName}s: A soft, light blue.`),
                            new StringSelectMenuOptionBuilder().setLabel('Dark Blue').setValue('#1D16FF 100').setDescription(`100 ${currencyName}s: A soft, darker blue alternative.`),
                            new StringSelectMenuOptionBuilder().setLabel('Light Red').setValue('#B80000 100').setDescription(`100 ${currencyName}s: A soft red, almost a dark pink.`),
                            new StringSelectMenuOptionBuilder().setLabel('Violet').setValue('#5300EB 100').setDescription(`100 ${currencyName}s: Your standard purple.`),
                            new StringSelectMenuOptionBuilder().setLabel('Golden Country').setValue('#E2C452 1000').setDescription(`1000 ${currencyName}s: The last remnant of Torna.`),
                            new StringSelectMenuOptionBuilder().setLabel('Xenoblade Red').setValue('#FE0000 1000').setDescription(`1000 ${currencyName}s: The red from Xenoblade's title screens.`),
                            new StringSelectMenuOptionBuilder().setLabel('Moebius Pink').setValue('#f0b3be 1000').setDescription(`1000 ${currencyName}s: The same colour Moebius uses in embeds.`),
                        );
                break;
        }

        const row = new ActionRowBuilder().addComponents(menu);
        const response = await interaction.reply({
            content: `Choose a ${category} to purchase (You cannot purchase anything you cannot afford)`,
            components: [row],
            ephemeral: true,
        });

        // Wait for the user to respond
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300000 });

        collector.on('collect', async i => {
            const selection = i.values[0];
            const choice = selection.slice(0, selection.lastIndexOf(' '));
            const price = selection.slice(selection.lastIndexOf(' ') + 1);

            if (profile.inventory.includes(choice)) {
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
                profile.inventory.push(choice);
                await profile.save();

                await interaction.editReply({
                    content: `Thank you for your purchase!\nYour new balance is ${profile.balance} ${currencyName}s`,
                    components: [],
                    ephemeral: true,
                });
            }
        });
        // Disable the message when it times out
        // eslint-disable-next-line no-unused-vars
        collector.on('end', async i => {
            await interaction.editReply({
                content: 'This menu has expired',
                components: [],
                ephemeral: true,
            });
        });
    },
};