const { adminLogin } = require('../controllers/adminLogin');
const { generatePasskey } = require('../controllers/generatePasskey');
const { getRoomId } = require('../controllers/getRoomId');
const { randomizePlayers } = require('../controllers/randomizePlayers');
const { usersMove } = require('../controllers/usersMove');
const { verifyToken } = require('../middleware/auth');

const appRoutes = (app) => {
    app.use('/adminlogin', adminLogin);
    app.use('/getRoomId', getRoomId);
    app.use('/usersMove', verifyToken, usersMove);
    app.use('/generatepasskey', generatePasskey);
    app.use('/randomize', randomizePlayers);
    app.use('*', (_, res) =>
        res.status(200).json({ message: 'Oops! Invalid Route' })
    );
};

module.exports = appRoutes;
