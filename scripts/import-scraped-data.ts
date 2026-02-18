import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { scrapeKagoshimaKankou } from './scrapers/kagoshima-kankou';
import { scrapeWalkerplus } from './scrapers/walkerplus';
import * as dotenv from 'dotenv';
dotenv.config();

async function importData() {
    console.log('Starting data import...');

    // 1. Initialize Firebase (Check for credentials)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    let db: FirebaseFirestore.Firestore | null = null;

    if (projectId && clientEmail && privateKey) {
        try {
            const app = initializeApp({
                credential: cert({ projectId, clientEmail, privateKey }),
            });
            db = getFirestore(app);
            console.log('Connected to Firestore.');
        } catch (e) {
            console.error('Failed to initialize Firebase:', e);
        }
    } else {
        console.warn('⚠️ Firebase credentials not found in .env');
        console.warn('   Running in DRY RUN mode (fetching data only, not saving).');
    }

    // 2. Run Scrapers
    console.log('\n--- Scraping Kagoshima Kankou ---');
    const events1 = await scrapeKagoshimaKankou();

    console.log('\n--- Scraping Walkerplus ---');
    const events2 = await scrapeWalkerplus();

    let allEvents = [...events1, ...events2];

    // SAFETY LIMIT: Max 200 events to cover monthly events
    const LIMIT = 200;
    if (allEvents.length > LIMIT) {
        console.log(`\n[SAFETY LIMIT] Truncating from ${allEvents.length} to ${LIMIT} events.`);
        allEvents = allEvents.slice(0, LIMIT);
    }

    console.log(`\nTotal events to process: ${allEvents.length}`);

    // 3. Import to Firestore
    if (db) {
        console.log('\n--- saving to Firestore ---');
        const batch = db.batch();
        let count = 0;

        for (const event of allEvents) {
            // Use event ID as document ID
            const docRef = db.collection('events').doc(event.id);
            // set({ ... }, { merge: true }) allows updating existing docs without overwriting everything
            batch.set(docRef, {
                ...event,
                updatedAt: new Date().toISOString(),
                status: 'PUBLISHED' // Default status
            }, { merge: true });
            count++;
        }

        await batch.commit();
        console.log(`Successfully saved ${count} events to Firestore.`);
    } else {
        console.log('\n[Dry Run Result] These events would be saved:');
        console.log(allEvents.map(e => `- ${e.title} (${e.startAt})`).join('\n'));
    }
}

importData();
