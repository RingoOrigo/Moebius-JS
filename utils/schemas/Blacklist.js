/*
    Just a simple schema to define a list of users to be blacklisted
        Blacklisted means that Moebius will NOT respond to the user without a command
*/

const { Schema, model } = require('mongoose');

const BlacklistSchema = new Schema(
    {
        // Store the user's ID when they opt into the blacklist
        userID: {
            type: String,
            required: true,
        },
    },
);

module.exports = model('Blacklist', BlacklistSchema);