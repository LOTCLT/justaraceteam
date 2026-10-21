import { buildCar, CAR_LIBRARY } from './game-data.js?v=10';

export const CATEGORIES = ['Engine', 'Platform and Handling', 'Drivetrain', 'Tires and Rims', 'Aero and Appearance', 'Body Kits and Conversions'];
export const emptyUpgrade = () => ({category: 'Engine', mod: '', variant: '', options: ['Stock', 'Street', 'Sport', 'Race'], requires: []});
export const emptyCar = () => ({schemaVersion: 1, name: '', startingPI: '', upgrades: []});
const text = value => String(value ?? '').trim();
const same = (a, b) => text(a).toLowerCase() === text(b).toLowerCase();
const key = row => [row.category, row.mod, row.variant || ''].filter(Boolean).join('__').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const list = value => text(value).split('|').map(text).filter(value => value && value !== '-');

// Export raw definitions so imports continue using the game's tier/dependency rules.
export function draftFromCar(car) {
    return {schemaVersion: 1, name: car.name, startingPI: car.startingPI, upgrades: car.upgrades.map(upgrade => ({
        category: upgrade.category, mod: upgrade.mod, variant: upgrade.variant,
        options: upgrade.options.map(option => option.name),
        ...(upgrade.baseOption.implicit ? {implicitBase: upgrade.baseOption.name} : {}),
        requires: upgrade.requirements.map(requirement => {
            const parent = car.upgrades.find(row => row.id === requirement.modId);
            return {category: parent.category, mod: parent.mod, variant: parent.variant, options: [...requirement.options]};
        })
    }))};
}

export function readCarFile(source) {
    const value = JSON.parse(source);
    if (!value || value.schemaVersion !== 1 || !Array.isArray(value.upgrades)) {
        throw Error('This is not a version 1 car file. Upload an exported car JSON file.');
    }
    if (value.upgrades.length > 400) throw Error('A car can contain at most 400 upgrade rows.');
    const str = value => {
        if (typeof value !== 'string' || value.length > 200) throw Error('Car fields must be text of 200 characters or fewer.');
        return value.trim();
    };
    const strings = values => {
        if (!Array.isArray(values) || values.length > 40) throw Error('Use at most 40 options per upgrade.');
        return values.map(str);
    };
    const bases = value.aspirationBases || [];
    if (!Array.isArray(bases) || bases.length > 40) throw Error('Use at most 40 motor base-aspiration entries.');
    return {schemaVersion: 1, name: str(value.name), startingPI: str(value.startingPI),
        ...(bases.length ? {aspirationBases: bases.map(base => ({motor: str(base.motor), aspiration: str(base.aspiration)}))} : {}),
        upgrades: value.upgrades.map(row => {
        if (!row || !Array.isArray(row.requires || []) || (row.requires || []).length > 10) throw Error('Invalid upgrade dependencies.');
        return {category: str(row.category), mod: str(row.mod), variant: str(row.variant || ''), options: strings(row.options),
            ...(row.implicitBase ? {implicitBase: str(row.implicitBase)} : {}),
            requires: (row.requires || []).map(req => ({category: str(req.category), mod: str(req.mod), variant: str(req.variant || ''), options: strings(req.options)}))};
    })};
}

