/*
 * In order to get Moebius verified on Discord, changes were made to streamline the process.
 * The gateway intent for GUILD_MEMBERS was removed (it was never actually used)
 * The gateway intent for MESSAGE_CONTENT was removed, along with functions that take advantage of it.
 *      Moebius WILL reapply for this intent. The removal is temporary, but if it is not granted by Discord, the removal will remain permanent
*/


// Required for command handling
// fs is node's FileSystem module, used to read the commands directory.
// path is used to make paths to access diles and directories
// eslint-disable-next-line no-unused-vars
const { Client, Collection, GatewayIntentBits } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { token, testToken, status, mongoDBURI } = require('./config.json');
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [] });

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

// Read in event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    // This is the same logic as finding all command files.
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        // If the event is meant to only run once (such as ready), then run it when it is loaded
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        // Else, run the event as it occurs
        client.on(event.name, (...args) => event.execute(...args));
    }
}

(async () => {
    // Connect to the MongoDB database
    // It is worth noting here that if you configured your database to only be accessible by a certain IP,
    //      This will fail if your IP is not specified.
    await mongoose.connect(mongoDBURI);
    console.log('Successfully connected to database.');

    // Log in to Discord with your client's token
    client.login(token);
}) ();
