const puppeteer = require('puppeteer');

const scrape = async () => {
    console.log('start scrape');
    const browser = await puppeteer.launch({
        headless: false
    });
    const requests = Array(50).fill(1).map((_, index) => scrapePage(index + 1, browser));
    const results = await Promise.all(requests);

    console.log(results);
    browser.close();
};

const scrapePage = async (pageNum, browser) => {
    const pageUrl = `http://books.toscrape.com/catalogue/page-${pageNum}.html`;
    const page = await browser.newPage();

    // 请求拦截
    const blockTypes = new Set(['image', 'media', 'font', 'stylesheet', 'script']);
    await page.setRequestInterception(true);
    page.on('request', request => {
        const type = request.resourceType();
        const shouldBlock = blockTypes.has(type);
        if (shouldBlock) {
            return request.abort();
        } else {
            return request.continue();
        }
    });

    await page.goto(pageUrl, {
        waitUntil: 'load',
        timeout: 0,
    });
    const titles = await page.$$eval('h3 a', (dom) => {
        return dom.map(target => target.title);
    });

    page.close();
    return titles;
};

scrape();
