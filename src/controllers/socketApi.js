const jwt = require('jsonwebtoken');
const { PlayersModel } = require('../models/players');
const { getRoomId } = require('./getRoomId');
const { usersMove } = require('./usersMove');

let users = {};

const socketApi = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (token) {
            if (token === process.env.VIEWER) {
                next();
            } else {
                try {
                    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
                    socket.user = decoded;

                    next();
                } catch {
                    next(
                        new Error(
                            JSON.stringify({
                                status: 'error',
                                data: '',
                                error: 'Authentication Error!',
                            })
                        )
                    );
                    // next(new Error(error));
                }
            }
        } else {
            console.log('errror');
            // throw Error('Auth');
            // next();
            next(
                new Error(
                    JSON.stringify({
                        status: 'error',
                        data: '',
                        error: 'Authentication Error!',
                    })
                )
            );
        }
    }).on('connection', async (socket) => {
        let roomId = '';
        if (socket.user) {
            try {
                const player = await PlayersModel.findOne({
                    username: socket.user.username,
                }).populate('room');
                roomId = player.room[player.room.length - 1].id;
                if (users[roomId]) {
                    users[roomId].add(socket.user.username);
                    for (const user of users[roomId]) {
                        console.log('uzzzz', user);
                        io.to(roomId).emit('active', {
                            status: 'ok',
                            data: {
                                username: user,
                                active: true,
                            },
                            error: '',
                        });
                    }
                } else {
                    users[roomId] = new Set();
                }
            } catch (error) {
                console.error(error);
            }
        }
        socket.on('usermove', (msg) => {
            socket.body = msg;
            usersMove(socket);
        });
        socket.on('getRoomId', () => {
            getRoomId(socket);
        });

        // socket.on('online', (roomId) => {
        //     console.log('onlinee', socket.rooms);

        //     console.log(users);
        //     io.to(roomId).emit('active', {
        //         status: 'ok',
        //         data: {
        //             username: socket.user.username,
        //             active: true,
        //         },
        //         error: '',
        //     });
        // });

        socket.on('audience', (data) => {
            socket.join(data.roomId);
            console.log(socket.rooms, data);
        });

        socket.on('disconnecting', async () => {
            if (socket.user) {
                try {
                    users[roomId].delete(socket.user.username);
                    io.to(roomId).emit('active', {
                        status: 'ok',
                        data: {
                            username: socket.user.username,
                            active: false,
                        },
                        error: '',
                    });
                    if (users[roomId].size === 0) {
                        delete users[roomId];
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            console.log('disconnecttingg....', socket.user.username);
            // if (socket.user.username) {
            //     users = users[socket.user.username]?.filter(
            //         (id) => id === socket.id
            //     );
            //     if (users?.[socket.user.username]?.length === 0) {

            // delete users[socket.user.username];
            // }
            // }
        });
    });
};

module.exports = { socketApi };
