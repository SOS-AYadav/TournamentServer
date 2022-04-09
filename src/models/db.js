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
