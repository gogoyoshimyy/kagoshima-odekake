import * as cheerio from 'cheerio';

async function debugWalkerplus() {
    const TARGET_URL = 'https://www.walkerplus.com/event_list/today/ar1046/';
    try {
        const response = await fetch(TARGET_URL);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Walkerplus usually has a list of events. 
        // Looking for main list items.
        // Let's dump the first likely event item.

        // Try to find a list item that contains a link to /event/
        const firstLink = $('a[href*="/event/"]').first();

        if (firstLink.length) {
            const container = firstLink.closest('li, .m-mainlist-item');
            console.log("--- HTML DUMP WALKERPLUS ---");
            console.log(container.html() || firstLink.parent().html());
            console.log("----------------------------");
        } else {
            console.log("No event links found.");
        }

    } catch (error) {
        console.error(error);
    }
}

debugWalkerplus();
