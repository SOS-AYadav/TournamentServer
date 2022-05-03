const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateKey } = require('../utility');
const { playersModel } = require('../models/players');

const generatePasskey = async (req, res, next) => {
    try {
        console.log(req.body);
        if (req.method === 'POST') {
            if (parseInt(req.body.size) < 3) {
                res.status(200).send({
                    status: 'error',
                    data: '',
                    error: 'key of length more than 3 is required!',
                });
            } else {
                const { username, size } = req.body;

                const playerExist = await playersModel.findOne({
                    username,
                });
                console.log(playerExist);
                if (playerExist) {
                    res.status(200).json({
                        status: 'error',
                        data: '',
                        error: 'username already exists',
                    });
                } else {
                    const key = generateKey(size);
                    const encryptedPasskey = await bcrypt.hash(
                        key,
                        parseInt(process.env.PASS_SALT)
                    );
                    const player = new playersModel({
                        username,
                        passkey: encryptedPasskey,
                    });
                    const token = jwt.sign(
                        {
                            username,
                            size,
                        },
                        process.env.TOKEN_KEY,
                        { expiresIn: '3h' }
                    );
                    player.token = token;
                    const newPlayerData = await player.save();

                    res.status(200).send({
                        status: 'ok',
                        data: {
                            username: newPlayerData.username,
                            passkey: key,
                        },
                        error: '',
                    });
                }
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

module.exports = { generatePasskey };
