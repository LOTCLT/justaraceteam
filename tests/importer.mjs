import assert from 'node:assert/strict';
import { loadModule } from './load-module.mjs';
const {CAR_LIBRARY, isUpgradeEligible, getRandomUpgradeRoll} = await loadModule('game-data.js');
const {draftFromCar, readCarFile, validateCar, exportCar, parseDelimited, draftFromSheets, CSV_TEMPLATE} = await loadModule('car-import.js');
const {communityDefinition, communityCarFromDefinition, communityCarFromRecord} = await loadModule('community-data.js');
for (const car of CAR_LIBRARY) {
    const draft = draftFromCar(car);
    assert.deepEqual(validateCar(draft).errors, [], car.name);
    assert.deepEqual(validateCar(readCarFile(exportCar(draft))).car, car);
}
const car = draftFromCar(CAR_LIBRARY.at(-1));
car.name = '1988 BMW M3 Test';
const definition = communityDefinition(car);
const shared = communityCarFromRecord('test-id', {name: car.name, startingPI: car.startingPI, ownerUid: 'test-user', createdAt: 123, status: 'community', definition});
assert.equal(shared.communityId, 'test-id');
for (let i = 0; i < 1000; i++) {
    const roll = getRandomUpgradeRoll(shared, {});
    assert(roll.tier > 0);
    assert(isUpgradeEligible(shared, {}, shared.upgrades.find(upgrade => upgrade.id === roll.modId)));
}
const invalid = mutate => {
    const changed = structuredClone(car); mutate(changed);
    assert(validateCar(changed).errors.length > 0);
    assert.throws(() => communityDefinition(changed));
};
invalid(car => { car.startingPI = '474'; });
invalid(car => { car.upgrades.push(structuredClone(car.upgrades[0])); });
invalid(car => { car.upgrades[0].options = ['Stock', 'Stock']; });
invalid(car => { car.upgrades[0].options = ['Sport', 'Race']; });
invalid(car => { car.upgrades[0].requires[0].options = ['Missing motor']; });
invalid(car => { car.upgrades[0].requires[0].mod = 'Missing upgrade'; });
invalid(car => { car.upgrades[0].requires = [{category: car.upgrades[0].category, mod: car.upgrades[0].mod, variant: car.upgrades[0].variant, options: ['Stock']}]; });
invalid(car => { car.upgrades[0].requires.push({...car.upgrades[0].requires[0], options: ['4.0L V8']}); });
assert.throws(() => readCarFile('{"schemaVersion":99,"upgrades":[]}'));
assert.throws(() => readCarFile('{"schemaVersion":1,"name":"Bad","startingPI":"C474","upgrades":[null]}'));
assert.throws(() => communityCarFromDefinition('x'.repeat(96001), 'bad'));
assert.throws(() => communityCarFromDefinition(exportCar(draftFromCar(CAR_LIBRARY[0])), 'collision'));
assert.throws(() => communityCarFromRecord('bad', {...shared, status: 'community', name: 'Different', ownerUid: 'test', createdAt: 123}));
const csv = draftFromSheets([{name: 'Template', rows: parseDelimited(CSV_TEMPLATE)}]);
assert.deepEqual(validateCar(csv.draft).errors, []);
assert.deepEqual(parseDelimited('Category,Mod,Option 1,Option 2\r\nEngine,"Intake, special",Stock,"Race ""special"""'),
    [['Category','Mod','Option 1','Option 2'],['Engine','Intake, special','Stock','Race "special"']]);
assert.deepEqual(parseDelimited('Category\tMod\nEngine\t"A\nB"'), [['Category', 'Mod'], ['Engine', 'A\nB']]);
assert.throws(() => parseDelimited('Category,Mod\nEngine,"Not closed'));
const incomplete = draftFromSheets([{name: 'Legacy', rows: [
    ['Car Name','Example'],['Starting PI','C474'],['Category','', 'Mod','Option 1','Option 2'],
    ['Stock Engine','Requires Aspiration Conversion','Single Turbo','Street','Race']
]}]);
assert(incomplete.warnings.some(warning => warning.includes('implicit base')));
assert(validateCar(incomplete.draft).errors.some(message => message.includes('missing')));
console.log('PASS: four-car export/import round trips, 1,000 shared-car rewards, invalid/duplicate/cyclic/conflicting prerequisites, tier/base guards, name protection, file bounds, CSV/TSV quoting and template, missing legacy conversions.');
