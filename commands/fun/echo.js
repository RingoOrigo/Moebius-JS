/*
    Have the Moebius repeat the message input by the user in one of two ways.
        - Display the message with normal text OR display the message in bubble letters (with emotes)
        - Allow the user to remain anonymous if desired
*/

const { SlashCommandBuilder } = require('discord.js');
const { botName } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription(`Have ${botName} repeat your message`)

        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to be echoed')
                .setRequired(true))

                .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('Choose whether or not you remain anonymous, defaults to false'))

        .addBooleanOption(option =>
            option.setName('bubbled')
                .setDescription('Choose if your message will be sent in bubble letters or not, defaults to false')),

    async execute(interaction) {
        const anonymous = interaction.options.getBoolean('anonymous') ?? false;
        const bubbled = interaction.options.getBoolean('bubbled') ?? false;
        const content = interaction.options.getString('message');
        const symbols = [',', '.', '/', '?', '<', '>', '\'', '"', ';', ':', '[', ']', '{', '}', '|', '\\', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '-', '+'];
        let finalMessage = '';
        let signature;

        if (!anonymous) signature = `\n- ${interaction.user.displayName}`;
        else signature = '';

        switch (bubbled) {
            case true:
                // Bubbled letters are simply emojis, and we will need to loop through the content string character-by-character.
                for (let i = 0; i < content.length; i++) {
                    const currentChar = content[i];
                    if (currentChar == ' ') {finalMessage += '  ';}
                    else if (!isNaN(parseInt(currentChar))) {
                        switch (currentChar) {
                            case '1':
                                finalMessage += ':one:';
                                break;
                            case '2':
                                finalMessage += ':two:';
                                break;
                            case '3':
                                finalMessage += ':three:';
                                break;
                            case '4':
                                finalMessage += ':four:';
                                break;
                            case '5':
                                finalMessage += ':five:';
                                break;
                            case '6':
                                finalMessage += ':six:';
                                break;
                            case '7':
                                finalMessage += ':seven:';
                                break;
                            case '8':
                                finalMessage += ':eight:';
                                break;
                            case '9':
                                finalMessage += ':nine:';
                                break;
                            default:
                                finalMessage += ':zero:';
                        }
                    }
                    else if (symbols.indexOf(currentChar) != -1) {
                        finalMessage += currentChar;
                    }
                    else { finalMessage += `:regional_indicator_${currentChar.toLowerCase()}: `; }
}
                finalMessage += signature;
                break;
            default:
                finalMessage = content + signature;
        }
        // Send the echoed message publicly
        await interaction.channel.send(finalMessage);
        await interaction.reply({ content: 'Sucessfully echoed your message.', ephemeral: true });
    },
};