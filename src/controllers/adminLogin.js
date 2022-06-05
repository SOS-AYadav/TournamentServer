const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PlayersModel } = require('../models/players');

const adminLogin = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const admin = await PlayersModel.findOne({
                username: req.body.username,
            });
            if (
                admin &&
                (await bcrypt.compare(req.body.passkey, admin.passkey))
            ) {
                const token = jwt.sign(
                    {
                        username: admin.username,
                    },
                    process.env.TOKEN_KEY,
                    { expiresIn: '3h' }
                );
                admin.token = token;
                await admin.save();
                res.status(200).json({
                    status: 'ok',
                    data: { token },
                    error: '',
                });
            } else {
                res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'Invalid Credentials',
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
        next(error);
    }
};

module.exports = {
    adminLogin,
};
