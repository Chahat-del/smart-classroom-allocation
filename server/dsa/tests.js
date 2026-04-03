/**
 * tests.js — DSA Engine Test Suite
 *
 * Run with:  node tests.js
 * (No Jest needed — uses plain Node assertions.)
 *
 * Output: each test prints PASS or FAIL with a description.
 * Exit code 0 = all passed, 1 = at least one failure.
 */

const assert = require("assert");
const { findBestFit, rankRooms }            = require("./greedy");
const { IntervalForest }                    = require("./intervalTree");
const { MinHeap }                           = require("./minHeap");
const { UndoStack }                         = require("./stack");
const {
  searchByName,
  searchByMinCapacity,
  getRoomsWithMinCapacity,
  searchByNamePartial,
}                                           = require("./binarysearch");

// ─── Test runner ─────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${description}`);
    console.error(`     → ${err.message}`);
    failed++;
  }
}

// ─── Shared fixtures ──────────────────────────────────────────
const ROOMS = [
  { id: "r1", name: "A101", capacity: 30,  building: "Block A", floor: 1 },
  { id: "r2", name: "B201", capacity: 60,  building: "Block B", floor: 2 },
  { id: "r3", name: "C301", capacity: 100, building: "Block C", floor: 3 },
  { id: "r4", name: "D401", capacity: 25,  building: "Block D", floor: 4 },
  { id: "r5", name: "E501", capacity: 60,  building: "Block E", floor: 5 },
];

// Helpers to create timestamps
const T = (h, m = 0) => new Date(2024, 0, 15, h, m).getTime(); // Jan 15 2024

// ─────────────────────────────────────────────────────────────
// 1. GREEDY ALLOCATOR
// ─────────────────────────────────────────────────────────────
console.log("\n── greedy.js ──");

test("returns null for empty room list", () => {
  assert.strictEqual(findBestFit([], 30), null);
});

test("returns null when no room is large enough", () => {
  assert.strictEqual(findBestFit(ROOMS, 200), null);
});

test("picks the smallest room that fits (25 needed → r4=25, not r1=30)", () => {
  const result = findBestFit(ROOMS, 25);
  assert.strictEqual(result.room.id, "r4");
  assert.strictEqual(result.wastedSeats, 0);
});

test("picks exact-fit room with 0 wasted seats", () => {
  const result = findBestFit(ROOMS, 30);
  assert.strictEqual(result.room.capacity, 30);
  assert.strictEqual(result.wastedSeats, 0);
});

test("picks next-up room when exact fit unavailable (31 needed → r1=30 skipped → r2=60)", () => {
  const result = findBestFit(ROOMS, 31);
  assert.strictEqual(result.room.capacity, 60);
  assert.strictEqual(result.wastedSeats, 29);
});

test("rankRooms returns all eligible rooms ordered by ascending waste", () => {
  const ranked = rankRooms(ROOMS, 30);
  // 30-cap (waste 0), then 60-cap × 2 (waste 30), then 100-cap (waste 70)
  assert.strictEqual(ranked[0].wastedSeats, 0);
  assert.strictEqual(ranked[1].wastedSeats, 30);
  assert(ranked[ranked.length - 1].wastedSeats >= ranked[0].wastedSeats);
});

test("rankRooms returns empty array when nothing fits", () => {
  const ranked = rankRooms(ROOMS, 999);
  assert.deepStrictEqual(ranked, []);
});

test("throws for non-positive requestedCapacity", () => {
  assert.throws(() => findBestFit(ROOMS, 0), /positive/);
  assert.throws(() => findBestFit(ROOMS, -5), /positive/);
});

// ─────────────────────────────────────────────────────────────
// 2. INTERVAL TREE
// ─────────────────────────────────────────────────────────────
console.log("\n── intervalTree.js ──");

test("no conflict when tree is empty", () => {
  const forest = new IntervalForest();
  assert.strictEqual(forest.hasConflict("r1", T(9), T(10)), false);
});

test("detects a direct overlap (same slot, same room)", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r1", T(9), T(11)), true);
});

test("detects partial overlap — new booking starts inside existing", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r1", T(10), T(12)), true);
});

test("detects partial overlap — new booking ends inside existing", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r1", T(8), T(10)), true);
});

test("detects containment overlap — new booking wraps around existing", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(10), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r1", T(9), T(12)), true);
});

test("no conflict for adjacent non-overlapping slots (11:00-end, 11:00-start)", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  // Starts exactly when previous ends — should be fine
  assert.strictEqual(forest.hasConflict("r1", T(11), T(12)), false);
});

