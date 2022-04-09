const puppeteer = require('puppeteer');
const fs = require('fs');

const setup = () => {
    (async () => {
        try {
            const file = fs.readFileSync('url.txt', 'utf8').toString().trim();
            if (file.endsWith('eof')) return;
            else {
                const browser = await puppeteer.launch({
                    userDataDir: './data',
                    args: ['--no-sandbox'],
                });
                for (let roomId = 1; roomId < 10; roomId++) {
                    const page = await browser.newPage();
                    await page.goto('http://3.83.84.211', {
                        waitUntil: 'domcontentloaded',
                        timeout: 0,
                    });
                    // const all = await browser.pages()
                    // const thatPage = await all[roomId - 1]?.bringToFront()
                    // await thatPage?.$('#square-0').click()

                    // await page.waitForSelector('#square-0', { timeout: 0 })
                    await Promise.resolve(page.waitForNavigation());

                    let url = await page.url();

                    fs.appendFileSync('./url.txt', `room${roomId}:=${url}\n`);
                }
                browser.close();
                fs.appendFileSync('./url.txt', `eof\n`);
            }
        } catch (error) {
            throw error;
        }
    })();
};

module.exports = setup;
