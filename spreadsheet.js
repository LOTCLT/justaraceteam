// Minimal XLSX reader for text/number car templates. No macros or formulas execute.
// Modern browsers supply ZIP's raw DEFLATE decoding through DecompressionStream.
const LIMIT = 8 * 1024 * 1024;
const utf8 = new TextDecoder();
function xml(source) {
    if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw Error('This workbook contains unsupported XML declarations.');
    const doc = new DOMParser().parseFromString(source, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw Error('The workbook contains invalid XML.');
    return doc;
}
const nodes = (root, name) => [...root.getElementsByTagNameNS('*', name)];
const crcTable = Array.from({length: 256}, (_, i) => {
    for (let bit = 0; bit < 8; bit++) i = i & 1 ? 0xedb88320 ^ (i >>> 1) : i >>> 1;
    return i >>> 0;
});
function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

export async function readWorkbook(buffer) {
    if (buffer.byteLength > LIMIT) throw Error('Use an Excel file smaller than 8 MB.');
    const view = new DataView(buffer), bytes = new Uint8Array(buffer);
    let end = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054b50 && i + 22 + view.getUint16(i + 20, true) === bytes.length) { end = i; break; }
    }
    if (end < 0) throw Error('This is not a supported .xlsx workbook. Try saving it again from Excel.');
    const count = view.getUint16(end + 10, true), centralSize = view.getUint32(end + 12, true);
    let offset = view.getUint32(end + 16, true), total = 0;
    if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true) || count > 256 || offset + centralSize > end) {
        throw Error('This workbook is too complex or uses an unsupported ZIP format.');
    }
    const files = new Map();
    for (let i = 0; i < count; i++) {
        if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) throw Error('The workbook ZIP directory is damaged.');
        const flags = view.getUint16(offset + 8, true), method = view.getUint16(offset + 10, true);
        const crc = view.getUint32(offset + 16, true), size = view.getUint32(offset + 20, true), rawSize = view.getUint32(offset + 24, true);
        const nameLength = view.getUint16(offset + 28, true), extraLength = view.getUint16(offset + 30, true), commentLength = view.getUint16(offset + 32, true);
        const local = view.getUint32(offset + 42, true);
        const name = utf8.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
        if (flags & 1) throw Error('Password-protected workbooks are not supported. Export an unprotected copy.');
        if (rawSize > LIMIT || (total += rawSize) > 24 * 1024 * 1024 || files.has(name)) throw Error('The workbook is too large or has duplicate entries.');
        if (local + 30 > bytes.length || view.getUint32(local, true) !== 0x04034b50) throw Error('The workbook ZIP entry is damaged.');
        const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
        if (start + size > bytes.length) throw Error('The workbook is incomplete.');
        files.set(name, {method, crc, rawSize, start, size});
        offset += 46 + nameLength + extraLength + commentLength;
    }
    const cache = new Map();
    async function read(name) {
        if (cache.has(name)) return cache.get(name);
        const file = files.get(name);
        if (!file) throw Error(`The workbook is missing ${name}.`);
        const compressed = bytes.slice(file.start, file.start + file.size);
        let data;
        if (file.method === 0) data = compressed;
        else if (file.method === 8) {
            if (typeof DecompressionStream === 'undefined') throw Error('This browser cannot open XLSX files. Use CSV or a recent Chrome, Edge, Firefox or Safari.');
            const reader = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
            const chunks = []; let length = 0;
            try {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    length += value.length;
                    if (length > file.rawSize || length > LIMIT) throw Error('A workbook entry exceeds its declared size.');
                    chunks.push(value);
                }
            } finally { await reader.cancel(); }
            data = new Uint8Array(length); let position = 0;
            for (const chunk of chunks) { data.set(chunk, position); position += chunk.length; }
        } else throw Error('Unsupported workbook compression. Save as a standard Excel .xlsx file or CSV.');
        if (data.length !== file.rawSize || crc32(data) !== file.crc) throw Error('Workbook checksum failed. Upload a fresh copy.');
        const result = xml(utf8.decode(data)); cache.set(name, result); return result;
    }
    const workbook = await read('xl/workbook.xml');
    const relationships = nodes(await read('xl/_rels/workbook.xml.rels'), 'Relationship');
    const shared = files.has('xl/sharedStrings.xml') ? nodes(await read('xl/sharedStrings.xml'), 'si').map(cell => nodes(cell, 't').map(node => node.textContent).join('')) : [];
    const sheets = [];
    for (const sheet of nodes(workbook, 'sheet')) {
        const id = sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
        const relation = relationships.find(row => row.getAttribute('Id') === id && row.getAttribute('TargetMode') !== 'External');
        if (!relation) throw Error('A worksheet reference is missing.');
        const target = relation.getAttribute('Target');
        const parts = (target.startsWith('/') ? target.slice(1) : 'xl/' + target).split('/');
        const resolved = [];
        for (const part of parts) { if (part === '..') resolved.pop(); else if (part && part !== '.') resolved.push(part); }
        const sheetDoc = await read(resolved.join('/'));
        const rows = [];
        for (const row of nodes(sheetDoc, 'row')) {
            const rowIndex = Number(row.getAttribute('r')) - 1;
            if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= 2000) throw Error('Use at most 2,000 rows per worksheet.');
            const cells = [];
            for (const cell of nodes(row, 'c')) {
                const coordinate = /^([A-Z]+)\d+$/.exec(cell.getAttribute('r') || '');
                if (!coordinate) throw Error('A worksheet cell has no valid address.');
                let column = 0;
                for (const letter of coordinate[1]) column = column * 26 + letter.charCodeAt(0) - 64;
                if (column > 80) throw Error('Use at most 80 columns per worksheet.');
                const type = cell.getAttribute('t'), value = nodes(cell, 'v')[0]?.textContent || '';
                if (nodes(cell, 'f').length) throw Error('Formulas are not supported. Paste their values into a copy before importing.');
                if (type === 's' && !Object.hasOwn(shared, value)) throw Error('A worksheet text reference is invalid.');
                cells[column - 1] = type === 's' ? shared[Number(value)] : type === 'inlineStr' ? nodes(cell, 't').map(node => node.textContent).join('') : type === 'n' || !type ? (value === '' ? '' : String(Number(value))) : value;
            }
            rows[rowIndex] = cells;
        }
        sheets.push({name: sheet.getAttribute('name'), rows: Array.from({length: rows.length}, (_, index) => rows[index] || [])});
    }
    return sheets;
}
