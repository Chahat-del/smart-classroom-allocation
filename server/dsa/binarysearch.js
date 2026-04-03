/**
 * binarySearch.js — Fast Room Lookup
 *
 * Two search modes, both O(log n) on a sorted list:
 *
 * 1. searchByName(rooms, name)
 *    Rooms sorted alphabetically — find exact room by name.
 *
 * 2. searchByMinCapacity(rooms, minCapacity)
 *    Rooms sorted ascending by capacity — find the index of
 *    the first room that meets or exceeds the minimum.
 *    (Used by greedy.js as its starting point.)
 *
 * IMPORTANT: these functions assume the input array is already
 * sorted in the required order. Dev 3's GET /rooms endpoint
 * returns rooms pre-sorted by name; the greedy allocator sorts
 * by capacity before calling searchByMinCapacity.
 */

/**
 * Binary search by exact room name (case-insensitive).
 *
 * @param {Array<{name: string}>} rooms  Sorted A→Z by name.
 * @param {string} name                 The name to find.
 * @returns {Object | null}  The matching room, or null.
 */
function searchByName(rooms, name) {
  if (!rooms || rooms.length === 0) return null;
  const target = name.trim().toLowerCase();

  let lo = 0;
  let hi = rooms.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1; // unsigned right-shift = fast floor((lo+hi)/2)
    const midName = rooms[mid].name.trim().toLowerCase();

    if (midName === target) return rooms[mid];
    if (midName < target)  lo = mid + 1;
    else                   hi = mid - 1;
  }

  return null;
}

/**
 * Find the index of the first room whose capacity >= minCapacity.
 * (Leftmost binary search / lower-bound.)
 *
 * @param {Array<{capacity: number}>} rooms  Sorted ascending by capacity.
 * @param {number} minCapacity
 * @returns {number}  Index of first eligible room, or -1 if none qualifies.
 */
function searchByMinCapacity(rooms, minCapacity) {
  if (!rooms || rooms.length === 0) return -1;

  let lo = 0;
  let hi = rooms.length; // hi is one past the last valid index

  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (rooms[mid].capacity < minCapacity) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo < rooms.length ? lo : -1;
}

/**
 * Convenience: return all rooms with capacity >= minCapacity.
 * Uses searchByMinCapacity to jump to the right position, then
 * slices — O(log n + k) where k is the number of results.
 *
 * @param {Array<{capacity: number}>} rooms  Sorted ascending by capacity.
 * @param {number} minCapacity
 * @returns {Array<Object>}
 */
function getRoomsWithMinCapacity(rooms, minCapacity) {
  const idx = searchByMinCapacity(rooms, minCapacity);
  if (idx === -1) return [];
  return rooms.slice(idx);
}

/**
 * Fuzzy name search — returns all rooms whose names contain
 * the query string (case-insensitive). Falls back to linear
 * scan since partial matches can't use the binary approach.
 * O(n) — acceptable for small room lists (< 500).
 *
 * @param {Array<{name: string}>} rooms
 * @param {string} query  Substring to search for.
 * @returns {Array<Object>}
 */
function searchByNamePartial(rooms, query) {
  if (!rooms || rooms.length === 0) return [];
  const q = query.trim().toLowerCase();
  return rooms.filter((r) => r.name.toLowerCase().includes(q));
}

module.exports = {
  searchByName,
  searchByMinCapacity,
  getRoomsWithMinCapacity,
  searchByNamePartial,
};