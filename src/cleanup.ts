// Rules for the weekly clean-up of stored pictures nothing points at. Pure:
// a mistake here deletes pictures that are in use, so every rule is tested.

/** Pictures are "w/<list>/<uuid>.<ext>", profile pictures "a/<list>/<uuid>.<ext>". */
export const STORED_KEY = /^[wa]\/\d+\/[0-9a-f-]{36}\.(jpg|png|webp|avif|gif)$/;

const DAY_MS = 24 * 60 * 60 * 1000;

type StoredObject = { key: string; uploaded: Date };

/**
 * Stored pictures that no wish or list refers to. A picture uploaded within
 * the last day is left alone: its wish may be in the middle of being saved.
 * Keys that do not look like ours are never touched.
 */
export function findOrphans(objects: StoredObject[], referenced: ReadonlySet<string>, now: Date) {
  return objects
    .filter((object) => STORED_KEY.test(object.key))
    .filter((object) => !referenced.has(object.key))
    .filter((object) => now.getTime() - object.uploaded.getTime() > DAY_MS)
    .map((object) => object.key);
}

/**
 * A sanity check before deleting. A few strays are normal; a sweep that wants
 * to remove more than half of everything most likely means the list of
 * references is wrong, so it is refused and left for a person to look at.
 */
export function sweepLooksSane(totalObjects: number, orphans: number) {
  return orphans <= Math.max(10, totalObjects / 2);
}
