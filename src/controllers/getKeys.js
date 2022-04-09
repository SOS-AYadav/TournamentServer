const { generateRandomData } = require('../utility');
const { playersModel } = require('../models/players');

const getKeys = async (req, res) => {
    try {
        if (!req.params.room.toLowerCase().startsWith('room')) {
            res.status(200).send({
                data: 'Room name is incorrect!',
            });
        } else if (req.params.room.length < 5) {
            res.status(200).send({
                data: 'Room length is incorrect!',
            });
        } else if (!req.params.size) {
            res.status(200).send({
                data: 'key length is required!',
            });
        } else {
            const key = generateRandomData(req.params.size);
            // const players = new playersModel({
            //     room: req.params.room,
            //     playerKeys: [key],
            // });
            // const newRoomData = await players.save();
            res.status(200).send({
                data: key,
            });
        }
    } catch (error) {
        throw error;
    }
};

module.exports = getKeys;
