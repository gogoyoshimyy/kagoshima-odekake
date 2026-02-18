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
        const description = $('.o-detail-contents__description').first().text().trim();
        return description || 'Scraped from Kagoshima Kankou';
    } catch (error) {
        console.error(`Error fetching detail for ${url}:`, error);
        return 'Scraped from Kagoshima Kankou';
    }
}

async function scrapeKagoshimaKankou() {
    const TARGET_URL = 'https://www.kagoshima-kankou.com/event';
    console.log(`Fetching ${TARGET_URL}...`);

    try {
        const response = await fetch(TARGET_URL);
        const html = await response.text();
        const $ = cheerio.load(html);

        const events: any[] = [];

        // Based on typical structure, look for event cards. 
        // Since we don't know the exact class names without inspecting HTML, 
        // we'll try to find common patterns or list items.
        // Hypothesizing structure based on standard lists.
        // Often these are in <ul> or <div> with class related to 'event', 'list', 'item'.

        // Let's look for article tags or common classes
        // If specific classes fail, we might need to be more generic.

        // Strategy: Find links that look like event details
        // The URLs usually follow pattern /event/{id}

        // Specific selectors based on inspection
        // Container seems to be an <li> with an <a> inside

        $('li a[href*="/event/"]').each((_, element) => {
            const link = $(element);
            const href = link.attr('href');

            if (!href || !href.match(/\/event\/\d+$/)) return;

            // Selectors based on class names seen in dump
            const title = link.find('dt').text().trim() || link.find('h2').text().trim();
            const date = link.find('dd').first().text().trim().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
            const area = link.find('.o-digest--list-location').text().trim();
            const img = link.find('img').attr('data-src') || link.find('img').attr('src');

            const id = href.split('/').pop();
            // Simple validation
            if (!title || !id) return;
            if (events.find(e => e.id === id)) return;

            const sourceUrl = href.startsWith('http') ? href : `https://www.kagoshima-kankou.com${href}`;

            events.push({
                id,
                title,
                startAt: date, // Keep raw string for now
                area,
                venueName: area,
                imageUrl: img ? (img.startsWith('http') ? img : `https://www.kagoshima-kankou.com${img}`) : null,
                sourceUrl,
                descriptionShort: null // Will be filled in next step
            });
        });

        console.log(`Found ${events.length} events. Fetching details...`);

        // Fetch details for each event
        for (const event of events) {
            console.log(`  Fetching details for: ${event.title}`);
            event.descriptionShort = await fetchEventDetail(event.sourceUrl);
        }

        console.log(`Completed fetching details for ${events.length} events.`);
        console.log(JSON.stringify(events.slice(0, 2), null, 2));

        return events;

    } catch (error) {
        console.error('Error scraping:', error);
        return [];
    }
}

export { scrapeKagoshimaKankou };
