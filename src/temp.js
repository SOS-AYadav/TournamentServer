const { Queue, QueueScheduler, Worker } = require('bullmq');
const setup = require('./controllers/setup');
const { playersModel } = require('./models/players');
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
        let url = undefined;
        const players = await playersModel.find({
            $and: [{ played: null }, { username: { $ne: 'admin' } }],
        });

        const rooms = await TournamentModel.find({ resultForWinner: null });

        if (players.length === rooms.length * 2) {
        } else {
            const roomsToCreate = Math.round(players.length / 2) - rooms.length;
            url = await setup(roomsToCreate);
        }
        await job.updateProgress(100);
        return url;
    },
    {
        connection: connection,
    }
);
mainWorker.on('completed', (job, data) => {
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
                every: 5000,
                limit: 5,
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
                limit: 5,
            },
            jobId: '#newGame',
        }
    );

    next();
};

module.exports = { run };
