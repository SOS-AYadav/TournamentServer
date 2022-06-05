const puppeteer = require('puppeteer');
const { PlayersModel } = require('../models/players');
const { TournamentModel } = require('../models/tournament');
const { calculateWinner } = require('../utility');

const usersMove = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const room = req.user.roomId;
            const value = req.body.value;
            const username = req.user.username;

            const roomData = await TournamentModel.findOne({
                room,
            }).populate('players');
            if (roomData.resultForWinner) {
                return res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'Match over!',
                });
            } else if (roomData.firstMove === username) {
                const player = await PlayersModel.findOne({ username });
                if (!player.played) {
                    player.played = true;
                    await player.save();
                }
                if (roomData.grid[parseInt(value)] === '#') {
                    const browser = await puppeteer.launch({
                        userDataDir: './data',
                        args: ['--no-sandbox'],
                    });
                    const page = await browser.newPage();

                    await page.setExtraHTTPHeaders({
                        serverpermission: 'true',
                    });

                    await page.goto(roomData.id);
                    await page.waitForSelector('#square-0', { timeout: 0 });
                    // await page.waitForTimeout(1000)
                    const cell = await page.$(`#square-${value}`);

                    await cell.evaluate((el) => (el.style.pointerEvents = ''));
                    await cell.click();
                    let cellValue = await cell.evaluate((el) => el.innerText);

                    await browser.close();

                    if (cellValue) {
                        const players = roomData.players
                            .map((player) => player.username)
                            .filter((player) => player !== username);
                        roomData.firstMove = players[0];

                        const grid = roomData.grid.split('');
                        grid[parseInt(value)] = roomData.defaultValue;
                        roomData.grid = grid.join('');
                        roomData.defaultValue =
                            roomData.defaultValue === 'X' ? 'O' : 'X';

                        const winner = calculateWinner(grid);

                        if (winner) {
                            roomData.resultForWinner = username;
                            roomData.resultForLoser = players[0];
                        }
                        await roomData.save();

                        return res.status(200).json({
                            status: 'ok',
                            data: winner ? username : '',
                            error: '',
                        });
                    }
                    return res.status(200).json({
                        status: 'error',
                        data: '',
                        error: 'Something went wrong. Try again!',
                    });
                } else {
                    res.status(200).json({
                        status: 'error',
                        data: '',
                        error: 'Wrong move',
                    });
                }
                // await element.click()
                // await page.screenshot({ path: 'example.png' });
            } else {
                res.status(200).json({
                    status: 'error',
                    data: '',
                    error: 'Wait for your turn!',
                });
            }
        } else {
            res.status(200).json({
                status: 'error',
                data: '',
                error: 'Invlaid http verb',
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { usersMove };
