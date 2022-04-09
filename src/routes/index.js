const getKeys = require('../controllers/getKeys');
const getRoomId = require('../controllers/getRoomId');

const appRoutes = (app) => {
    app.use('/getRoomId', getRoomId);
    app.use('/getKeys/:room/:size', getKeys);
    app.use('/', (req, res) => res.send({ message: 'hello!' }));
};

module.exports = appRoutes;
