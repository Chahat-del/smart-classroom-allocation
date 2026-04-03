
/**
 * stack.js — Undo Stack for Booking Operations
 *
 * Every confirmed booking is pushed onto this stack.
 * Clicking "Undo" in the teacher UI pops the top entry,
 * which Dev 3's backend uses to identify and delete the record.
 *
 * The stack also maintains a finite history (default: 50 entries)
 * so memory doesn't grow unbounded during a long session.
 *
 * All operations are O(1).
 */

const DEFAULT_MAX_SIZE = 50;

class UndoStack {
  /**
   * @param {number} maxSize  Max entries to keep (oldest dropped first).
   */
  constructor(maxSize = DEFAULT_MAX_SIZE) {
    if (maxSize < 1) throw new Error("maxSize must be at least 1");
    this._stack = [];
    this._maxSize = maxSize;
  }

  get size() {
    return this._stack.length;
  }

  isEmpty() {
    return this._stack.length === 0;
  }

  /**
   * Push a confirmed booking onto the undo stack.
   *
   * @param {Object} booking  The full booking object returned by the DB
   *   Expected fields: { id, roomId, userId, start, end, priority, createdAt }
   */
  push(booking) {
    if (!booking || !booking.id) {
      throw new Error("booking must be an object with at least an `id` field");
    }
    this._stack.push(booking);

    // Evict the oldest entry if we exceeded the cap
    if (this._stack.length > this._maxSize) {
      this._stack.shift();
    }
  }

  /**
   * Pop the most-recently-pushed booking (the one to undo).
   * @returns {Object | null}
   */
  pop() {
    return this._stack.pop() ?? null;
  }

  /**
   * Inspect the most-recent booking without removing it.
   * @returns {Object | null}
   */
  peek() {
    if (this.isEmpty()) return null;
    return this._stack[this._stack.length - 1];
  }

  /**
   * Returns a copy of the history in reverse-chronological order
   * (most recent first). Safe to iterate — does not modify the stack.
   *
   * @returns {Array<Object>}
   */
  history() {
    return [...this._stack].reverse();
  }

  /**
   * Remove a specific booking from anywhere in the stack by id.
   * Useful when a booking is explicitly deleted (not via undo).
   *
   * @param {string} bookingId
   * @returns {boolean} true if found and removed
   */
  removeById(bookingId) {
    const idx = this._stack.findIndex((b) => b.id === bookingId);
    if (idx === -1) return false;
    this._stack.splice(idx, 1);
    return true;
  }

  /** Clear everything — e.g. at session end or during testing. */
  clear() {
    this._stack = [];
  }

  /**
   * Serialise the stack to a plain array for persistence.
   * Dev 3 can store this in SQLite or session storage.
   */
  toJSON() {
    return [...this._stack];
  }

  /**
   * Restore the stack from a persisted array.
   * @param {Array<Object>} arr
   */
  static fromJSON(arr, maxSize = DEFAULT_MAX_SIZE) {
    const s = new UndoStack(maxSize);
    // Only keep the last maxSize items
    const trimmed = arr.slice(-maxSize);
    for (const booking of trimmed) {
      s.push(booking);
    }
    return s;
  }
}

module.exports = { UndoStack };