const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const setup = require('./controllers/setup');
const appRoutes = require('./routes');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { errorHandler } = require('./errorHandler');
// const { run } = require('./temp');
require('./models/db');
require('dotenv').config();

setup();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.json());
// app.use(run);
appRoutes(app);

// io.attachApp(app)

io.on('connection', (socket) => {
    console.log('hello', socket);
    socket.emit('test');
});

app.use(errorHandler);

httpServer.listen(4001, () => console.error('listening on 4001'));

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