export function validateCar(draft) {
    const errors = [], warnings = [];
    if (!text(draft.name) || draft.name.length > 120) errors.push('Enter a car name of 1–120 characters, including the model year.');
    if (!/^(D|C|B|A|S1|S2|X)\d{3}$/i.test(text(draft.startingPI))) errors.push('Starting PI must include a class and three digits, such as C474 or S1900.');
    if (!draft.upgrades.length || draft.upgrades.length > 400) errors.push('Add between 1 and 400 upgrade rows.');
    if (CAR_LIBRARY.some(car => same(car.name, draft.name))) warnings.push('This car name already exists in the shared lineup. Review this as an update, not a second car.');
    const rows = new Map();
    draft.upgrades.forEach((row, index) => {
        const label = `Row ${index + 1} (${row.mod || 'unnamed upgrade'})`;
        if (!CATEGORIES.includes(row.category)) errors.push(`${label}: choose a supported category.`);
        if (!row.mod || row.mod.length > 120 || (row.variant || '').length > 120) errors.push(`${label}: enter a mod name and keep names/variants under 120 characters.`);
        if (rows.has(key(row))) errors.push(`${label}: duplicate category, mod and variant. Give separate engine trees distinct variants.`);
        rows.set(key(row), row);
        if (row.options.length > 40 || row.options.some(option => !text(option) || option.length > 200 || option === '-')) errors.push(`${label}: use 1–40 nonempty option names; omit dashes.`);
        if (new Set(row.options.map(option => option.toLowerCase())).size !== row.options.length) errors.push(`${label}: duplicate option names.`);
        if (row.options.length < (row.implicitBase ? 1 : 2)) errors.push(`${label}: include a base plus an upgrade, or specify an implicit base for a row without a Stock option.`);
        if (row.implicitBase && (row.implicitBase.length > 200 || row.options.some(option => same(option, row.implicitBase)))) errors.push(`${label}: the implicit base must be distinct from the reward options.`);
        if ((row.requires || []).length > 10) errors.push(`${label}: use no more than 10 prerequisites.`);
        if (row.variant && !row.requires?.length) warnings.push(`${label}: a variant label alone does not restrict availability. Add an engine/aspiration prerequisite if needed.`);
    });
    const built = buildCar(draft.name, draft.startingPI, draft.upgrades);
    draft.upgrades.forEach((row, index) => {
        const label = `Row ${index + 1} (${row.mod || 'unnamed upgrade'})`;
        for (const req of row.requires || []) {
            const parent = rows.get(key(req));
            if (!parent) { errors.push(`${label}: prerequisite ${req.mod} / ${req.variant || 'no variant'} is missing.`); continue; }
            if (!req.options.length || req.options.some(option => !parent.options.some(value => same(value, option)) && !same(parent.implicitBase || '', option))) {
                errors.push(`${label}: prerequisite options must match options on ${req.mod} / ${req.variant || 'no variant'}.`);
            }
        }
        const upgrade = built.upgrades.find(upgrade => upgrade.id === key(row));
        if (upgrade && !upgrade.baseOption.implicit && upgrade.baseOption.tier > 0) {
            errors.push(`${label}: the first option is an upgrade tier. Specify an implicit base if the game has no visible Stock option.`);
        }
        if (row.implicitBase && upgrade?.options.some(option => option.tier === 0)) errors.push(`${label}: reward options must have positive tiers when using an implicit base.`);
        if (upgrade && !upgrade.options.some(option => option.tier > 0)) errors.push(`${label}: there are no non-stock reward options.`);
        const engine = draft.upgrades.find(other => other.mod === 'Engine Swap');
        if (engine && row.category === 'Engine' && !row.requires?.length) warnings.push(`${label}: engine swaps exist, but this row is available with every engine. Check whether it belongs to a specific engine.`);
    });
    const visiting = new Set(), visited = new Set();
    function visit(row) {
        const id = key(row);
        if (visiting.has(id)) { errors.push(`Circular dependency involving ${row.mod} / ${row.variant || 'no variant'}.`); return; }
        if (visited.has(id)) return;
        visiting.add(id);
        for (const req of row.requires || []) if (rows.has(key(req))) visit(rows.get(key(req)));
        visiting.delete(id); visited.add(id);
    }
    draft.upgrades.forEach(visit);
    if (!errors.some(message => message.startsWith('Circular'))) {
        for (const row of draft.upgrades) {
            const constraints = new Map();
            function requireOptions(dependent, seen = new Set()) {
                if (seen.has(key(dependent))) return;
                seen.add(key(dependent));
                for (const req of dependent.requires || []) {
                    const id = key(req), allowed = req.options.map(option => option.toLowerCase());
                    const previous = constraints.get(id);
                    constraints.set(id, previous ? previous.filter(option => allowed.includes(option)) : allowed);
                    if (rows.has(id)) requireOptions(rows.get(id), seen);
                }
            }
            requireOptions(row);
            if ([...constraints.values()].some(options => !options.length)) errors.push(`${row.mod} / ${row.variant || 'no variant'} has conflicting prerequisites and cannot become available.`);
        }
    }
    return {errors: [...new Set(errors)], warnings: [...new Set(warnings)], car: built};
}

export function exportCar(draft) {
    const result = validateCar(draft);
    if (result.errors.length) throw Error('Fix the listed issues before downloading the car.');
    // Round-tripping strips UI state, preserves all prerequisite identities and normalizes PI.
    return JSON.stringify(readCarFile(JSON.stringify({...draft, startingPI: text(draft.startingPI).toUpperCase()})), null, 2) + '\n';
}

// Quoted CSV and tab-separated exports from Excel; quoted newlines are preserved.
export function parseDelimited(source) {
    source = source.replace(/^\uFEFF/, '');
    const delimiter = source.split(/\r?\n/, 1)[0].includes('\t') ? '\t' : ',';
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < source.length; i++) {
        const ch = source[i];
        if (ch === '"') {
            if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
            else if (quoted || cell === '') quoted = !quoted;
            else cell += ch;
        } else if (!quoted && (ch === delimiter || ch === '\n' || ch === '\r')) {
            row.push(cell); cell = '';
            if (ch !== delimiter) { rows.push(row); row = []; if (ch === '\r' && source[i + 1] === '\n') i++; }
        } else cell += ch;
    }
    if (quoted) throw Error('A quoted spreadsheet cell is not closed.');
    if (cell || row.length) { row.push(cell); rows.push(row); }
    if (rows.length > 2000 || rows.some(row => row.length > 80)) throw Error('The sheet is too large. Use at most 2,000 rows and 80 columns.');
    return rows;
}

