/*
        Deploys all commands globally, this means that they can be used in any server containing the bot.
            - Only do this once a command works properly within your test server.
            - Commands may take a bit of extra time to sync with Discord
*/

const { REST, Routes } = require('discord.js');
const { token, clientID, guildID } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Empty array of all of the bot's commands.
const commands = [];

// Define path of subfolders that would hold all commands.
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Get all command files from specified directory
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Get all slash commands from their respective files.
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
        else {
            console.log(`[ERROR] Command at ${filePath} is missing either "data" or "execute" properties.`);
        }
    }
}

// Create instance of REST module
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
    try {
        console.log(`Started deploying ${commands.length} slash commands globally.`);

        // eslint-disable-next-line no-unused-vars
        const data = await rest.put(
            Routes.applicationCommands(clientID),
            { body: commands },
        );

        console.log(`Successfully deployed ${commands.length} slash commands to all guilds.`);
    }
    catch (error) {
        // Catch any errors when deploying commands to Discord.
        console.error(error);
    }
})();

// Delete guild commands upon global deployment
rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);