test("no conflict for completely separate time slots", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r1", T(12), T(14)), false);
});

test("different rooms don't interfere", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r2", T(9), T(11)), false);
});

test("multiple bookings — detects conflict with second one", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9),  T(10), "b1");
  forest.insert("r1", T(11), T(12), "b2");
  assert.strictEqual(forest.hasConflict("r1", T(11, 30), T(13)), true);
});

test("delete removes interval so it no longer conflicts", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9), T(11), "b1");
  assert.strictEqual(forest.hasConflict("r1", T(9), T(11)), true);
  forest.delete("r1", "b1");
  assert.strictEqual(forest.hasConflict("r1", T(9), T(11)), false);
});

test("findAllOverlaps returns every conflicting interval", () => {
  const forest = new IntervalForest();
  forest.insert("r1", T(9),  T(11), "b1");
  forest.insert("r1", T(10), T(12), "b2");
  forest.insert("r1", T(14), T(15), "b3"); // no overlap
  const conflicts = forest.getAllConflicts("r1", T(9), T(13));
  assert.strictEqual(conflicts.length, 2);
});

// ─────────────────────────────────────────────────────────────
// 3. MIN-HEAP
// ─────────────────────────────────────────────────────────────
console.log("\n── minHeap.js ──");

const makeBooking = (id, priority, createdAt) => ({
  id,
  userId: `u${id}`,
  start: T(9),
  end: T(10),
  capacity: 30,
  priority,
  createdAt,
});

test("isEmpty is true on fresh heap", () => {
  const heap = new MinHeap();
  assert.strictEqual(heap.isEmpty(), true);
});

test("faculty booking (priority 0) beats student (priority 1)", () => {
  const heap = new MinHeap();
  heap.insert(makeBooking("s1", 1, 1000)); // student first
  heap.insert(makeBooking("f1", 0, 2000)); // faculty second
  assert.strictEqual(heap.extractMin().id, "f1");
});

test("among same priority, earlier createdAt wins (FIFO)", () => {
  const heap = new MinHeap();
  heap.insert(makeBooking("f2", 0, 3000));
  heap.insert(makeBooking("f1", 0, 1000));
  heap.insert(makeBooking("f3", 0, 2000));
  const order = [heap.extractMin().id, heap.extractMin().id, heap.extractMin().id];
  assert.deepStrictEqual(order, ["f1", "f3", "f2"]);
});

test("peek does not remove the element", () => {
  const heap = new MinHeap();
  heap.insert(makeBooking("f1", 0, 1000));
  heap.peek();
  assert.strictEqual(heap.size, 1);
});

test("extractMin on empty heap returns null", () => {
  const heap = new MinHeap();
  assert.strictEqual(heap.extractMin(), null);
});

test("toSortedArray returns all elements in priority order without modifying heap", () => {
  const heap = new MinHeap();
  heap.insert(makeBooking("s1", 1, 1000));
  heap.insert(makeBooking("f1", 0, 2000));
  heap.insert(makeBooking("f2", 0, 500));
  const sorted = heap.toSortedArray();
  assert.strictEqual(sorted[0].id, "f2"); // priority 0, earliest
  assert.strictEqual(sorted[1].id, "f1");
  assert.strictEqual(sorted[2].id, "s1");
  assert.strictEqual(heap.size, 3); // original unchanged
});

test("remove by id deletes specific booking", () => {
  const heap = new MinHeap();
  heap.insert(makeBooking("f1", 0, 1000));
  heap.insert(makeBooking("s1", 1, 2000));
  const removed = heap.remove("s1");
  assert.strictEqual(removed, true);
  assert.strictEqual(heap.size, 1);
  assert.strictEqual(heap.peek().id, "f1");
});

test("throws for invalid priority value", () => {
  const heap = new MinHeap();
  assert.throws(() => heap.insert(makeBooking("x", 2, 1000)), /priority/i);
});

// ─────────────────────────────────────────────────────────────
// 4. UNDO STACK
// ─────────────────────────────────────────────────────────────
console.log("\n── stack.js ──");

const makeEntry = (id) => ({ id, roomId: "r1", userId: "u1", start: T(9), end: T(10) });

test("isEmpty on fresh stack", () => {
  const s = new UndoStack();
  assert.strictEqual(s.isEmpty(), true);
});

test("push and pop in LIFO order", () => {
  const s = new UndoStack();
  s.push(makeEntry("b1"));
  s.push(makeEntry("b2"));
  assert.strictEqual(s.pop().id, "b2");
  assert.strictEqual(s.pop().id, "b1");
});

