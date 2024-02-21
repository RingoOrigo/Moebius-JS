/*
    This is a model for Moebius's database.
        It is meant to store data PER USER in relation to the bot's infant currency system.
*/

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        // Store data in two blocks: The user's discord ID and the user's balance.
        userID: {
            // Store the user's ID as a string.
            type: DataTypes.STRING,
            primaryKey: true,
        },
        balance: {
            // Store the balance as an integer value, defaulting it to zero.
            // allowNull: false forces the two keys to be updated together.
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        // Disable the "createdAt" and "updatedAt" columns automatically created by Sequelize
        timestamps: false,
    });
};