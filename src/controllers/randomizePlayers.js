const { PlayersModel } = require('../models/players');
const { TournamentModel } = require('../models/tournament');
const { shufflePlayersId } = require('../utility');
const setup = require('./setup');

const shuffle = async (players, rooms) => {
    try {
        shufflePlayersId(players);
        for (
            let roomIndex = 0, playerIndex = 1;
            roomIndex < rooms.length;
            roomIndex++, playerIndex += 2
        ) {
            const [player1, player2] = [
                players[playerIndex - 1],
                players[playerIndex],
            ];

            // const currentRoom = await TournamentModel.findOne(
            //     rooms[roomIndex].id
            // );
            player1.room = rooms[roomIndex];
            player2.room = rooms[roomIndex];
            await player1.save();
            await player2.save();
            rooms[roomIndex].players = [player1, player2];
            rooms[roomIndex].firstMove = player1.username;
            await rooms[roomIndex].save();
            // await TournamentModel.findByIdAndUpdate(
            //     { _id: rooms[roomIndex]._id },
            //     {
            //         $set: { players: [player1, player2] },
            //     }
            // );
        }
    } catch (error) {
        throw error;
    }
};

const randomizePlayers = async (req, res, next) => {
    try {
        if (req.method === 'GET') {
            const players = await PlayersModel.find({
                $and: [{ played: false }, { username: { $ne: 'admin' } }],
            });
            let rooms = await TournamentModel.find({ resultForWinner: null });

            if (players.length === 0) {
                res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'No one registered yet!',
                });
            } else if (players.length % 2) {
                res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'Waiting for players!',
                });
            } else {
                if (players.length === rooms.length * 2) {
                    await shuffle(players, rooms);
                } else {
                    const roomsToCreate =
                        ParseInt(players.length / 2) - rooms.length;

                    await setup(roomsToCreate);

                    let updatedRooms = await TournamentModel.find({
                        resultForWinner: null,
                    });

                    await shuffle(players, updatedRooms);
                }
                res.status(200).json({
                    status: 'ok',
                    data: 'players are ready to go!',
                    error: '',
                });
            }
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invlaid http verb',
            });
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    randomizePlayers,
};
