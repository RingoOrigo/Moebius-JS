// Required for command handling
// fs is node's FileSystem module, used to read the commands directory.
// path is used to make paths to access diles and directories
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token, status } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Collection is an extention of the Map class, used to store commands for efficient retrieval and execution.
client.commands = new Collection();

// Dynamically retrieve command files
// Start by getting the file paths of all command folders.
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    // Retrieve all .js files
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Insert a new item into the collection.
        // The key is the command name, while the value is the exported module

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[ERROR] ${filePath} command is missing either "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    // Return if the interaction isn't a slash command.
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    // If the command ISN'T found:
    if (!command) {
        console.error(`No command matching the name "${interaction.commandName}" was found.`);
        return;
    }

    try {
        // Attempt to execute the command
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);

        // Catch any error during command execution
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
        }
    }
});


// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Set the bot's status
    client.user.setActivity(status, { type: ActivityType.Watching });
});

// Log in to Discord with your client's token
client.login(token);
