const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true,
    },
    winner: {
        type: String,
        default: 'None',
    },
    playerKeys: {
        type: [String],
        default: [],
    },
});

const playersModel = mongoose.model('player', PlayerSchema);

module.exports = { playersModel };
