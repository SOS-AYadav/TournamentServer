const { Queue, QueueScheduler, Worker } = require('bullmq');
const setup = require('./controllers/setup');
const { PlayersModel } = require('./models/players');
const { TournamentModel } = require('./models/tournament');

const connection = {
    host: 'localhost',
    port: 6380,
};

// Create a new connection in every instance
const mainJobQueueScheduler = new QueueScheduler('main', {
    connection: connection,
});
const mainJobQueue = new Queue('main', {
    connection: connection,
});

const mainWorker = new Worker(
    'main',
    async (job) => {
        if (job.name === 'createRoom') {
            let url = undefined;
            const players = await PlayersModel.find({
                $and: [{ played: false }, { username: { $ne: 'admin' } }],
            });

            const rooms = await TournamentModel.find({ resultForWinner: null });

            if (players.length !== rooms.length * 2) {
                const roomsToCreate =
                    Math.floor(players.length / 2) - rooms.length;
                url = await setup(roomsToCreate);
                await job.updateProgress(100);
                return url;
            }
        } else {
            const players = await PlayersModel.find({
                played: true,
            });
            const rooms = await TournamentModel.find({
                resultForWinner: { $ne: null },
            });
            if (rooms.length * 2 === players.length) {
                await setup(players.length / 2);
            }
        }
    },
    {
        connection: connection,
    }
);
mainWorker.on('completed', (job, data) => {
    // console.log('running background tasks...');
    data &&
        console.log(
            `***************************** Job '${job.name}' completed successfully. Room ${data} is created*****************************`
        );
});
mainWorker.on('failed', (job, err) => {
    console.log(
        `***************************** Job '${job.name}' failed *****************************`
    );
});

const run = async (req, res, next) => {
    await mainJobQueue.add(
        'createRoom',
        {},
        {
            repeat: {
                every: 3000,
            },
            jobId: '#room',
        }
    );

    await mainJobQueue.add(
        'newGame',
        {},
        {
            repeat: {
                every: 5000,
            },
            jobId: '#newGame',
        }
    );
    next();
};

module.exports = { run };
