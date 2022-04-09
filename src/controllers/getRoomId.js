const puppeteer = require('puppeteer');
const fs = require('fs');
const getRoomId = (req, res) => {
    (async () => {
        try {
            let roomData = new Map();
            const file = fs
                .readFileSync('url.txt', 'utf8')
                .toString()
                .trim()
                .split('\n');
            file.forEach((item) => {
                item = item.split(':=');
                roomData.set(item[0], item[1]);
            });

            if (req.method === 'GET') {
                const roomId = roomData.get(req.query.roomId);
                if (roomData.has(req.query.roomId)) {
                    res.status(200).json({
                        url: roomId,
                    });
                }
            } else if (req.method === 'POST') {
                const roomId = req.body.roomId;
                const value = req.body.value;
                console.log(
                    req.body.roomId,
                    roomId,
                    value,
                    '012345678'.includes(value),
                    roomData.has(roomId)
                );
                if ('012345678'.includes(value) && roomData.has(roomId)) {
                    const container = roomData.get(roomId);
                    console.log(container);
                    const browser = await puppeteer.launch({
                        userDataDir: './data',
                        args: ['--no-sandbox'],
                    });
                    const page = await browser.newPage();

                    await page.setExtraHTTPHeaders({
                        serverpermission: 'true',
                    });

                    await page.goto(container);
                    await page.waitForSelector('#square-0', { timeout: 0 });
                    // await page.waitForTimeout(1000)
                    const cell = await page.$(`#square-${value}`);
                    await cell.evaluate((el) => (el.style.pointerEvents = ''));
                    await cell.click();

                    // await element.click()
                    await page.screenshot({ path: 'example.png' });
                    await browser.close();
                    res.status(200).end();
                }
            }
        } catch (error) {
            throw error;
        }
    })();
};

module.exports = getRoomId;
