/*
	Respond to the user with a clean embed containing their Discord profile information.
		- This includes, but is not limited to the following: username, global display name, avatar, account creation date, and friend invite link.
*/
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption(option =>
			option.setName('target').setDescription('The user to display the information of').setRequired(true))
		.addBooleanOption(option =>
			option.setName('ephemeral').setDescription('Decide whether the command\'s respinse is ephemeral or not. (Only you can see ephemeral messages)').setRequired(true)),

	async execute(interaction) {
		// Construct a clean-looking embed to send to the user who ran this command.
		// 'interaction.user' is the user who ran the command.
		const profileEmbed = new EmbedBuilder();
		const target = interaction.options.getUser('target');
		const invisible = interaction.options.getBoolean('ephemeral');

		profileEmbed
			.setColor('f0b3be')
			.setAuthor({
				name : 'Moebius',
				iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
			})
			.setTitle(`Information on user ${target.displayName}:`)
			.setThumbnail(target.displayAvatarURL())
			.addFields(
				{ name: 'Global username: ', value: `${target.username}` },
				{ name: 'Global display name: ', value: `${target.globalName}` },
				{ name: 'Account created at:', value: `${target.createdAt}` },
				{ name: 'Friend invite link: ', value: `https://discord.com/users/${target.id}` },
			)
			.setTimestamp()
			.setFooter({
				text: 'Brought to you by Moebius',
				iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
			});

		await interaction.reply({ embeds: [profileEmbed], ephemeral: invisible });
	},
};
