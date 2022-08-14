const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PlayersModel } = require('../models/players');

const loginUser = async (req, res, next) => {
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
            const user = await PlayersModel.findOne({ username });
            if (user && (await bcrypt.compare(passkey, user.passkey))) {
                const token = jwt.sign(
                    {
                        username: user.username,
                    },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: '1d',
                    }
                );
                user.token = token;
                await user.save();
                return res.status(200).json({
                    status: 'ok',
                    data: {
                        token,
                    },
                    error: '',
                });
            }
            return res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invalid Credentials',
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

module.exports = { loginUser };