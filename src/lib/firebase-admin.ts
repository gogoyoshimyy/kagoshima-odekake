import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let db: Firestore | null = null;

if (projectId && clientEmail && privateKey) {
    if (!getApps().length) {
        console.log('Initialize Firebase App with project:', projectId);
        const firebaseConfig = {
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            } as ServiceAccount),
            projectId: projectId,
        };
        initializeApp(firebaseConfig);
    }
    db = getFirestore();
    console.log('Firestore initialized.');
} else {
    // In development or build environments without credentials, we leave db as null
    // This allows API routes to check for db existence and return empty data/errors 
    // instead of crashing or timing out trying to connect with invalid config.
    console.warn("Firebase credentials missing:", {
        hasProject: !!projectId,
        hasEmail: !!clientEmail,
        hasKey: !!privateKey
    });
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Firebase credentials missing. DB will be null.");
    }
}

export { db };
