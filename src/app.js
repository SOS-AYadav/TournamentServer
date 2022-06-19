const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const setup = require('./controllers/setup');
const appRoutes = require('./routes');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { errorHandler } = require('./errorHandler');
// const { run } = require('./backgroundTasks');
const jwt = require('jsonwebtoken');
const { usersMove } = require('./controllers/usersMove');
require('./models/db');
require('dotenv').config();

setup();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Access-Control-Allow-Origin'],
    },
});

app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.json());
// app.use(run);

appRoutes(app);

// io.attachApp(app);
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log(token, 'tokenzzz');
    if (token) {
        if (token.toLowerCase() === process.env.VIEWER) {
            next();
        } else {
            try {
                const decoded = jwt.verify(token, process.env.TOKEN_KEY);
                socket.user = decoded;
                console.log(decoded);
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
});

app.use(errorHandler);

httpServer.listen(process.env.API_PORT, () =>
    console.log(`listening on ${process.env.API_PORT}`)
);

// setup()
// const app = express()
// app.use(cors())

// app.use(
//     bodyParser.urlencoded({
//         extended: true,
//     })
// )

// app.use(express.json())

// appRoutes(app)

// app.listen(4000, () => console.log('Listening on 4000...'))