// Supports the original car template and its engine-labelled dependency tab.
// Missing conversion menus remain errors: the importer never invents Forza trees.
export function draftFromSheets(sheets) {
    const draft = emptyCar(), warnings = [];
    const conversion = 'Body Kits and Conversions';
    const normalize = value => text(value).replace(/^race$/i, 'Race').replace(/Cetnrifugal/gi, 'Centrifugal');
    for (const sheet of sheets) {
        const headerIndex = sheet.rows.findIndex(row => row.some(cell => same(cell, 'Category')) && row.some(cell => same(cell, 'Mod')));
        if (headerIndex < 0) { warnings.push(`${sheet.name}: no Category/Mod header found; no upgrades imported.`); continue; }
        for (const row of sheet.rows.slice(0, headerIndex)) {
            if (same(row[0], 'Car Name')) draft.name = text(row[1]);
            if (same(row[0], 'Starting PI')) draft.startingPI = text(row[1]).toUpperCase();
        }
        const header = sheet.rows[headerIndex].map(text);
        const col = name => header.findIndex(cell => same(cell, name));
        const get = (row, name) => col(name) < 0 ? '' : text(row[col(name)]);
        const optionCols = header.flatMap((name, index) => /^option\s+\d+/i.test(name) ? [index] : []);
        if (!optionCols.length) throw Error(`${sheet.name}: include Option 1, Option 2, etc. columns.`);
        for (const [offset, cells] of sheet.rows.slice(headerIndex + 1).entries()) {
            const mod = normalize(get(cells, 'Mod'));
            if (!mod) continue;
            let category = get(cells, 'Category'), variant = get(cells, 'Variant');
            let engine = '';
            if (same(category, 'Stock Engine')) { category = 'Engine'; engine = 'Stock'; }
            else if (/^(?:Body Kits and Conversions - )?Engine\s+/i.test(category)) {
                engine = category.replace(/^(?:Body Kits and Conversions - )?Engine\s+/i, ''); category = mod === 'Aspiration' ? conversion : 'Engine';
            }
            if (engine) variant = engine === 'Stock' ? 'Stock Engine' : engine;
            const options = optionCols.map(index => normalize(cells[index])).filter(option => option && option !== '-');
            const row = {category, mod, variant, options, requires: []};
            const implicit = get(cells, 'Implicit Base');
            if (implicit) row.implicitBase = implicit;
            else if (options[0] && /^(Street|Sport|Race)(\b|:)/i.test(options[0])) {
                row.implicitBase = `Base ${mod}`;
                warnings.push(`${sheet.name} row ${headerIndex + offset + 2}: ${mod} starts with an upgrade. An implicit base was added; check that this matches the game.`);
            }
            if (engine) row.requires.push({category: conversion, mod: 'Engine Swap', variant: '', options: [engine]});
            const requiresMod = get(cells, 'Requires Mod');
            if (requiresMod) row.requires.push({category: get(cells, 'Requires Category') || conversion, mod: requiresMod,
                variant: get(cells, 'Requires Variant'), options: list(get(cells, 'Requires Option(s)'))});
            if (cells.some(cell => same(cell, 'Requires Aspiration Conversion'))) {
                const aspiration = mod === 'Intercooler' ? 'Single Turbo' : mod;
                row.requires.push({category: conversion, mod: 'Aspiration', variant, options: [aspiration]});
                if (mod === 'Intercooler') warnings.push(`${sheet.name}: Intercooler was linked to Single Turbo from its legacy marker. Review this prerequisite.`);
            }
            const existing = draft.upgrades.find(other => same(other.category, row.category) && same(other.mod, row.mod) && same(other.variant, row.variant));
            if (existing && JSON.stringify(existing) === JSON.stringify(row)) {
                warnings.push(`${sheet.name}: repeated identical ${mod} row was included once.`);
            } else draft.upgrades.push(row);
        }
    }
    const engineSwap = draft.upgrades.find(row => row.mod === 'Engine Swap');
    if (engineSwap) {
        const baseEngine = engineSwap.options[0];
        for (const row of draft.upgrades) {
            if ((row.category === 'Engine' || row.mod === 'Aspiration') && !row.variant && !row.requires.length) {
                row.variant = 'Stock Engine';
                row.requires.push({category: conversion, mod: 'Engine Swap', variant: '', options: [baseEngine]});
            }
        }
        warnings.push('Rows in the main engine tree were assigned to the stock engine. Review each engine/variant and prerequisite.');
    }
    if (draft.upgrades.length > 400) throw Error('A car can contain at most 400 upgrade rows.');
    return {draft, warnings};
}

export const CSV_TEMPLATE = 'Car Name,2024 Example Car\nStarting PI,C474\n\nCategory,Mod,Variant,Option 1,Option 2,Option 3,Option 4,Requires Category,Requires Mod,Requires Variant,Requires Option(s),Implicit Base\nEngine,Intake,Stock Engine,Stock,Street,Sport,Race,Body Kits and Conversions,Engine Swap,,Stock,\nPlatform and Handling,Brakes,,Stock,Street,Sport,Race,,,,,\nBody Kits and Conversions,Engine Swap,,Stock,Example engine,,,,,,,\nEngine,Single Turbo,Stock Engine,Street Turbo,Sport Turbo,Race Turbo,,Body Kits and Conversions,Aspiration,Stock Engine,Single Turbo,Base Single Turbo\nBody Kits and Conversions,Aspiration,Stock Engine,NA,Single Turbo,,,Body Kits and Conversions,Engine Swap,,Stock,\n';
