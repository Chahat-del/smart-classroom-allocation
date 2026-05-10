
const express     = require("express");
const db          = require("../db/database");
const verifyToken = require("../middleware/auth");
const router      = express.Router();

// GET /api/bookings
router.get("/", verifyToken, (req, res) => {
  const { date, branch } = req.query;
  let query = `
    SELECT b.*, r.name as room_name, r.building, u.name as teacher_name
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  if (date)   { query += " AND b.date = ?";   params.push(date);   }
  if (branch) { query += " AND b.branch = ?"; params.push(branch); }
  query += " ORDER BY b.date, b.start_time";

  res.json(db.prepare(query).all(...params));
});

// POST /api/bookings — create booking
router.post("/", verifyToken, (req, res) => {
  const { room_id, subject, batch, branch, date, start_time, end_time, capacity } = req.body;
  const priority = req.user.role === "teacher" ? 0 : 1;

  // Conflict check using interval overlap
  const conflict = db.prepare(`
    SELECT * FROM bookings
    WHERE room_id = ? AND date = ? AND start_time < ? AND end_time > ?
  `).get(room_id, date, end_time, start_time);

  if (conflict)
    return res.status(409).json({ error: "Room already booked for this slot", conflict });

  const result = db.prepare(`
    INSERT INTO bookings (room_id, user_id, subject, batch, branch, date, start_time, end_time, capacity, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(room_id, req.user.id, subject, batch, branch, date, start_time, end_time, capacity, priority);

  res.status(201).json({ id: result.lastInsertRowid, message: "Booking created" });
});

// DELETE /api/bookings/:id — cancel booking
router.delete("/:id", verifyToken, (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  // Check if cancellation is still allowed (30 min before start)
  const now = new Date();
  const bookingStart = new Date(`${booking.date}T${booking.start_time}`);
  const diffMinutes = (bookingStart - now) / (1000 * 60);

  if (diffMinutes < 30)
    return res.status(403).json({ error: "Cannot cancel within 30 minutes of booking start" });

  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
  res.json({ message: "Booking cancelled" });
});
module.exports = router;