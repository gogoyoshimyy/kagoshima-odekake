import * as cheerio from 'cheerio';

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch event detail page to get description
async function fetchEventDetail(url: string): Promise<string> {
    try {
        await delay(1000); // 1 second delay to be respectful
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Look for description in the detail page
        const description = $('.m-articleset--3__lead').first().text().trim();
        return description || 'Scraped from Walkerplus';
    } catch (error) {
        console.error(`Error fetching detail for ${url}:`, error);
        return 'Scraped from Walkerplus';
    }
}

async function scrapeWalkerplus() {
    // Walkerplus for Kagoshima, today's events
    const TARGET_URL = 'https://www.walkerplus.com/event_list/today/ar1046/';
    console.log(`Fetching ${TARGET_URL}...`);

    try {
        const response = await fetch(TARGET_URL);
        const html = await response.text();
        const $ = cheerio.load(html);

        const events: any[] = [];

        $('.m-mainlist-item').each((_, element) => {
            const item = $(element);

            // Extract fields
            const title = item.find('.m-mainlist-item__ttl').text().trim();
            const date = item.find('.m-mainlist-item-event__period').text().trim(); // Contains "開催中" etc.
            const venue = item.find('.m-mainlist-item-event__place').text().trim();
            const area = item.find('.m-mainlist-item__map').text().trim();

            const linkTag = item.find('a').first(); // Usually the title link or image link
            const href = linkTag.attr('href');

            let img = item.find('.m-mainlist-item__img img').attr('src');
            // Handle lazy loading or relative paths if necessary. 
            // In debug output: //ms-cache.walkerplus.com/...
            if (img && img.startsWith('//')) {
                img = 'https:' + img;
            }

            if (!title) return;

            const id = href ? href.split('/').filter(Boolean).pop() : Math.random().toString(36).substr(2, 9);
            const sourceUrl = href ? `https://www.walkerplus.com${href}` : null;

            events.push({
                id,
                title,
                startAt: date.replace(/\s+/g, ' '), // Clean up newlines
                area: area.replace(/\s+/g, ' '),
                venueName: venue,
                imageUrl: img,
                sourceUrl,
                descriptionShort: null // Will be filled in next step
            });
        });

        console.log(`Found ${events.length} events. Fetching details...`);

        // Fetch details for each event
        for (const event of events) {
            if (event.sourceUrl) {
                console.log(`  Fetching details for: ${event.title}`);
                event.descriptionShort = await fetchEventDetail(event.sourceUrl);
            } else {
                event.descriptionShort = 'Scraped from Walkerplus';
            }
        }

        console.log(`Completed fetching details for ${events.length} events.`);
        console.log(JSON.stringify(events.slice(0, 2), null, 2));

        return events;

    } catch (error) {
        console.error('Error scraping:', error);
        return [];
    }
}

export { scrapeWalkerplus };
