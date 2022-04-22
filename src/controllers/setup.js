const { TournamentModel } = require('../models/tournament');
const puppeteer = require('puppeteer');
const { playersModel } = require('../models/players');

const setup = async (n = undefined) => {
    try {
        const tournamentRoom = await TournamentModel.find({});
        const totalRooms = tournamentRoom.length;
        if (!n && totalRooms > 0) return;
        else {
            const browser = await puppeteer.launch({
                userDataDir: './data',
                args: ['--no-sandbox'],
            });
            for (
                let roomId = 0, counter = n ? totalRooms + 1 : 1;
                roomId < (n || 1);
                roomId++, counter++
            ) {
                const page = await browser.newPage();
                await page.goto('http://3.83.84.211', {
                    waitUntil: 'domcontentloaded',
                    timeout: 0,
                });

                await Promise.resolve(page.waitForNavigation());

                let url = await page.url();
                const tournamentRoom = new TournamentModel({
                    id: url,
                    room: `room${counter}`,
                });
                const tournament = await tournamentRoom.save();
                console.log(tournament);
            }
            browser.close();
        }
    } catch (error) {
        throw error;
    }
};

module.exports = setup;
