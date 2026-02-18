import * as cheerio from 'cheerio';

async function debugScraper() {
    const TARGET_URL = 'https://www.kagoshima-kankou.com/event';
    try {
        const response = await fetch(TARGET_URL);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Find the first event link and print its parent container's HTML
        const firstLink = $('a[href*="/event/"]').first();
        if (firstLink.length) {
            // Traverse up to find a likely container
            const container = firstLink.closest('li');
            console.log("--- HTML DUMP ---");
            console.log(container.html() || firstLink.parent().html());
            console.log("-----------------");
        } else {
            console.log("No event links found.");
        }

    } catch (error) {
        console.error(error);
    }
}

debugScraper();
