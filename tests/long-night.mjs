import {pathToFileURL} from 'node:url';
import path from 'node:path';
if (!/^127\.0\.0\.1:9000$/.test(process.env.FIREBASE_DATABASE_EMULATOR_HOST || '')) throw Error('Run only with the local database emulator on 127.0.0.1:9000.');
const root = process.env.FIREBASE_SDK_DIR;
if (!root) throw Error('Set FIREBASE_SDK_DIR to an external development installation of the firebase package.');
const sdk = await import(pathToFileURL(path.join(root, 'database/dist/index.mjs')).href);
const app = await import(pathToFileURL(path.join(root, 'app/dist/index.mjs')).href);
const {testLongNight} = await import('./v9.mjs');
const timeout = setTimeout(() => { console.error('Long-night test timed out.'); process.exit(1); }, 45000);
try { await testLongNight(sdk, app); }
finally { clearTimeout(timeout); }
