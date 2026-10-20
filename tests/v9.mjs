import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync('script.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const data = await import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync('game-data.js')).toString('base64'));
const elements = new Map();
function element() {
    return {children: [], handlers: {}, style: {}, dataset: {}, value: '', classList: {add(){},remove(){},toggle(){}},
        append(...nodes){this.children.push(...nodes);}, appendChild(node){this.children.push(node);},
        replaceChildren(...nodes){this.children=nodes;}, addEventListener(event, fn){this.handlers[event]=fn;},
        querySelectorAll(){return [];}, scrollIntoView(){}, setAttribute(){}};
}
for (const [,id] of html.matchAll(/id="([^"]+)"/g)) { assert(!elements.has(id), `Duplicate ID ${id}`); elements.set(id, element()); }
let storedRoom;
const context = vm.createContext({...data, console, alert(message){throw Error(message);},
    document: {getElementById(id){assert(elements.has(id), `Missing DOM ID: ${id}`);return elements.get(id);},createElement:element},
    window:{scrollTo(){},addEventListener(){}},localStorage:{getItem(){return null;},setItem(){}},
    initializeApp(){},getAuth(){return {};},getDatabase(){},ref(db,path){return path;},
    serverTimestamp(){return 123;},
    async runTransaction(path, change) {
        const parts=path.split('/').slice(2); let parent={room:storedRoom}, key='room';
        for(const part of parts){parent=parent[key] ||= {}; key=part;}
        const result=change(structuredClone(parent[key] ?? null));
        if(result === undefined)return {committed:false}; parent[key]=structuredClone(result);
        if(!parts.length) storedRoom=parent[key];
        return {committed:true};
    }
});
vm.runInContext(source.replace(/import\s+[\s\S]*?from\s*"[^"]+";/g,''),context);
const run = code => vm.runInContext(code,context);
const car=data.CAR_LIBRARY[0]; context.car=car;
const mod=car.upgrades.find(u=>u.options.some(o=>o.tier>=3));
const raceOption=mod.options.find(o=>o.tier>=3);
context.mod=mod;context.raceOption=raceOption;
for(const candidate of data.CAR_LIBRARY){
    const garage=Object.fromEntries(candidate.upgrades.map(u=>[u.id,{option:u.options.at(-1).name,tier:u.options.at(-1).tier}]));
    for(let i=0;i<2000;i++){
        const roll=data.getRandomUpgradeRoll(candidate,garage);
        if(roll){ assert(roll.tier>0); assert.notEqual(roll.option,garage[roll.modId]?.option); }
    }
}
for(let count=2;count<=4;count++){
    const room={players:Object.fromEntries(Array.from({length:count},(_,i)=>['u'+i,{name:'Player '+i}]))};context.room=room;
    for(let place=1;place<=count;place++){
        const pack=run(`buildUpgradePackage(car, room, 'u${place-1}', {name:'Player'}, ${place}, 1)`);
        assert.equal(pack.rolls.length,[0,0,1,2,2][place]);assert.equal(pack.keepCount,[0,0,1,1,2][place]);
    }
}
context.pack={uid:'u',keepCount:1,rolls:[{tier:2,outcome:'UPGRADE'},{tier:3,outcome:'SIDEGRADE'}]};
run('currentUserUid="u"; currentPlayerIsHost=true; currentRoomCode="ABCDE";');
function install(pack){storedRoom={hostUid:'u',currentRound:1,gamePhase:'upgrades',upgradeRounds:{round_1:{players:{u:structuredClone(pack)}}}};context.room=storedRoom;run('currentRoomData=room;');}
install(context.pack);
await run('saveUpgradeDecision(0,"apply")');
assert.equal(storedRoom.upgradeRounds.round_1.players.u.decisions.roll_1,'apply');
assert.equal(storedRoom.upgradeRounds.round_1.players.u.decisions.roll_2,'pass');
await run('saveUpgradeDecision(0,"pass")');assert.equal(storedRoom.upgradeRounds.round_1.players.u.decisions.roll_1,'apply');
install({...context.pack});await run('saveUpgradeDecision(0,"pass")');assert.equal(storedRoom.upgradeRounds.round_1.players.u.decisions.roll_2,undefined);
context.auto={keepCount:1,rolls:[{tier:1,outcome:'LOCKED - KEEP'},{tier:2,outcome:'NO CHANGE'}]};assert(run('packageDecisionsReady(auto)'));
// Sequential results cannot downgrade even when both rolls hit the same mod.
context.garage={};const roll={category:mod.category,mod:mod.mod,modId:mod.id,option:raceOption.name,tier:raceOption.tier};context.roll=roll;
assert(run('evaluateRollAgainstGarage(car,garage,roll,1,true).changed'));
context.lower={...roll,tier:1,option:'Street'};assert.equal(run('evaluateRollAgainstGarage(car,garage,lower,1,true).outcome'),'LOCKED - KEEP');assert.equal(context.garage[mod.id].option,raceOption.name);
// Queue remains separate, is immutable, and is consumed exactly on next race.
storedRoom={hostUid:'u',currentRound:1,gamePhase:'upgrades',currentRace:data.RACE_POOL[0],garages:{u:{part:{option:'Race'}}},upgradeRounds:{round_1:{players:{}}}};
context.room=storedRoom;run('currentRoomData=room');await elements.get('queueRaceBtn').handlers.click();
const queued=structuredClone(storedRoom.queuedRace);assert.notEqual(queued.name,data.RACE_POOL[0].name);assert.equal(storedRoom.currentRace.name,data.RACE_POOL[0].name);assert.equal(storedRoom.currentRound,1);
await elements.get('queueRaceBtn').handlers.click();assert.deepEqual(storedRoom.queuedRace,queued);
storedRoom.gamePhase='upgradeComplete';storedRoom.upgradeUndo={round:1,garages:{u:{}}};context.room=storedRoom;run('currentRoomData=room');
await elements.get('undoUpgradesBtn').handlers.click();assert.equal(storedRoom.gamePhase,'upgrades');assert.deepEqual(storedRoom.garages,{u:{}});assert.deepEqual(storedRoom.queuedRace,queued);
storedRoom.gamePhase='upgradeComplete';context.room=storedRoom;run('currentRoomData=room');await elements.get('nextRoundBtn').handlers.click();assert.equal(storedRoom.currentRound,2);assert.deepEqual(storedRoom.currentRace,queued);assert.equal(storedRoom.queuedRace,undefined);assert.equal(storedRoom.upgradeUndo,undefined);
console.log(`PASS: module startup/DOM IDs; ${data.CAR_LIBRARY.length * 2000} reward rolls; 2/3/4-player rewards; locked/automatic decisions; sequential no-downgrade; queue, undo, next race.`);

// Fourth place can lock both choices independently.
install({...context.pack,keepCount:2});await run('saveUpgradeDecision(0,"apply")');await run('saveUpgradeDecision(1,"apply")');
assert.deepEqual(storedRoom.upgradeRounds.round_1.players.u.decisions,{roll_1:'apply',roll_2:'apply'});
// Exercise actual host apply, snapshot, recap counts and undo as a single flow.
const applyPack={uid:'u',name:'Player',keepCount:2,rolls:[{...roll,outcome:'UPGRADE'}, {...roll,tier:1,option:'Street',outcome:'UPGRADE'}],decisions:{roll_1:'apply',roll_2:'apply'}};
install(applyPack);storedRoom.selectedCar={name:car.name};storedRoom.garages={u:{}};context.room=storedRoom;run('currentRoomData=room');
await elements.get('applyUpgradesBtn').handlers.click();assert.equal(storedRoom.gamePhase,'upgradeComplete');assert.equal(storedRoom.garages.u[mod.id].option,raceOption.name);assert.deepEqual(storedRoom.upgradeUndo.garages,{u:{}});
assert.equal(storedRoom.upgradeRounds.round_1.players.u.applied.roll_2.outcome,'LOCKED - KEEP');
context.room=storedRoom;run('currentRoomData=room');await elements.get('undoUpgradesBtn').handlers.click();assert.deepEqual(storedRoom.garages,{u:{}});assert.equal(storedRoom.upgradeRounds.round_1.players.u.decisions,undefined);
// Prius dependency changes preserve chassis and remove incompatible engine parts.
const prius=data.CAR_LIBRARY[2];context.prius=prius;context.pg={};
const find=(mod,variant)=>prius.upgrades.find(u=>u.mod===mod && (variant===undefined || u.variant===variant));
function equip(upgrade,option){const opt=upgrade.options.find(o=>o.name===option);assert(opt);context.upgradeRoll={modId:upgrade.id,mod:upgrade.mod,category:upgrade.category,option:opt.name,tier:opt.tier};return run('evaluateRollAgainstGarage(prius,pg,upgradeRoll,1,true)');}
const stockTurbo=find('Single Turbo','Stock Engine · Single Turbo');assert(!data.isUpgradeEligible(prius,context.pg,stockTurbo));
equip(find('Aspiration','Stock Engine'),'Single Turbo');assert(data.isUpgradeEligible(prius,context.pg,stockTurbo));equip(stockTurbo,'Race Turbo');
const chassis=prius.upgrades.find(u=>!u.requirements.length && u.mod==='Brakes');assert(chassis);equip(chassis,chassis.options.at(-1).name);
const swap=find('Engine Swap');equip(swap,'6.2L V8');assert.equal(context.pg[stockTurbo.id],undefined);assert(context.pg[chassis.id]);
equip(find('Aspiration','6.2L V8'),'Twin Turbos');const twin=find('Twin Turbos','6.2L V8');equip(twin,'Race');
assert.equal(equip(find('Aspiration','6.2L V8'),'Supercharger').outcome,'SIDEGRADE');assert.equal(context.pg[twin.id],undefined);assert(data.isUpgradeEligible(prius,context.pg,find('Supercharger','6.2L V8')));
assert.equal(equip(swap,'3.0L I6 - TT').outcome,'SIDEGRADE');const i6Twin=find('Twin Turbos','3.0L I6 - TT');assert(data.isUpgradeEligible(prius,context.pg,i6Twin));equip(i6Twin,'Race');
equip(find('Aspiration','3.0L I6 - TT'),'Single Turbo');assert.equal(context.pg[i6Twin.id],undefined);assert(data.isUpgradeEligible(prius,context.pg,find('Single Turbo','3.0L I6 - TT')));assert(context.pg[chassis.id]);
console.log('PASS: fourth-place choices; host apply/snapshot/undo; Prius stock turbo, V8 aspiration sidegrade, I6 native/converted turbo, chassis retention.');

// Reconnect and Resume use the existing anonymous UID without room writes.
let writes=0;
context.get=async()=>({exists:()=>!!storedRoom,val:()=>storedRoom});
context.onValue=()=>()=>{};
context.update=async()=>{writes++;};context.set=async()=>{writes++;};
context.signInAnonymously=async()=>({user:{uid:'u'}});
let localCode='ABCDE';context.localStorage={getItem:()=>localCode,setItem:(key,value)=>{localCode=value;}};
storedRoom={hostUid:'u',status:'playing',players:{u:{name:'Returning player',isHost:true}},garages:{u:{intake:{option:'Sport'}}}};
elements.get('playerNameInput').value='Returning player';elements.get('roomCodeInput').value='ABCDE';
await elements.get('joinGameBtn').handlers.click();assert.equal(writes,0);assert.equal(run('currentRoomCode'),'ABCDE');assert(run('currentPlayerIsHost'));assert.equal(storedRoom.garages.u.intake.option,'Sport');
await elements.get('resumeGameBtn').handlers.click();assert.equal(writes,0);assert.equal(run('currentPlayerName'),'Returning player');
storedRoom.players={other:{name:'Someone else'}};await elements.get('joinGameBtn').handlers.click();assert.match(elements.get('homeMessage').textContent,/already started/);assert.equal(writes,0);
// Editing is available before rolls and cannot be reopened after generation.
storedRoom={hostUid:'u',currentRound:1,gamePhase:'results',players:{u:{name:'Player'}},raceHistory:{round_1:{finishOrder:{1:{uid:'u'}}}}};context.room=storedRoom;run('currentRoomData=room; editingResults=false');
elements.get('editResultsBtn').handlers.click();assert(run('editingResults'));
storedRoom.upgradeRounds={round_1:{players:{}}};run('editingResults=false');elements.get('editResultsBtn').handlers.click();assert(!run('editingResults'));
console.log('PASS: existing-player/host reconnect, Resume, no late new players, edit-results cutoff (Firebase mocked).');

// BMW branches must be reachable only with their matching engine/aspiration.
const bmw = data.getCarByName('1988 BMW M3');
assert(bmw);
assert.equal(bmw.startingPI, 'C474');
assert.equal(bmw.upgrades.length, 91);
assert.equal(new Set(bmw.upgrades.map(upgrade => upgrade.id)).size, bmw.upgrades.length);
context.bmw = bmw;
const bmwUpgrade = (mod, variant = '') => {
    const upgrade = bmw.upgrades.find(upgrade => upgrade.mod === mod && upgrade.variant === variant);
    assert(upgrade, `Missing BMW upgrade: ${mod} / ${variant}`);
    return upgrade;
};
const bmwSwap = bmwUpgrade('Engine Swap');
assert.deepEqual(bmwSwap.options.map(option => option.name),
    ['Stock', '1.6L I4 - Turbo Rally', '3.2L I6', '4.0L V8', '5.0L V10', '3.0L I6 - TT']);
function bmwEquip(garage, upgrade, optionName) {
    const option = upgrade.options.find(option => option.name === optionName);
    assert(option, `Missing BMW option: ${upgrade.mod} / ${optionName}`);
    context.bmwGarage = garage;
    context.bmwRoll = {category: upgrade.category, mod: upgrade.mod, modId: upgrade.id,
        option: option.name, tier: option.tier};
    return run('evaluateRollAgainstGarage(bmw, bmwGarage, bmwRoll, 1, true)');
}
const visited = new Set();
for (const engine of bmwSwap.options.map(option => option.name)) {
    const variant = engine === 'Stock' ? 'Stock Engine' : engine;
    const aspiration = bmw.upgrades.find(upgrade => upgrade.mod === 'Aspiration' && upgrade.variant === variant);
    for (const choice of aspiration?.options || [null]) {
        const garage = {};
        if (engine !== 'Stock') assert(bmwEquip(garage, bmwSwap, engine).changed);
        if (choice && choice !== aspiration.options[0]) assert(bmwEquip(garage, aspiration, choice.name).changed);
        for (const upgrade of bmw.upgrades) {
            for (const requirement of upgrade.requirements) {
                const parent = data.getUpgradeById(bmw, requirement.modId);
                assert(parent, `Missing dependency: ${requirement.modId}`);
                assert(requirement.options.every(name => parent.options.some(option => option.name === name)));
            }
            if (data.isUpgradeEligible(bmw, garage, upgrade)) {
                visited.add(upgrade.id);
                if (upgrade.variant) assert.equal(upgrade.variant, variant);
            }
        }
        const forcedInduction = choice && !['NA'].includes(choice.name);
        const intercooler = bmw.upgrades.find(upgrade => upgrade.mod === 'Intercooler' && upgrade.variant === variant);
        if (intercooler) assert.equal(data.isUpgradeEligible(bmw, garage, intercooler), engine === 'Stock' ? !!forcedInduction : true);
        for (const upgrade of bmw.upgrades.filter(upgrade =>
            ['Single Turbo', 'Twin Turbo', 'Twin Turbos', 'Centrifugal Supercharger'].includes(upgrade.mod))) {
            const expected = upgrade.variant === variant &&
                (engine === '1.6L I4 - Turbo Rally' || upgrade.mod === choice?.name);
            assert.equal(data.isUpgradeEligible(bmw, garage, upgrade), expected,
                `${engine} / ${choice?.name}: ${upgrade.mod} / ${upgrade.variant}`);
        }
        for (let i = 0; i < 200; i++) {
            const roll = data.getRandomUpgradeRoll(bmw, garage);
            assert(roll && roll.tier > 0);
            const upgrade = data.getUpgradeById(bmw, roll.modId);
            assert(data.isUpgradeEligible(bmw, garage, upgrade));
            assert.notEqual(roll.option, data.getEffectiveUpgradeOption(bmw, garage, upgrade));
        }
    }
}
assert.equal(visited.size, bmw.upgrades.length, 'Every BMW upgrade must be reachable');
assert.deepEqual(bmwUpgrade('Single Turbo', 'Stock Engine').options.map(option => option.tier), [1, 2, 3]);
assert.deepEqual(bmwUpgrade('Centrifugal Supercharger', '5.0L V10').options.map(option => option.tier), [1, 2, 3]);
assert.equal(data.getStockForUpgrade(bmwUpgrade('Single Turbo', 'Stock Engine')).tier, 0);
assert.deepEqual(bmwUpgrade('Front Tire Width').options.map(option => option.name), ['225', '235', '255', '275', '295']);

const bmwGarage = {};
bmwEquip(bmwGarage, bmwUpgrade('Brakes'), 'Race');
bmwEquip(bmwGarage, bmwUpgrade('Aspiration', 'Stock Engine'), 'Single Turbo');
assert(bmwEquip(bmwGarage, bmwUpgrade('Single Turbo', 'Stock Engine'), 'Street Turbo').changed);
bmwEquip(bmwGarage, bmwUpgrade('Intercooler', 'Stock Engine'), 'Race');
bmwEquip(bmwGarage, bmwSwap, '5.0L V10');
assert.equal(bmwGarage[bmwUpgrade('Single Turbo', 'Stock Engine').id], undefined);
assert.equal(bmwGarage[bmwUpgrade('Intercooler', 'Stock Engine').id], undefined);
assert.equal(bmwGarage[bmwUpgrade('Aspiration', 'Stock Engine').id], undefined);
bmwEquip(bmwGarage, bmwUpgrade('Aspiration', '5.0L V10'), 'Twin Turbo');
bmwEquip(bmwGarage, bmwUpgrade('Twin Turbo', '5.0L V10'), 'Race Turbo');
assert.equal(bmwEquip(bmwGarage, bmwUpgrade('Aspiration', '5.0L V10'), 'Centrifugal Supercharger').outcome, 'SIDEGRADE');
assert.equal(bmwGarage[bmwUpgrade('Twin Turbo', '5.0L V10').id], undefined);
assert(bmwEquip(bmwGarage, bmwUpgrade('Centrifugal Supercharger', '5.0L V10'), 'Street Supercharger').changed);
bmwEquip(bmwGarage, bmwSwap, '3.0L I6 - TT');
bmwEquip(bmwGarage, bmwUpgrade('Twin Turbos', '3.0L I6 - TT'), 'Race');
bmwEquip(bmwGarage, bmwUpgrade('Aspiration', '3.0L I6 - TT'), 'Single Turbo');
assert.equal(bmwGarage[bmwUpgrade('Twin Turbos', '3.0L I6 - TT').id], undefined);
const single = bmwUpgrade('Single Turbo', '3.0L I6 - TT');
bmwEquip(bmwGarage, single, 'Race Turbo');
assert.equal(bmwEquip(bmwGarage, single, 'Street Turbo').outcome, 'LOCKED - KEEP');
assert.equal(bmwGarage[bmwUpgrade('Brakes').id].option, 'Race');

for (let count = 2; count <= 4; count++) {
    context.bmwRewardRoom = {players: Object.fromEntries(Array.from({length: count}, (_, i) => ['u' + i, {name: 'BMW ' + i}]))};
    for (let place = 1; place <= count; place++) {
        const pack = run(`buildUpgradePackage(bmw, bmwRewardRoom, 'u${place - 1}', {name: 'BMW driver'}, ${place}, 1)`);
        assert.equal(pack.rolls.length, [0, 0, 1, 2, 2][place]);
        assert.equal(pack.keepCount, [0, 0, 1, 1, 2][place]);
    }
}
const bmwIntake = bmwUpgrade('Intake', 'Stock Engine');
const bmwRaceIntake = {modId: bmwIntake.id, category: bmwIntake.category, mod: bmwIntake.mod,
    variant: bmwIntake.variant, option: 'Race', tier: 3, outcome: 'UPGRADE'};
install({uid: 'u', name: 'BMW driver', keepCount: 1, rolls: [bmwRaceIntake], decisions: {roll_1: 'apply'}});
storedRoom.selectedCar = {name: bmw.name};
storedRoom.garages = {u: {}};
storedRoom.queuedRace = structuredClone(queued);
context.room = storedRoom;
run('currentRoomData = room');
await elements.get('applyUpgradesBtn').handlers.click();
assert.equal(storedRoom.garages.u[bmwIntake.id].option, 'Race');
context.room = storedRoom;
run('currentRoomData = room');
await elements.get('undoUpgradesBtn').handlers.click();
assert.deepEqual(storedRoom.garages, {u: {}});
assert.deepEqual(storedRoom.queuedRace, queued);
assert.equal(storedRoom.upgradeRounds.round_1.players.u.decisions, undefined);
context.room = storedRoom;
run('currentRoomData = room');
await run('saveUpgradeDecision(0, "apply")');
context.room = storedRoom;
run('currentRoomData = room');
await elements.get('applyUpgradesBtn').handlers.click();
assert.equal(storedRoom.garages.u[bmwIntake.id].option, 'Race');

assert(elements.get('carSelect').children.some(option => option.value === bmw.name));
context.bmwRoom = {selectedCar: {name: bmw.name}, players: {u: {name: 'BMW driver'}}, garages: {u: bmwGarage}};
run('renderBuildComparison(bmwRoom)');
const comparison = elements.get('buildComparisonTable').children.at(-1);
const buildRows = comparison.children.at(-1).children;
assert(buildRows.some(row => row.children[0].textContent === 'Single Turbo · 3.0L I6 - TT' && row.children[2].textContent === 'Race Turbo'));
assert(!buildRows.some(row => row.children[0].textContent === 'Intake · 5.0L V10'));
assert(buildRows.some(row => row.children[0].textContent === 'Brakes' && row.children[2].textContent === 'Race'));
console.log('PASS: BMW selector, all engine/aspiration branches, dependency reachability, eligible rewards, implicit bases, engine/aspiration pruning, no downgrade, 2/3/4-player rewards, apply/undo/reapply, Build Comparison (DOM/Firebase mocked).');

