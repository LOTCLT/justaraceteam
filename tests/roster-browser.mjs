import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright-core');
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox']});
const base = process.env.ROSTER_TEST_URL || 'http://127.0.0.1:8012';
const source = await fs.readFile(new URL('../script.js', import.meta.url), 'utf8');
const room = {hostUid: 'u', status: 'playing', gamePhase: 'racing', currentRound: 2,
    selectedCar: {name: '1988 BMW M3', startingPI: 'C474'},
    currentRace: {name: 'Test Road', type: 'Road', distance: '4 km'},
    players: {u: {name: 'Host', isHost: true}, g1: {name: 'Guest One', isHost: false}, g2: {name: 'Guest Two', isHost: false}},
    raceHistory: {round_1: {finishOrder: {1: {uid: 'g1', name: 'Guest One'}, 2: {uid: 'u', name: 'Host'}, 3: {uid: 'g2', name: 'Guest Two'}}}}};
const errors = [];
async function client(uid, width, initialRoom = room) {
    const page = await browser.newPage({viewport: {width, height: 900}});
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.addInitScript(({uid, initialRoom}) => { window.__uid = uid; window.__room = initialRoom; }, {uid, initialRoom});
    await page.route('https://www.gstatic.com/firebasejs/**', route => {
        const url = route.request().url();
        const body = url.includes('firebase-app') ? 'export const initializeApp=()=>({});' :
            url.includes('firebase-auth') ? 'export const getAuth=()=>({currentUser:{uid:window.__uid}});export const signInAnonymously=async()=>({user:{uid:window.__uid}});' : `
            const snap=()=>({exists:()=>true,val:()=>structuredClone(window.__room)});
            export const getDatabase=()=>({}), ref=(db,path)=>path, get=async()=>snap(), serverTimestamp=()=>123;
            export const set=async()=>{},update=async()=>{},remove=async()=>{},query=x=>x,orderByChild=x=>x,limitToLast=x=>x;
            export function onValue(path,fn){window.__notify=()=>fn(snap());queueMicrotask(window.__notify);return()=>{window.__notify=null;};}
            export async function runTransaction(path,fn){const result=fn(structuredClone(window.__room));if(result===undefined)return{committed:false};window.__room=result;window.__notify?.();return{committed:true};}`;
        return route.fulfill({contentType: 'text/javascript', body});
    });
    await page.route('**/script.js?*', route => route.fulfill({contentType: 'text/javascript', body: source + `
        window.__rosterTest={start(){currentUserUid=window.__uid;showLobby('TEST1','Tester',window.__uid==='u');},receive(room){window.__room=room;window.__notify?.();}};`}));
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => !!window.__rosterTest);
    await page.evaluate(() => window.__rosterTest.start());
    return page;
}
try {
    const host = await client('u', 390), guest = await client('g1', 390);
    assert(await host.locator('#editGameRosterBtn').isVisible());
    assert(!(await guest.locator('#editGameRosterBtn').isVisible()));
    await host.locator('#editGameRosterBtn').click();
    assert(await host.locator('#rosterDialog').isVisible());
    assert.equal(await host.locator('#rosterPlayerList button').count(), 2);
    assert.equal(await host.getByRole('button', {name: 'Remove Host from the roster'}).count(), 0);
    assert(await host.locator('#rosterDialog').evaluate(el => el.getBoundingClientRect().right <= innerWidth));
    await host.getByRole('button', {name: 'Remove Guest One from the roster'}).click();
    await host.waitForFunction(() => !window.__room.players.g1);
    const after = await host.evaluate(() => window.__room);
    assert.equal(after.status, 'playing'); assert.equal(after.currentRound, 2);
    assert(after.players.u && after.players.g2 && after.departedPlayers.g1);
    assert.deepEqual(after.raceHistory, room.raceHistory);
    await guest.evaluate(value => window.__rosterTest.receive(value), after);
    assert(await guest.locator('#homeScreen').isVisible());
    assert.match(await guest.locator('#homeMessage').textContent(), /no longer on this room/);
    assert.equal(await host.locator('#rosterPlayerList button').count(), 1);
    await host.screenshot({path: '/workspace/scratch/roster-phone.png'});
    await host.locator('#closeRosterBtn').click();
    assert(!(await host.locator('#rosterDialog').isVisible()));
    const lobby = await client('u', 1440, {...room, status: 'lobby'});
    await lobby.locator('#editLobbyRosterBtn').click();
    assert.equal(await lobby.locator('#rosterPlayerList button').count(), 2);
    assert.deepEqual(errors, []);
    console.log('PASS: Chromium in-game and lobby Edit Roster, host-only controls, phone dialog, protected host, confirmed removal, preserved history, guest exit and Done navigation (Firebase mocked).');
} finally { await browser.close(); }
