/**
 * index.js — DSA Engine entry point
 *
 * Dev 3 imports everything from here:
 *   const { IntervalForest, MinHeap, findBestFit, UndoStack, searchByName } = require('./dsa');
 */

const { findBestFit, rankRooms }                          = require("./greedy");
const { IntervalForest, RoomIntervalTree }                 = require("./intervalTree");
const { MinHeap }                                          = require("./minHeap");
const { UndoStack }                                        = require("./stack");
const {
  searchByName,
  searchByMinCapacity,
  getRoomsWithMinCapacity,
  searchByNamePartial,
}                                                          = require("./binarysearch");

module.exports = {
  // Greedy allocator
  findBestFit,
  rankRooms,

  // Interval tree (conflict detection)
  IntervalForest,
  RoomIntervalTree,

  // Priority queue
  MinHeap,

  // Undo stack
  UndoStack,

  // Binary search helpers
  searchByName,
  searchByMinCapacity,
  getRoomsWithMinCapacity,
  searchByNamePartial,
};