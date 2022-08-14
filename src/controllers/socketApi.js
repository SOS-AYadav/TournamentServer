const jwt = require('jsonwebtoken');
const { getRoomId } = require('./getRoomId');
const { usersMove } = require('./usersMove');

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
    }).on('connection', (socket) => {
        socket.on('usermove', (msg) => {
            socket.body = msg;
            usersMove(socket);
        });
        socket.on('getRoomId', () => {
            getRoomId(socket);
        });

        socket.on('online', (roomId) => {
            console.log('onlinee', socket.rooms);
            io.to(roomId).emit('active', {
                status: 'ok',
                data: {
                    username: socket.user.username,
                    active: true,
                },
                error: '',
            });
        });

        socket.on('audience', (data) => {
            socket.join(data.roomId);
            console.log(socket.rooms, data);
        });

        socket.on('disconnecting', (roomId) => {
            socket.to(roomId).emit('active', {
                status: 'ok',
                data: {
                    username: socket.user.username,
                    active: false,
                },
                error: '',
            });
        });
    });
};

module.exports = { socketApi };
