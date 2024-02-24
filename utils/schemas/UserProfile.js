/*
    This is the database schema for storing user information.
    This is used for the economy system, so only the user's ID and balance will
        be stored, though this can change if a shop system is added later.
*/

const { Schema, model } = require('mongoose');

const UserProfileSchema = new Schema(
    {
        // Store the user's ID, balance, and the last time they obtained any new currency
        userID: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        totalHauls: {
            type: Number,
            default: 0,
        },
        legendaryHauls: {
            type: Number,
            default: 0,
        },
        epicHauls: {
            type: Number,
            default: 0,
        },
        uncommonHauls: {
            type: Number,
            default: 0,
        },
        commonHauls: {
            type: Number,
            default: 0,
        },
        haulFailures: {
            type: Number,
            default: 0,
        },
        backgrounds: {
            type: [String],
            default: ['bg1'],
        },
        currentBG: {
            type: String,
            default: 'bg1',
        },
    },
    { timestamps: true },
);

module.exports = model('UserProfile', UserProfileSchema);