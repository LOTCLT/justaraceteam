import { CAR_LIBRARY } from './game-data.js?v=10';
import { readCarFile, validateCar, exportCar } from './car-import.js?v=1';

export const MAX_CAR_BYTES = 96000;
export function communityCarFromDefinition(definition, id) {
    if (typeof definition !== 'string' || new TextEncoder().encode(definition).length > MAX_CAR_BYTES) throw Error('The community car is too large.');
    const draft = readCarFile(definition), result = validateCar(draft);
    if (result.errors.length) throw Error(result.errors.join(' '));
    if (CAR_LIBRARY.some(car => car.name.toLowerCase() === draft.name.toLowerCase())) throw Error('Community cars cannot replace a car in the reviewed lineup. Use a distinct name.');
    return {...result.car, communityId: id, definition};
}
export function communityCarFromRecord(id, record) {
    if (!record || record.status !== 'community' || !Number.isFinite(record.createdAt) || typeof record.ownerUid !== 'string') throw Error('Invalid community record.');
    const car = communityCarFromDefinition(record.definition, id);
    if (car.name !== record.name || car.startingPI !== record.startingPI) throw Error('The car record does not match its definition.');
    return car;
}
export function communityDefinition(draft) {
    const definition = exportCar(draft);
    communityCarFromDefinition(definition, 'new');
    return definition;
}
