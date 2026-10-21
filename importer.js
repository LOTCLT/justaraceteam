import { CAR_LIBRARY } from './game-data.js?v=10';
import { CATEGORIES, emptyCar, emptyUpgrade, draftFromCar, readCarFile, validateCar, exportCar, parseDelimited, draftFromSheets, CSV_TEMPLATE } from './car-import.js?v=1';
import { readWorkbook } from './spreadsheet.js?v=1';
import { communityDefinition } from './community-data.js?v=1';

const $ = id => document.getElementById(id);
const conversion = 'Body Kits and Conversions';
let draft = emptyCar(), notices = [], workbook = [], dirty = false;
let submissionId = null, publishing = false, published = false;
let draftStored = false;
function saveLocalDraft() {
    try {
        localStorage.setItem('jart:carImporterDraft', JSON.stringify({draft, submissionId, published}));
        draftStored = true; $('draftStorageStatus').textContent = 'Draft saved in this browser. You can come back to finish it. Download a backup to keep it across devices.';
    } catch {
        draftStored = false; $('draftStorageStatus').textContent = 'This browser could not save the draft. Use Save unfinished draft before leaving.';
    }
}
const catalog = [
    ['Engine', ['Intake', 'Intake Manifold / Throttle Body', 'Fuel System', 'Ignition', 'Exhaust', 'Camshaft', 'Valves', 'Displacement', 'Piston / Compression', 'Oil / Cooling', 'Flywheel', 'Single Turbo', 'Twin Turbos', 'Supercharger', 'Centrifugal Supercharger', 'Intercooler', 'Restrictor Plate']],
    ['Platform and Handling', ['Brakes', 'Springs and Dampers', 'Front Anti-Roll Bars', 'Rear Anti-Roll Bars', 'Chassis Reinforcement / Roll Cage', 'Weight Reduction']],
    ['Drivetrain', ['Clutch', 'Transmission', 'Driveline', 'Differential']],
    ['Tires and Rims', ['Tire Compound', 'Front Tire Width', 'Rear Tire Width', 'Wheel Style', 'Wheel Size']],
    ['Aero and Appearance', ['Front Bumper', 'Rear Bumper', 'Rear Wing', 'Hood', 'Side Skirts']],
    [conversion, ['Drivetrain Swap', 'Body Kit']]
];
function choices(mod) {
    if (mod === 'Springs and Dampers') return ['Stock', 'Street', 'Sport', 'Race', 'Rally', 'Drift'];
    if (mod === 'Transmission') return ['Stock', 'Street', 'Sport', 'Race', 'Race: 7 Speed', 'Race: 8 Speed', 'Race: 9 Speed', 'Race: 10 Speed', 'Drift: 4 Speed'];
    if (mod === 'Differential') return ['Stock', 'Street', 'Sport', 'Race', 'Rally', 'Drift', 'Offroad'];
    if (mod === 'Tire Compound') return ['Stock', 'Street', 'Sport', 'Semi-Slick', '"Horizon" Semi-Slick', 'Slick', 'Drift', 'Rally', 'Offroad', 'Snow', 'Drag'];
    if (/Turbo|Supercharger/.test(mod)) return ['Stock', 'Street', 'Sport', 'Race', 'Race with Anti-lag'];
    if (mod === 'Drivetrain Swap') return ['FWD', 'RWD', 'AWD'];
    if (mod === 'Wheel Style') return ['Stock', 'Style'];
    if (mod === 'Wheel Size') return ['Stock', 'Size'];
    if (mod === 'Body Kit') return ['Stock'];
    if (/Bumper|Wing|Hood|Skirts/.test(mod)) return ['Stock', 'Street', 'Sport', 'Race'];
    if (/Width/.test(mod)) return Array.from({length: 29}, (_, index) => String(125 + index * 10));
    return ['Stock', 'Street', 'Sport', 'Race'];
}
function node(tag, value, className) {
    const el = document.createElement(tag);
    if (value !== undefined) el.textContent = value;
    if (className) el.className = className;
    return el;
}
function button(label, handler, className) {
    const el = node('button', label, className); el.type = 'button'; el.addEventListener('click', handler); return el;
}
function field(label, value, change, {area = false, placeholder = ''} = {}) {
    const wrap = node('label', label), input = document.createElement(area ? 'textarea' : 'input');
    input.value = value; input.placeholder = placeholder; input.maxLength = area ? 8000 : 200;
    input.addEventListener('change', () => change(input.value.trim())); wrap.append(input); return wrap;
}
function select(label, options, value, change) {
    const wrap = node('label', label), input = node('select');
    for (const [key, name] of options) { const option = node('option', name); option.value = key; input.append(option); }
    input.value = value; input.addEventListener('change', () => change(input.value)); wrap.append(input); return wrap;
}
function checkbox(label, checked, change) {
    const wrap = node('label', undefined, 'importer-check'), input = node('input');
    input.type = 'checkbox'; input.checked = checked; input.addEventListener('change', () => change(input.checked));
    wrap.append(input, document.createTextNode(label)); return wrap;
}
function changed() {
    dirty = true; submissionId = null; published = false; $('confirmCar').checked = false;
    $('publishStatus').textContent = ''; saveLocalDraft(); review();
}
function engineRow() { return draft.upgrades.find(row => row.mod === 'Engine Swap' && row.category === conversion); }
function activeMotor() { return $('importEngine').value || 'Stock'; }
function motorVariant(motor = activeMotor()) { return motor === (engineRow()?.options[0] || 'Stock') ? 'Stock Engine' : motor; }
function engineRequirement(motor = activeMotor()) { return {category: conversion, mod: 'Engine Swap', variant: '', options: [motor]}; }
function aspirationRow(motor = activeMotor()) {
    return draft.upgrades.find(row => row.mod === 'Aspiration' && row.variant === motorVariant(motor));
}
function rowMotor(row) {
    return row.requires?.find(req => req.mod === 'Engine Swap')?.options[0] ||
        (row.variant === 'Stock Engine' || row.variant?.startsWith('Stock Engine ·') ? engineRow()?.options[0] || 'Stock' : row.variant?.split(' · ')[0]) || 'Stock';
}
function matchRow(category, mod) {
    return draft.upgrades.find(row => {
        if (row.category !== category || row.mod !== mod) return false;
        if (category !== 'Engine') return true;
        if (rowMotor(row) !== activeMotor()) return false;
        const aspiration = row.requires?.find(req => req.mod === 'Aspiration');
        return $('aspirationOnly').checked ? aspiration?.options.includes($('importAspiration').value) : !aspiration;
    });
}
function addUpgrade(category, mod) {
    const row = {...emptyUpgrade(), category, mod, options: /Width/.test(mod) ? [] : choices(mod).slice(0, 1)};
    if (category === 'Engine') {
        row.variant = motorVariant();
        if (engineRow()) row.requires.push(engineRequirement());
        if ($('aspirationOnly').checked) {
            row.variant += ' · ' + $('importAspiration').value;
            const parent = ensureAspiration();
            row.requires.push({category: conversion, mod: 'Aspiration', variant: parent.variant, options: [$('importAspiration').value]});
        }
    }
    draft.upgrades.push(row); return row;
}
function ensureAspiration() {
    let row = aspirationRow();
    if (!row) {
        row = {category: conversion, mod: 'Aspiration', variant: motorVariant(), options: [$('baseAspiration').value.trim() || 'NA'], requires: engineRow() ? [engineRequirement()] : []};
        draft.upgrades.push(row);
    }
    return row;
}
function engineControls(preferredMotor, preferredAspiration) {
    const motors = engineRow()?.options || ['Stock'];
    const previous = preferredMotor || activeMotor();
    $('importEngine').replaceChildren(...motors.map(motor => { const option = node('option', motor === motors[0] ? 'Stock motor' : motor); option.value = motor; return option; }));
    $('importEngine').value = motors.includes(previous) ? previous : motors[0];
    const parent = aspirationRow(), nativeBase = draft.aspirationBases?.find(base => base.motor === activeMotor())?.aspiration || 'NA';
    const aspirations = parent?.options || [nativeBase];
    $('importAspiration').replaceChildren(...aspirations.map(value => { const option = node('option', value); option.value = value; return option; }));
    $('importAspiration').value = aspirations.includes(preferredAspiration) ? preferredAspiration : aspirations[0];
    $('baseAspiration').value = aspirations[0];
    $('aspirationOnly').disabled = aspirations.length < 2;
    if (aspirations.length < 2) $('aspirationOnly').checked = false;
    $('engineContext').textContent = `Motor: ${motorVariant()} · Aspiration: ${$('importAspiration').value}`;
}
function renderChecklist() {
    const expanded = [...$('upgradeChecklist').querySelectorAll('details[open]')].map(group => group.dataset.category);
    const firstRender = !$('upgradeChecklist').children.length;
    $('upgradeChecklist').replaceChildren();
    for (const [category, mods] of catalog) {
        const group = node('details'); group.dataset.category = category;
        group.open = firstRender ? category === 'Engine' : expanded.includes(category);
        group.append(node('summary', category));
        for (const mod of mods) {
            const row = matchRow(category, mod), wrap = node('div', undefined, 'importer-mod');
            wrap.dataset.mod = mod;
            wrap.append(checkbox(mod, !!row, checked => {
                if (checked) addUpgrade(category, mod);
                else draft.upgrades.splice(draft.upgrades.indexOf(row), 1);
                changed(); renderChecklist(); renderRows();
            }));
            if (row) {
                const options = node('div', undefined, 'importer-options');
                const values = [...new Set([...choices(mod), ...row.options])];
                for (const value of values) options.append(checkbox(value, row.options.includes(value), checked => {
                    const selected = new Set(row.options);
                    if (checked) selected.add(value); else selected.delete(value);
                    row.options = values.filter(value => selected.has(value));
                    changed(); renderRows();
                }));
                wrap.append(options);
                if (row.options.length) wrap.append(select('Base option already on the car', row.options.map(value => [value, value]), row.options[0], value => {
                    row.options = [value, ...row.options.filter(option => option !== value)]; changed(); renderRows();
                }));
                wrap.append(checkbox('No visible Stock/base option in Forza', !!row.implicitBase, checked => {
                    if (checked) { row.implicitBase = `Base ${mod}`; row.options = row.options.filter(value => value !== 'Stock'); }
                    else delete row.implicitBase;
                    changed(); renderChecklist(); renderRows();
                }));
                const custom = node('div', undefined, 'importer-inline');
                const label = node('label', 'Another option from Forza'), input = node('input');
                input.maxLength = 200; input.placeholder = /Width/.test(mod) ? 'Actual tire width' : 'Exact option name'; label.append(input);
                custom.append(label, button('Add option', () => {
                    const value = input.value.trim();
                    if (!value || row.options.some(option => option.toLowerCase() === value.toLowerCase())) return;
                    row.options.push(value); changed(); renderChecklist(); renderRows();
                }));
                wrap.append(custom, node('p', /Width/.test(mod) ? 'Choose the actual stock width as the base, then check the available wider options.' : 'Check only options shown in Forza. Use Review below for exact labels or prerequisites.', 'importer-hint importer-option-note'));
            }
            group.append(wrap);
        }
        $('upgradeChecklist').append(group);
    }
}
function renderRows() {
    $('importRows').replaceChildren();
    const builtCar = validateCar(draft).car;
    draft.upgrades.forEach((row, index) => {
        const card = node('details', undefined, 'importer-row');
        card.dataset.row = String(index);
        card.append(node('summary', `${index + 1}. ${row.mod || 'New upgrade'}${row.variant ? ' · ' + row.variant : ''} — ${row.category}`));
        const grid = node('div', undefined, 'importer-grid');
        grid.append(select('Category', CATEGORIES.map(name => [name, name]), row.category, value => { row.category = value; refresh(); }));
        grid.append(field('Upgrade name', row.mod, value => { row.mod = value; refresh(); }));
        card.append(grid, field('Engine / variant label (optional)', row.variant || '', value => { row.variant = value; refresh(); }));
        card.append(field('Options — one per line, base option first', row.options.join('\n'), value => { row.options = value.split(/\r?\n/).map(value => value.trim()).filter(Boolean); refresh(); }, {area: true, placeholder: 'Stock\nStreet\nSport\nRace'}));
        card.append(field('Implicit base — only if Forza has no visible Stock option', row.implicitBase || '', value => { if (value) row.implicitBase = value; else delete row.implicitBase; refresh(); }, {placeholder: 'Base Single Turbo'}));
        const tiers = node('div');
        const built = builtCar.upgrades.find(upgrade => upgrade.id === rowId(row));
        if (built) for (const option of built.options) tiers.append(node('span', `${option.name} · Tier ${option.tier}`, 'importer-tier'));
        card.append(tiers, node('h3', 'Prerequisites'));
        if (!row.requires.length) card.append(node('p', 'Available without prerequisites. A variant label alone does not restrict it.', 'importer-hint'));
        for (const [reqIndex, req] of row.requires.entries()) {
            const wrap = node('div', undefined, 'importer-dependency');
            const candidates = draft.upgrades.filter(other => other !== row);
            const identity = candidate => [candidate.category, candidate.mod, candidate.variant || ''].join('\n');
            const options = candidates.map(other => [identity(other), `${other.mod}${other.variant ? ' · ' + other.variant : ''} (${other.category})`]);
            if (!candidates.some(other => identity(other) === identity(req))) options.unshift([identity(req), `Missing: ${req.mod} · ${req.variant || 'no variant'}`]);
            wrap.append(select('Requires upgrade', options, identity(req), value => {
                const parent = candidates.find(other => identity(other) === value);
                row.requires[reqIndex] = {category: parent.category, mod: parent.mod, variant: parent.variant || '', options: []}; refresh();
            }));
            const parent = candidates.find(other => identity(other) === identity(req));
            const optionGroup = node('div', undefined, 'importer-options');
            if (parent) for (const value of [...new Set([...parent.options, ...(parent.implicitBase ? [parent.implicitBase] : []), ...req.options])]) {
                optionGroup.append(checkbox(value, req.options.includes(value), checked => {
                    req.options = checked ? [...req.options, value] : req.options.filter(option => option !== value); changed();
                }));
            }
            wrap.append(node('p', 'At least one of these options must be installed:'), optionGroup,
                button('Remove prerequisite', () => { row.requires.splice(reqIndex, 1); refresh(); }, 'importer-remove'));
            card.append(wrap);
        }
        card.append(button('Add prerequisite', () => {
            const parent = draft.upgrades.find(other => other !== row);
            if (!parent) { $('importStatus').textContent = 'Add another upgrade before linking a prerequisite.'; return; }
            row.requires.push({category: parent.category, mod: parent.mod, variant: parent.variant || '', options: []}); refresh();
        }));
        card.append(button('Remove upgrade', () => { draft.upgrades.splice(index, 1); refresh(); }, 'importer-remove'));
        $('importRows').append(card);
    });
}
function rowId(row) { return [row.category, row.mod, row.variant || ''].filter(Boolean).join('__').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }
function refresh() {
    const open = [...$('importRows').querySelectorAll('details[open]')].map(card => card.dataset.row);
    const motor = activeMotor(), aspiration = $('importAspiration').value;
    changed(); engineControls(motor, aspiration); renderChecklist(); renderRows();
    for (const index of open) { const card = $('importRows').querySelector(`[data-row="${index}"]`); if (card) card.open = true; }
}
function review() {
    const result = validateCar(draft);
    $('downloadCar').disabled = result.errors.length > 0;
    let communityValid = false;
    if (!result.errors.length) {
        try { communityDefinition(draft); communityValid = true; }
        catch (error) { result.warnings.push(error.message); }
    }
    $('publishCar').disabled = publishing || published || !communityValid || !$('confirmCar').checked;
    $('importStatus').textContent = result.errors.length ? `${result.errors.length} issue${result.errors.length === 1 ? '' : 's'} to fix · ${draft.upgrades.length} upgrade rows` : `Ready to download · ${draft.upgrades.length} upgrade rows`;
    $('importStatus').className = result.errors.length ? 'importer-error' : 'importer-success';
    $('importMessages').replaceChildren();
    for (const [title, messages, className] of [['Fix before downloading', result.errors, 'importer-error'], ['Check against Forza', [...notices, ...result.warnings], 'importer-warning']]) {
        if (!messages.length) continue;
        const details = node('details'); details.open = result.errors.length > 0 && title === 'Fix before downloading';
        details.append(node('summary', `${title} (${messages.length})`));
        const list = node('ul', undefined, className); for (const message of messages) list.append(node('li', message)); details.append(list); $('importMessages').append(details);
    }
}
function download(source, filename, type) {
    const url = URL.createObjectURL(new Blob([source], {type})), link = node('a');
    link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function load(next, warnings = []) {
    if (dirty && !window.confirm('Replace the current form? Download a draft first if you want to keep it.')) return;
    draft = next; notices = warnings; dirty = false; published = false; submissionId = null; $('confirmCar').checked = false; $('publishStatus').textContent = '';
    $('importCarName').value = draft.name; $('importCarPI').value = draft.startingPI;
    $('aspirationOnly').checked = false;
    engineControls(); renderChecklist(); renderRows(); review();
    saveLocalDraft();
    $('fileStatus').textContent = 'Loaded into the form. Review the motors, options and prerequisites above.';
}
$('importCarName').addEventListener('input', () => { draft.name = $('importCarName').value.trim(); changed(); });
$('importCarPI').addEventListener('input', () => { draft.startingPI = $('importCarPI').value.trim().toUpperCase(); changed(); });
$('importEngine').addEventListener('change', () => { $('aspirationOnly').checked = false; engineControls(); renderChecklist(); });
$('importAspiration').addEventListener('change', () => { $('engineContext').textContent = `Motor: ${motorVariant()} · Aspiration: ${$('importAspiration').value}`; renderChecklist(); });
$('aspirationOnly').addEventListener('change', renderChecklist);
$('addEngine').addEventListener('click', () => {
    const motor = $('newEngine').value.trim();
    if (!motor || motor.length > 100) { $('fileStatus').textContent = 'Enter a motor name of 1–100 characters.'; $('newEngine').focus(); return; }
    let parent = engineRow();
    if (!parent) { parent = {category: conversion, mod: 'Engine Swap', variant: '', options: ['Stock'], requires: []}; draft.upgrades.push(parent); }
    if (parent.options.some(value => value.toLowerCase() === motor.toLowerCase())) { $('newEngine').focus(); return; }
    parent.options.push(motor);
    for (const row of draft.upgrades) {
        if ((row.category === 'Engine' || row.mod === 'Aspiration') && row.variant?.startsWith('Stock Engine') && !row.requires.some(req => req.mod === 'Engine Swap')) row.requires.push(engineRequirement(parent.options[0]));
    }
    $('newEngine').value = ''; $('aspirationOnly').checked = false;
    engineControls(motor); changed(); renderChecklist(); renderRows();
});
$('baseAspiration').addEventListener('change', () => {
    const value = $('baseAspiration').value.trim();
    if (!value) { engineControls(); return; }
    draft.aspirationBases ||= [];
    draft.aspirationBases = draft.aspirationBases.filter(base => base.motor !== activeMotor());
    draft.aspirationBases.push({motor: activeMotor(), aspiration: value});
    const parent = aspirationRow(); if (parent) parent.options[0] = value;
    engineControls(activeMotor(), value); changed(); renderChecklist(); renderRows();
});
$('addAspiration').addEventListener('click', () => {
    const value = $('newAspiration').value.trim();
    if (!value || value.length > 100) { $('newAspiration').focus(); return; }
    const parent = ensureAspiration();
    if (!parent.options.some(option => option.toLowerCase() === value.toLowerCase())) parent.options.push(value);
    $('newAspiration').value = ''; $('aspirationOnly').checked = true;
    engineControls(activeMotor(), value); changed(); renderChecklist(); renderRows();
});
for (const name of CATEGORIES) { const option = node('option', name); option.value = name; $('customCategory').append(option); }
$('addCustomUpgrade').addEventListener('click', () => {
    const mod = $('customMod').value.trim();
    if (!mod) { $('customMod').focus(); return; }
    if (!matchRow($('customCategory').value, mod)) addUpgrade($('customCategory').value, mod);
    $('customMod').value = ''; changed(); renderChecklist(); renderRows(); $('importRows').lastElementChild.open = true;
});
$('downloadCar').addEventListener('click', () => {
    try { download(exportCar(draft), `${draft.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.car.json`, 'application/json'); dirty = false; }
    catch (error) { $('fileStatus').textContent = error.message; }
});
$('downloadDraft').addEventListener('click', () => { download(JSON.stringify(draft, null, 2), 'unfinished-car.car.json', 'application/json'); dirty = false; });
$('newCar').addEventListener('click', () => load(emptyCar()));
$('confirmCar').addEventListener('change', review);
$('publishCar').addEventListener('click', async () => {
    if (publishing || published || !$('confirmCar').checked) return;
    publishing = true; review();
    const controls = [...document.querySelectorAll('input, select, textarea, button')];
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });
    $('publishStatus').textContent = 'Saving your car…';
    try {
        // Lazy loading leaves the guided form usable even if Firebase is unavailable.
        const {submitCommunityCar} = await import('./community-api.js?v=1');
        submissionId = await submitCommunityCar(structuredClone(draft), submissionId);
        published = true; dirty = false;
        saveLocalDraft();
        $('publishStatus').textContent = `${draft.name} is saved as a Community Car. In Race Night, the host can load Community Cars and select it. Reference: ${submissionId}`;
    } catch (error) {
        submissionId = error.submissionId || submissionId;
        saveLocalDraft();
        $('publishStatus').textContent = `Could not confirm the save. Your form is still here; you can retry or save a draft. ${error.code === 'PERMISSION_DENIED' || error.code === 'database/permission-denied' ? 'Community saving may not be enabled yet. Contact the site owner.' : error.message}`;
    } finally {
        controls.forEach((control, index) => { control.disabled = disabled[index]; });
        publishing = false; review();
    }
});
$('downloadTemplate').addEventListener('click', () => download(CSV_TEMPLATE, 'car-template.csv', 'text/csv'));
for (const car of CAR_LIBRARY) { const option = node('option', `${car.name} — ${car.startingPI}`); option.value = car.name; $('existingCar').append(option); }
$('copyExistingCar').addEventListener('click', () => load(draftFromCar(CAR_LIBRARY.find(car => car.name === $('existingCar').value))));
$('importFile').addEventListener('change', async () => {
    const file = $('importFile').files[0];
    if (!file) return;
    $('fileStatus').textContent = 'Reading file…'; $('sheetPicker').hidden = true;
    try {
        if (file.size > 8 * 1024 * 1024) throw Error('Use a file smaller than 8 MB.');
        if (/\.json$/i.test(file.name)) load(readCarFile(await file.text()));
        else if (/\.(csv|tsv)$/i.test(file.name)) { const result = draftFromSheets([{name: file.name, rows: parseDelimited(await file.text())}]); load(result.draft, result.warnings); }
        else if (/\.xlsx$/i.test(file.name)) {
            workbook = await readWorkbook(await file.arrayBuffer());
            $('sheetChoices').replaceChildren();
            for (const [index, sheet] of workbook.entries()) {
                const choice = checkbox(sheet.name, !/example/i.test(sheet.name), () => {});
                choice.querySelector('input').value = String(index); $('sheetChoices').append(choice);
            }
            $('sheetPicker').hidden = false; $('fileStatus').textContent = 'Choose worksheets, then load them into the form.';
        } else throw Error('Choose an .xlsx, .csv, .tsv or exported .json file.');
    } catch (error) { $('fileStatus').textContent = 'Could not open file: ' + error.message; }
    finally { $('importFile').value = ''; }
});
$('loadSheets').addEventListener('click', () => {
    try {
        const selected = [...$('sheetChoices').querySelectorAll('input:checked')].map(input => workbook[Number(input.value)]);
        if (!selected.length) throw Error('Choose at least one worksheet.');
        const result = draftFromSheets(selected); load(result.draft, result.warnings);
    } catch (error) { $('fileStatus').textContent = 'Could not load worksheets: ' + error.message; }
});
window.addEventListener('beforeunload', event => { if (dirty && !draftStored) { event.preventDefault(); event.returnValue = ''; } });
try {
    const saved = JSON.parse(localStorage.getItem('jart:carImporterDraft') || 'null');
    if (saved?.draft) {
        draft = readCarFile(JSON.stringify(saved.draft));
        submissionId = typeof saved.submissionId === 'string' ? saved.submissionId : null;
        published = saved.published === true;
        $('importCarName').value = draft.name; $('importCarPI').value = draft.startingPI;
        if (published) $('publishStatus').textContent = `This car was already saved as a Community Car. Reference: ${submissionId}`;
        draftStored = true; $('draftStorageStatus').textContent = 'Your last car draft was restored from this browser.';
    }
} catch { $('draftStorageStatus').textContent = 'The previous draft could not be restored. Start a new car or open a backup.'; }
engineControls(); renderChecklist(); renderRows(); review();