test("pop on empty stack returns null", () => {
  const s = new UndoStack();
  assert.strictEqual(s.pop(), null);
});

test("peek returns top without removing", () => {
  const s = new UndoStack();
  s.push(makeEntry("b1"));
  s.push(makeEntry("b2"));
  assert.strictEqual(s.peek().id, "b2");
  assert.strictEqual(s.size, 2);
});

test("history() returns entries newest-first", () => {
  const s = new UndoStack();
  s.push(makeEntry("b1"));
  s.push(makeEntry("b2"));
  s.push(makeEntry("b3"));
  const h = s.history();
  assert.strictEqual(h[0].id, "b3");
  assert.strictEqual(h[2].id, "b1");
});

test("evicts oldest entry when maxSize exceeded", () => {
  const s = new UndoStack(3);
  s.push(makeEntry("b1"));
  s.push(makeEntry("b2"));
  s.push(makeEntry("b3"));
  s.push(makeEntry("b4")); // b1 should be evicted
  assert.strictEqual(s.size, 3);
  const h = s.history();
  assert(!h.some((e) => e.id === "b1"));
});

test("removeById removes a specific entry mid-stack", () => {
  const s = new UndoStack();
  s.push(makeEntry("b1"));
  s.push(makeEntry("b2"));
  s.push(makeEntry("b3"));
  const result = s.removeById("b2");
  assert.strictEqual(result, true);
  assert.strictEqual(s.size, 2);
});

test("removeById returns false for unknown id", () => {
  const s = new UndoStack();
  s.push(makeEntry("b1"));
  assert.strictEqual(s.removeById("nope"), false);
});

test("toJSON / fromJSON round-trips correctly", () => {
  const s = new UndoStack();
  s.push(makeEntry("b1"));
  s.push(makeEntry("b2"));
  const json = s.toJSON();
  const restored = UndoStack.fromJSON(json);
  assert.strictEqual(restored.size, 2);
  assert.strictEqual(restored.pop().id, "b2");
});

// ─────────────────────────────────────────────────────────────
// 5. BINARY SEARCH
// ─────────────────────────────────────────────────────────────
console.log("\n── binarySearch.js ──");

// Sorted by name A→Z
const ROOMS_BY_NAME = [...ROOMS].sort((a, b) => a.name.localeCompare(b.name));
// Sorted by capacity ascending
const ROOMS_BY_CAP  = [...ROOMS].sort((a, b) => a.capacity - b.capacity);

test("searchByName finds existing room", () => {
  const result = searchByName(ROOMS_BY_NAME, "B201");
  assert.strictEqual(result.id, "r2");
});

test("searchByName is case-insensitive", () => {
  const result = searchByName(ROOMS_BY_NAME, "b201");
  assert.strictEqual(result.id, "r2");
});

test("searchByName returns null for unknown name", () => {
  assert.strictEqual(searchByName(ROOMS_BY_NAME, "Z999"), null);
});

test("searchByName returns null on empty array", () => {
  assert.strictEqual(searchByName([], "A101"), null);
});

test("searchByMinCapacity finds the first index meeting capacity=30", () => {
  const idx = searchByMinCapacity(ROOMS_BY_CAP, 30);
  assert(ROOMS_BY_CAP[idx].capacity >= 30);
  if (idx > 0) assert(ROOMS_BY_CAP[idx - 1].capacity < 30);
});

test("searchByMinCapacity returns -1 when nothing qualifies", () => {
  assert.strictEqual(searchByMinCapacity(ROOMS_BY_CAP, 9999), -1);
});

test("searchByMinCapacity returns 0 when all rooms qualify", () => {
  assert.strictEqual(searchByMinCapacity(ROOMS_BY_CAP, 1), 0);
});

test("getRoomsWithMinCapacity returns all qualifying rooms", () => {
  const result = getRoomsWithMinCapacity(ROOMS_BY_CAP, 60);
  assert(result.every((r) => r.capacity >= 60));
  assert.strictEqual(result.length, 3); // 60, 60, 100
});

test("searchByNamePartial returns substring matches", () => {
  const result = searchByNamePartial(ROOMS, "01"); // A101, B201, C301…
  assert(result.length >= 3);
});

test("searchByNamePartial returns empty array for no match", () => {
  assert.deepStrictEqual(searchByNamePartial(ROOMS, "ZZZ"), []);
});

// ─────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────
console.log(`\n─────────────────────────────────────`);
console.log(`  Total: ${passed + failed}  |  Passed: ${passed}  |  Failed: ${failed}`);
console.log(`─────────────────────────────────────\n`);

if (failed > 0) process.exit(1);