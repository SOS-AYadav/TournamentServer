const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const setup = require('./controllers/setup');
const appRoutes = require('./routes');
const { Server } = require('socket.io');
const { createServer } = require('http');
const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1:27018/tictac';
const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
mongoose.connect(mongoDB, options);

// const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'MongoDB connection error'));

// db.once('on', () => console.log('Connected to db successfully'));

// const uApp = new App()
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

appRoutes(app);

// io.attachApp(app)

io.on('connection', (socket) => {
    console.log('hello', socket);
});

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
