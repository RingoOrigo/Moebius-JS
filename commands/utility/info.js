/*
	Respond to the user with a clean embed containing their Discord profile information.
		- This includes, but is not limited to the following: username, global display name, avatar, account creation date, and friend invite link.
*/
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { helpServer, botCreator, botRepo, botName } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Provides information about the specified content.')

		.addSubcommand(subcommand =>
			subcommand.setName('user')
				.setDescription('Display information on the specified user')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('The user to display the information of, defaults to yourself'))
				.addBooleanOption(option =>
					option.setName('ephemeral')
						.setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)')))

		.addSubcommand(subcommand =>
			subcommand.setName('server')
				.setDescription('Display information on this server.')
				.addBooleanOption(option =>
					option.setName('ephemeral')
						.setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)')))

		.addSubcommand(subcommand =>
			subcommand.setName('bot')
				.setDescription(`Display information on ${botName}.`)
				.addBooleanOption(option =>
					option.setName('ephemeral')
						.setDescription('Whether the response is ephemeral, defaults to true. (Only you can see ephemeral messages)'))),

	async execute(interaction) {
		// These are variable that will be useful in every switch case.
		// Target is not assigned as it differs between cases.
		const subcommand = interaction.options.getSubcommand();
		// Embed can have these pre-defined values, as they do not depend on the subcommand (and are overwritten when necessary)
		const embed = new EmbedBuilder()
			.setColor('f0b3be')
			.setAuthor({
				name : `${botName}`,
				iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
			})
			.setTimestamp()
			.setFooter({
				text: `Brought to you by ${botName}`,
				iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
			});

		let target;
		const invisible = interaction.options.getBoolean('ephemeral') ?? true;

		switch (subcommand) {
			case 'user':
				target = interaction.options.getUser('target') ?? interaction.user;
				// Construct a clean-looking embed to send to the user who ran this command.
				// 'interaction.user' is the user who ran the command
				embed
					.setTitle(`Information on user ${target.displayName}:`)
					.setThumbnail(target.displayAvatarURL())
					.addFields(
						{ name: 'Global username: ', value: `${target.username}` },
						{ name: 'Global display name: ', value: `${target.globalName}` },
						{ name: 'Account created at:', value: `${target.createdAt}` },
						{ name: 'Friend invite link: ', value: `https://discord.com/users/${target.id}` },
					);
				// Break out of this case.
				break;

			case 'server':
				target = interaction.guild;
				embed
					.setTitle(`Information on ${target.name}:`)
					.addFields(
						{ name: 'Total member count: ', value: `${target.memberCount}` },
						{ name: 'Server creation date: ', value: `${target.createdAt}` },
					);

				break;

			case 'bot':
				// Create an embed with info specific to Moebius. These values can be hard-coded in, or grabbed from a config file.
				// Currently, the values are taken from the config file.
				embed
					.setTitle(`Information on ${botName}:`)
					.setDescription(`${botName} is a small-scale, open-source Discord bot brought to you by ${botCreator}`)
					.addFields(
						{ name: 'Source Code Repository:', value:`View the ${botName} code repository on GitHub at ${botRepo} !` },
						{ name: `${botName} Community Server:`, value:`Join the ${botName} community server to make feature suggestions, submit bug reports, and receive help with any issues you may experience at ${helpServer} !` },
					)
					.setFooter({
						// Do not remove this line in any forks of this bot, please!
						text:'Moebius is a project originally by Ringo Origo',
						iconURL:'https://cdn.discordapp.com/avatars/547101541442650133/981ec4f0e606161018352e6c8992a790',
					});
				break;
			}
		// Regardless, the embed will be sent, thus it is not placed within any switch case.
		await interaction.reply({ embeds: [embed], ephemeral: invisible });
	},
};
