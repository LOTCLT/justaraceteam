import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { getDatabase, ref, push, set, get, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js?v=1';
import { communityDefinition } from './community-data.js?v=1';

// One submission gets one stable ID. Retrying a failed request cannot duplicate it.
export async function submitCommunityCar(draft, previousId) {
    const definition = communityDefinition(draft);
    const app = getApps()[0] || initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await auth.authStateReady();
    const user = auth.currentUser || (await signInAnonymously(auth)).user;
    const database = getDatabase(app);
    const destination = previousId ? ref(database, 'communityCars/' + previousId) : push(ref(database, 'communityCars'));
    const record = {name: draft.name, startingPI: draft.startingPI.toUpperCase(), definition,
        ownerUid: user.uid, createdAt: serverTimestamp(), status: 'community'};
    try {
        if (previousId) {
            const existing = (await get(destination)).val();
            if (existing?.ownerUid === user.uid && existing.definition === definition) return destination.key;
        }
        let timer;
        try {
            await Promise.race([set(destination, record), new Promise((_, reject) => {
                timer = setTimeout(() => reject(Error('The connection is taking too long. Retrying will check the same submission.')), 15000);
            })]);
        } finally { clearTimeout(timer); }
    }
    catch (error) { error.submissionId = destination.key; throw error; }
    return destination.key;
}
