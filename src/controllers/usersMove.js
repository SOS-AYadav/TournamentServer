const puppeteer = require('puppeteer');
const { playersModel } = require('../models/players');
const { TournamentModel } = require('../models/tournament');

const usersMove = async (req, res, next) => {
    try {
        if (req.method === 'POST') {
            const room = req.user.roomId;
            const value = req.body.value;
            const username = req.user.username;

            const roomData = await TournamentModel.findOne({
                room,
            }).populate('players');
            if (roomData.firstMove === username) {
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
                    let cellValue = await cell.evaluate((el) => el.innerText);
                    console.log(cellValue);

                    await cell.evaluate((el) => (el.style.pointerEvents = ''));
                    await cell.click();
                    await browser.close();
                    const players = roomData.players
                        .map((player) => player.username)
                        .filter((player) => player !== username);
                    roomData.firstMove = players[0];
                    const grid = roomData.grid.split('');
                    grid[parseInt(value)] = '.';
                    roomData.grid = grid.join('');
                    await roomData.save();
                    res.status(200).json({
                        status: 'ok',
                        data: 'success',
                        error: '',
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
