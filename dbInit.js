/*
    This script automatically initialises the database for use by the rest of the bot's files.
*/

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    /*
        Host tells the program where to look for the database, while dialect is the database engine being used.
        Logging enables output from Sequelize.
        Storage is exclusive to SQLite databases, as SQLite DBs are the only ones to store data in only a single file.
    */
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

// Pull models from the models folder
require('./models/Users.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

// Sync the database upon initialization
sequelize.sync({ force }).then(async () => {
    // Log when the database has been successfully synced.
    console.log('Database Synced');
    sequelize.close();
}).catch(console.error);