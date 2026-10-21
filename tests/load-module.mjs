import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '..');
const cache = new Map();
async function moduleUrl(filename) {
    if (cache.has(filename)) return cache.get(filename);
    let source = await fs.readFile(path.join(root, filename), 'utf8');
    for (const match of [...source.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)]) {
        const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(filename), match[1].split('?')[0]));
        source = source.replace(match[0], `from '${await moduleUrl(dependency)}'`);
    }
    const url = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
    cache.set(filename, url); return url;
}
export async function loadModule(filename) { return import(await moduleUrl(filename)); }
