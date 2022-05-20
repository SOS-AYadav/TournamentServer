const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { playersModel } = require('../models/players');
const { TournamentModel } = require('../models/tournament');
const getRoomId = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const { username, passkey } = req.body;
            if (!(username && passkey)) {
                return res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'All inputs required',
                });
            }
            if (username === 'admin') {
                return res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'Username is reserved!',
                });
            }

            const user = await playersModel
                .findOne({ username })
                .populate('room');
            if (user && (await bcrypt.compare(passkey, user.passkey))) {
                const token = jwt.sign(
                    {
                        username: user.username,
                        roomId: user.room.room,
                    },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: '3h',
                    }
                );
                user.token = token;
                await user.save();
                return res.status(200).json({
                    status: 'ok',
                    data: {
                        token,
                        url: user.room.id,
                    },
                    error: '',
                });
            }
            return res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invalid Credentials',
            });
        } else if (req.method === 'GET') {
            const rooms = await TournamentModel.find({}, { _id: 0, id: 1 });
            res.status(200).json({
                status: 'ok',
                data: { rooms },
                error: '',
            });
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invlaid http verb',
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getRoomId };
