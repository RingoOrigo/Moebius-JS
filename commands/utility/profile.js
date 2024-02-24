/*
    Create a simple, clean looking profile card for the specified user.
        If no user is specified, default to the message author
*/

const { SlashCommandBuilder, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const UserProfile = require('../../utils/schemas/UserProfile.js');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { request } = require('undici');
const { currencyName } = require('../../config.json');

// Function to apply text to an image in order to make sure that every username fits onto the profile card.
const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 48;

	do {
		context.font = `${fontSize -= 10}px Veranda`;
	} while (context.measureText(text).width > canvas.width - 225);

	return context.font;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View a user\'s profile card')
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('View a user\'s profile')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user\'s profile card to display. Defaults to yourself'))
                .addBooleanOption(option =>
                    option.setName('ephemeral')
                    .setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)')))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit your profile card')),

    async execute(interaction) {
        const target = interaction.options.getUser('target') ?? interaction.user;
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
        const subcommand = interaction.options.getSubcommand();
        let profile;

        try {
            // Find a profile for the user in the database
            profile = await UserProfile.findOne({
                userID: target.id,
            });
            // If it doesn't exist, create one!
            if (!profile) {
                profile = new UserProfile({
                    userID: target.id,
                });
            }

            // Display the specified user's profile card
            if (subcommand == 'view') {
                await interaction.deferReply({ ephemeral: ephemeral });

                // Create a canvas with the designated width and height (720 x 405, a 16:9 aspect ratio matching the images in utils/images)
                // Define the context, which will be used to modify the image
                const canvas = createCanvas(450, 253);
                const context = canvas.getContext('2d');

                // Open an image to be used as the background of the attachment
                const backgroundFile = await readFile(`./utils/images/${profile.currentBG}.png`);
                const background = new Image();
                background.src = backgroundFile;
                // Get the user's avatar to be places onto the profile card
                const { body } = await request(target.displayAvatarURL({ extension: 'png' }));
                const avatar = new Image();
                avatar.src = Buffer.from(await body.arrayBuffer());
                // Select the font size and style, then the text's color (fillstyle)
                const textStartPos = (canvas.width / 2) - 20;
                context.font = applyText(canvas, target.displayName);
                context.fillStyle = '#ffffff';

                // Draw the background image to the context object.
                // 0, 0 is the origin of the image to be drawn, while canvas.width and canvas.height is the image's dimensions
                context.drawImage(background, 0, 0, canvas.width, canvas.height);
                context.drawImage(avatar, 25, 50, 150, 150);
                // Draw a border around the user's profile picture
                context.strokeStyle = '#ffffff';
                context.lineWidth = 2;
                context.strokeRect(25, 50, 150, 150);
                // Draw the user's display name to the image (Directly on the halfway point and 70px down)
                context.fillText(target.displayName, textStartPos, 100);

                // Add text corresponding to their stats to their profile card.
                context.font = applyText(canvas, `Current Balance: ${profile.balance} ${currencyName}s`);
                context.fillText(`Current Balance: ${profile.balance} ${currencyName}s`, textStartPos, 140);
                context.fillText(`Total Hauls: ${profile.totalHauls}`, textStartPos, 165);

                // Build the image as an attachment and send it
                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-card.png' });
                await interaction.followUp({ files: [attachment], ephemeral: ephemeral });
            }
            else if (subcommand == 'edit') {
                // Prompt the user to select a background.
                // If they do not own that background, follow up.

                // Make a selection menu for all profile backgrounds
                const menu = new StringSelectMenuBuilder()
                    .setCustomId('userBG')
                    .setPlaceholder('Select a background')
                    .addOptions(
                        new StringSelectMenuOptionBuilder().setLabel('Stormy Skies').setValue('bg1').setDescription('The default background of stormy skies'),
                        new StringSelectMenuOptionBuilder().setLabel('Cloudy Sea').setValue('bg2').setDescription('A serene view of the vast Alrestian Cloud Sea'),
                        new StringSelectMenuOptionBuilder().setLabel('Wooden Pier').setValue('bg3').setDescription('Torigoth\'s wooden pier above the Cloud Sea'),
                        new StringSelectMenuOptionBuilder().setLabel('Magenta Forest').setValue('bg4').setDescription('Uraya\'s signature pink foliage'),
                        new StringSelectMenuOptionBuilder().setLabel('Metal Castle').setValue('bg5').setDescription('Mor Ardain\'s towering Hardhaigh Palace'),
                        new StringSelectMenuOptionBuilder().setLabel('Sunset Field').setValue('bg6').setDescription('A calming Leftherian field'),
                        new StringSelectMenuOptionBuilder().setLabel('Tundra').setValue('bg7').setDescription('Tantal\'s cold, empty wasteland'),
                        new StringSelectMenuOptionBuilder().setLabel('Golden Shrine').setValue('bg8').setDescription('The Vault of Heroes looming in the Spirit Crucible'),
                        new StringSelectMenuOptionBuilder().setLabel('City Street').setValue('bg9').setDescription('The lost city of Morytha'),
                        new StringSelectMenuOptionBuilder().setLabel('World Tree').setValue('bg10').setDescription('The massive, dense World Tree'),
                        new StringSelectMenuOptionBuilder().setLabel('Rhadamanthus').setValue('bg11').setDescription('"Let\'s begin the experiment!"'),
                    );

                const row = new ActionRowBuilder().addComponents(menu);
                const response = await interaction.reply({
                    content: 'Choose a background to apply (You cannot use a background you do not own):',
                    components: [row],
                    ephemeral: ephemeral,
                });

                // Wait for the user to respond
                try {
                    const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300000 });

                    collector.on('collect', async i => {
                        const selection = i.values[0];

                        // Check if the user actually owns the selection
                        if (profile.backgrounds.includes(selection)) {
                            // Set the background if the user owns it
                            profile.currentBG = selection;
                            await profile.save();
                            await interaction.editReply({ content: 'Successfully changed your background!',
                                                        components: [],
                                                        ephemeral: ephemeral });
                        }
                        else {
                            await interaction.followUp({ content: 'You do not own this background!', ephemeral: ephemeral });
                        }
                    });
                }
                catch (error) {
                    await interaction.editReply({ content: 'This menu has timed out',
                                                components: [],
                                                ephemeral:ephemeral });
                }
            }
        }
        catch (error) { console.log(error); }
    },
};