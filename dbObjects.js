/*
    comment
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

const Users = require('./models/Users.js')(sequelize, sequelize.DataTypes);

module.exports = { Users };