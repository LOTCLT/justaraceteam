import assert from 'node:assert/strict';
import {loadModule} from './load-module.mjs';
const data = await loadModule('game-data.js');
const {draftFromCar, validateCar, findUpgradeOverlaps} = await loadModule('car-import.js');
const car = data.getCarByName('2020 Chevrolet Corvette Stingray Coupe');
assert(car); assert.equal(car.startingPI, 'A699'); assert.equal(car.upgrades.length, 108);
assert.deepEqual(validateCar(draftFromCar(car)).errors, []);
assert.deepEqual(findUpgradeOverlaps(draftFromCar(car)), []);
const upgrade = (mod, variant) => {
    const result = car.upgrades.find(row => row.mod === mod && row.variant === variant);
    assert(result, `${mod} / ${variant}`); return result;
};
const engineSwap = upgrade('Engine Swap', '');
assert.equal(upgrade('Drivetrain Swap', '').baseOption.name, 'RWD');
const visited = new Set(); let contexts = 0;
for (const engine of engineSwap.options) {
    const variant = engine.name === 'Stock' ? 'Stock Engine' : engine.name;
    const aspiration = upgrade('Aspiration', variant);
    for (const option of aspiration.options) {
        contexts++;
        const garage = {[engineSwap.id]: {option: engine.name, tier: engine.tier}, [aspiration.id]: {option: option.name, tier: option.tier}};
        const eligible = car.upgrades.filter(row => data.isUpgradeEligible(car, garage, row));
        const physicalMods = eligible.map(row => `${row.category}/${row.mod}`);
        assert.equal(new Set(physicalMods).size, physicalMods.length, `${variant} / ${option.name}: duplicate physical part`);
        eligible.forEach(row => visited.add(row.id));
        for (let i = 0; i < 300; i++) {
            const roll = data.getRandomUpgradeRoll(car, garage);
            assert(roll.tier > 0);
            assert(data.isUpgradeEligible(car, garage, data.getUpgradeById(car, roll.modId)));
            assert.notEqual(roll.option, data.getEffectiveUpgradeOption(car, garage, data.getUpgradeById(car, roll.modId)));
        }
        if (option.name === 'Twin Turbo' && ['6.2 V8 - DSC', '6.2L V8-PDSC'].includes(engine.name)) {
            assert(!eligible.some(row => row.mod === 'Supercharger'), 'Native supercharger cannot remain available after turbo conversion');
        }
    }
}
assert.equal(contexts, 20);
assert.equal(visited.size, car.upgrades.length, 'Every Corvette row must be reachable');
for (const [mod, prefix] of [['Supercharger', '8.4 V10'], ['Centrifugal Supercharger', '8.4 V10'], ['Twin Turbos', '5.5L V8']]) {
    const row = car.upgrades.find(row => row.mod === mod && row.variant.startsWith(prefix));
    assert(row.baseOption.implicit && row.baseOption.tier === 0);
    assert(row.options.every(option => option.tier > 0));
}
const garage = {};
const intake = upgrade('Intake', 'Stock Engine'), aspiration = upgrade('Aspiration', 'Stock Engine');
garage[intake.id] = {option: 'Race', tier: 3};
garage[aspiration.id] = {option: 'Twin Turbo', tier: 1};
data.pruneIncompatibleGarage(car, garage);
assert.equal(garage[intake.id].option, 'Race', 'An unchanged Intake must survive aspiration conversion');
const turbo = car.upgrades.find(row => row.mod === 'Twin Turbos' && row.variant.startsWith('Stock Engine'));
garage[turbo.id] = {option: 'Race', tier: 3};
garage[aspiration.id] = {option: 'Positive Displacement SuperCharger', tier: 1};
data.pruneIncompatibleGarage(car, garage);
assert.equal(garage[turbo.id], undefined);
assert.equal(garage[intake.id].option, 'Race');
console.log('PASS: Corvette RWD/A699, 108 reachable rows, 20 engine/aspiration states, 6,000 valid rewards, no overlapping parts, implicit bases and retained shared parts across conversions.');
