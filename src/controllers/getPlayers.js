const { TournamentModel } = require('../models/tournament');

const getPlayers = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            console.log(req.body);
            const tournamentPlayers = await TournamentModel.findOne({
                room: req.body.room,
            }).populate('players');
            console.log(tournamentPlayers);
            const players = tournamentPlayers.players.map(
                (player) => player.username
            );

            res.status(200).json({
                status: 'ok',
                data: players,
                error: '',
            });
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invalid http verb',
            });
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { getPlayers };
