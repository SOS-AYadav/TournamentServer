const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    passkey: {
        type: String,
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        default: null,
    },
    token: {
        type: String,
    },
    played: {
        type: String,
        default: null,
    },
});

const playersModel = mongoose.model('Player', PlayerSchema);

module.exports = { playersModel };
