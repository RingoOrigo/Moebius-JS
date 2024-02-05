/*
    Allow users to play a variety of different roulettes!
        - Standard: 5 in 6 chance to lose the roulette
        - Casual: 1 in 12 chance to lose the roulette
        - Maddening: 11 in 12 chance to lose the roulette
        - Lunatic: 999 in 1000 chance to lose the roulette
        - Infernal: 99,999 in 100,000 chance ot lose the roulette
        - Stygian: 1,999,999,999 in 2,000,000,00 chance to lose the roulette
    By default, the standard difficulty will be chosen.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botName } = require('../../config.json');

module.exports = {
    data:new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Choose to play a roulette or view information regarding the various kinds of them!')
        .addSubcommand(subcommand =>
            subcommand.setName('play')
                .setDescription('Play a roulette of your chosen difficulty')
                .addStringOption(option =>
                    option.setName('difficulty')
                        .setDescription('The roulette\'s difficulty')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Standard', value: 'Standard' },
                            { name: 'Casual', value: 'Casual' },
                            { name: 'Maddening', value: 'Maddening' },
                            { name: 'Lunatic', value: 'Lunatic' },
                            { name: 'Infernal', value: 'Infernal' },
                            { name: 'Stygian', value: 'Stygian' },
                    )))
        .addSubcommand(subcommand =>
            subcommand.setName('info')
                .setDescription('View the odds of each type of roulette')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Process which subcommand to run through.
        if (subcommand == 'play') {
            const userChoice = interaction.options.getString('difficulty');
        let rouletteRoll;
        let content;

        switch (userChoice) {
            case 'Casual':
                // Play casual  roulette.
                rouletteRoll = Math.floor(Math.random() * 12 + 1);
                if (rouletteRoll == 1) content = `:boom: ${interaction.user.displayName} has lost a casual roulette. :gun:`;
                else content = `:bangbang: ${interaction.user.displayName} has won a casual roulette.`;
                break;

            case 'Maddening':
                // Play maddening roulette.
                rouletteRoll = Math.floor(Math.random() * 12 + 1);
                if (rouletteRoll > 1) content = `:boom: ${interaction.user.displayName} has lost a *maddening roulette*. :gun:`;
                else content = `:bangbang: Against most odds, ${interaction.user.displayName} has won a *maddening roulette*!`;
                break;

            case 'Lunatic':
                // Play lunatic roulette
                rouletteRoll = Math.floor(Math.random() * 1000 + 1);
                if (rouletteRoll > 1) content = `:boom: ${interaction.user.displayName} was foolish enough to believe they could win a **lunatic roulette**. :gun:`;
                else content = `:bangbang: Against all odds, ${interaction.user.displayName} has won a **lunatic roulette**!`;
                break;

            case 'Infernal':
                // Play the Infernal roulette
                rouletteRoll = Math.floor(Math.random() * 100000 + 1);
                if (rouletteRoll > 1) content = `:boom: ${interaction.user.displayName} was foolish enough to attempt the ***INFERNAL ROULETTE*** and has *burned in Hell.* :fire:`;
                else content = `:fire::fire::fire: ${interaction.user.displayName} has won the ***INFERNAL ROULETTE*** and emerged as the *Monarch of Hell*. :fire::fire::fire:`;
                break;

            case 'Stygian':
                // Play the Stygian roulette. This is the hardest difficulty.
                rouletteRoll = Math.floor(Math.random() * 2000000000 + 1);
                if (rouletteRoll > 1) content = `Darkness has enveloped ${interaction.user.displayName} in its stygian embrace. It is unknown if they will return.`;
                else content = `# The stygian darkness has been repelled by the light of ${interaction.user.name}, the Lightbearer!`;
                break;

            default:
                // Play a standard roulette
                rouletteRoll = Math.floor(Math.random() * 6 + 1);
                if (rouletteRoll > 1) content = `:boom: ${interaction.user.displayName} has lost a roulette. :gun:`;
                else content = `:bangbang: ${interaction.user.displayName} has won the roulette!`;
        }

        await interaction.reply(content);
        }
        else if (subcommand == 'info') {
            // Build a nice looking embed to lay out all of the information about roulettes
            const rouletteEmbed = new EmbedBuilder()
                .setColor('f0b3be')
                .setAuthor({
                    name: `${botName}`,
                    iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
                })
                .setTitle(`${botName} Roulette Info`)
                .addFields(
                    { name: 'Standard Odds:', value: '1/6 chance to win the roulette. *this will play by default when a difficulty is not specified.*' },
                    { name: 'Casual Odds:', value: '11/12 chance to win the roulette.' },
                    { name: 'Maddening Odds:', value: '1/12 chance to win the roulette.' },
                    { name: 'Lunatic Odds:', value: '1/1000 chance to win the roulette.' },
                )
                .setTimestamp()
                .setFooter({
                    text: `Brought to you by ${botName}`,
                    iconURL: 'https://cdn.discordapp.com/avatars/995022636549681152/2617cb7afb19882f89aa5ee1bec1c86a',
                });

            await interaction.reply({ embeds: [rouletteEmbed], ephemeral: true });
        }
    },
};