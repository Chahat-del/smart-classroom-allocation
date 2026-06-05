const express  = require("express");
const cors     = require("cors");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const Database = require("better-sqlite3");
const path     = require("path");

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "dsce_secret_2024";
const db     = new Database(path.join(__dirname, "dsce.db"));

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ── Schema ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    role       TEXT    NOT NULL DEFAULT 'teacher',
    dept       TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id       INTEGER PRIMARY KEY,
    name     TEXT    NOT NULL,
    building TEXT    NOT NULL,
    branch   TEXT    NOT NULL,
    floor    INTEGER DEFAULT 1,
    capacity INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    INTEGER NOT NULL,
    room_name  TEXT    NOT NULL,
    subject    TEXT    NOT NULL,
    batch      TEXT    NOT NULL,
    branch     TEXT    NOT NULL,
    date       TEXT    NOT NULL,
    start_time TEXT    NOT NULL,
    end_time   TEXT    NOT NULL,
    capacity   INTEGER NOT NULL,
    priority   INTEGER NOT NULL DEFAULT 0,
    user_id    INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ── Seed users ────────────────────────────────────────────────────
if (db.prepare("SELECT COUNT(*) as c FROM users").get().c === 0) {
  const hash = p => bcrypt.hashSync(p, 10);
  const ins  = db.prepare("INSERT INTO users (name,email,password,role,dept) VALUES (?,?,?,?,?)");
  [
    ["Prof. Mehta",  "prof.mehta@dsce.edu.in",  hash("teacher123"),  "teacher", "CSE"  ],
    ["Dr. Singh",    "prof.singh@dsce.edu.in",   hash("teach2024"),   "teacher", "ECE"  ],
    ["Prof. Rao",    "prof.rao@dsce.edu.in",     hash("lecturer321"), "teacher", "ME"   ],
    ["Prof. Kumar",  "prof.kumar@dsce.edu.in",   hash("dsce@2024"),   "teacher", "CIVIL"],
    ["Dr. Nair",     "prof.nair@dsce.edu.in",    hash("nair1234"),    "teacher", "ISE"  ],
    ["Alex Kumar",   "student@dsce.edu.in",      hash("student123"),  "student", "CSE"  ],
    ["Sahana P",     "sahana.p@dsce.edu.in",     hash("stud2024"),    "student", "CSE"  ],
    ["Ram Rao",      "ram.rao@dsce.edu.in",      hash("password1"),   "student", "ECE"  ],
    ["Nisha K",      "nisha.k@dsce.edu.in",      hash("welcome123"),  "student", "ME"   ],
    ["Arjun Sharma", "arjun.s@dsce.edu.in",      hash("arjun2024"),   "student", "CSE"  ],
    ["Priya Menon",  "priya.m@dsce.edu.in",      hash("priya@123"),   "student", "ISE"  ],
    ["Kiran B",      "kiran.b@dsce.edu.in",      hash("kiran999"),    "student", "CIVIL"],
    ["Divya R",      "divya.r@dsce.edu.in",      hash("divya321"),    "student", "ECE"  ],
  ].forEach(u => ins.run(...u));
  console.log("✅ Seeded 13 users");
}

// ── Seed rooms — IDs match dsceData.js exactly (1-39) ────────────
if (db.prepare("SELECT COUNT(*) as c FROM rooms").get().c === 0) {
  const ins = db.prepare("INSERT INTO rooms (id,name,building,branch,floor,capacity) VALUES (?,?,?,?,?,?)");
  [
    // CSE — Building 19 (NB Block)
    [1,  "NB-101", "Building 19 (NB Block)", "CSE",      1, 60],
    [2,  "NB-102", "Building 19 (NB Block)", "CSE",      1, 60],
    [3,  "NB-103", "Building 19 (NB Block)", "CSE",      1, 40],
    [4,  "NB-201", "Building 19 (NB Block)", "CSE",      2, 60],
    [5,  "NB-202", "Building 19 (NB Block)", "CSE",      2, 60],
    [6,  "NB-203", "Building 19 (NB Block)", "CSE",      2, 40],
    [7,  "NB-301", "Building 19 (NB Block)", "CSE",      3, 80],
    [8,  "NB-302", "Building 19 (NB Block)", "CSE",      3, 60],
    // ISE — Building 19 (NB Block)
    [9,  "NB-104", "Building 19 (NB Block)", "ISE",      1, 60],
    [10, "NB-204", "Building 19 (NB Block)", "ISE",      2, 60],
    [11, "NB-304", "Building 19 (NB Block)", "ISE",      3, 40],
    // AIML — Building 19 (NB Block)
    [12, "NB-105", "Building 19 (NB Block)", "AIML",     1, 60],
    [13, "NB-205", "Building 19 (NB Block)", "AIML",     2, 60],
    [14, "NB-305", "Building 19 (NB Block)", "AIML",     3, 40],
    // MATHS_DS — Building 4
    [15, "B4-101", "Building 4",             "MATHS_DS", 1, 60],
    [16, "B4-102", "Building 4",             "MATHS_DS", 1, 60],
    [17, "B4-201", "Building 4",             "MATHS_DS", 2, 80],
    [18, "B4-202", "Building 4",             "MATHS_DS", 2, 40],
    [19, "B4-301", "Building 4",             "MATHS_DS", 3, 60],
    // EEE — Building 17
    [20, "B17-101","Building 17",            "EEE",      1, 60],
    [21, "B17-102","Building 17",            "EEE",      1, 60],
    [22, "B17-201","Building 17",            "EEE",      2, 80],
    [23, "B17-202","Building 17",            "EEE",      2, 40],
    // ECE — Building 15
    [24, "B15-101","Building 15",            "ECE",      1, 60],
    [25, "B15-102","Building 15",            "ECE",      1, 60],
    [26, "B15-201","Building 15",            "ECE",      2, 80],
    [27, "B15-202","Building 15",            "ECE",      2, 40],
    // ME — Building 6
    [28, "B6-101", "Building 6",             "ME",       1, 60],
    [29, "B6-102", "Building 6",             "ME",       1, 60],
    [30, "B6-201", "Building 6",             "ME",       2, 80],
    [31, "B6-202", "Building 6",             "ME",       2, 40],
    // CIVIL — Building 8
    [32, "B8-101", "Building 8",             "CIVIL",    1, 60],
    [33, "B8-102", "Building 8",             "CIVIL",    1, 60],
    [34, "B8-201", "Building 8",             "CIVIL",    2, 80],
    // AERO — Building 11
    [35, "B11-101","Building 11",            "AERO",     1, 60],
    [36, "B11-201","Building 11",            "AERO",     2, 60],
    [37, "B11-202","Building 11",            "AERO",     2, 40],
    // CHEM — Building 9
    [38, "B9-101", "Building 9",             "CHEM",     1, 60],
    [39, "B9-201", "Building 9",             "CHEM",     2, 60],
  ].forEach(r => ins.run(...r));
  console.log("✅ Seeded 39 rooms across 10 departments");
}

// ── Auth middleware ───────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token provided" });

  // Demo tokens: "demo-teacher-prof.mehta@dsce.edu.in"
  if (token.startsWith("demo-")) {
    const withoutPrefix = token.slice(5);                          // "teacher-prof.mehta@dsce.edu.in"
    const roleEnd = withoutPrefix.indexOf("-");
    const role    = withoutPrefix.slice(0, roleEnd);               // "teacher"
    const email   = withoutPrefix.slice(roleEnd + 1);              // "prof.mehta@dsce.edu.in"
    const user    = db.prepare("SELECT * FROM users WHERE email=?").get(email);
    req.user = user || { id: null, role, email, name: email };
    return next();
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── AUTH ROUTES ───────────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    SECRET, { expiresIn: "7d" }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, dept: user.dept } });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = db.prepare("SELECT id,name,email,role,dept FROM users WHERE id=?").get(req.user.id);
  res.json(user || req.user);
});

// ── BOOKINGS ROUTES ───────────────────────────────────────────────
app.get("/api/bookings", auth, (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, r.name as room_name, r.building
    FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(rows);
});

app.post("/api/bookings", auth, (req, res) => {
  let { room_id, subject, batch, branch, date, start_time, end_time, capacity, priority } = req.body;

  if (!room_id || !subject || !batch || !branch || !date || !start_time || !end_time || !capacity)
    return res.status(400).json({ error: "Missing required fields", received: req.body });

  // ✅ Normalise room_id to integer (frontend sends number, ensure it's stored as integer)
  room_id = parseInt(room_id, 10);
  if (isNaN(room_id)) return res.status(400).json({ error: `Invalid room_id: ${req.body.room_id}` });

  const room = db.prepare("SELECT * FROM rooms WHERE id=?").get(room_id);
  if (!room) return res.status(404).json({ error: `Room id ${room_id} not found. Check dsceData.js room IDs match the database.` });

  const conflict = db.prepare(`
    SELECT * FROM bookings
    WHERE room_id=? AND date=? AND start_time < ? AND end_time > ?
  `).get(room_id, date, end_time, start_time);
  if (conflict) return res.status(409).json({
    error: `${room.name} already booked ${conflict.start_time}–${conflict.end_time} on ${date}`
  });

  const result = db.prepare(`
    INSERT INTO bookings (room_id,room_name,subject,batch,branch,date,start_time,end_time,capacity,priority,user_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(room_id, room.name, subject, batch, branch, date, start_time, end_time,
         parseInt(capacity), priority ?? 0, req.user?.id || null);

  const saved = db.prepare("SELECT * FROM bookings WHERE id=?").get(result.lastInsertRowid);
  console.log(`📅 SAVED  [${saved.id}] ${subject} | ${room.name} | ${date} ${start_time}–${end_time} | by ${req.user?.email}`);
  res.status(201).json(saved);
});

app.delete("/api/bookings/:id", auth, (req, res) => {
  const booking = db.prepare("SELECT * FROM bookings WHERE id=?").get(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  db.prepare("DELETE FROM bookings WHERE id=?").run(req.params.id);
  console.log(`🗑  DELETED [${req.params.id}] ${booking.subject}`);
  res.json({ success: true, deleted: booking });
});

// ── ROOMS ROUTES ──────────────────────────────────────────────────
app.get("/api/rooms", auth, (req, res) => {
  const { branch } = req.query;
  const rows = branch
    ? db.prepare("SELECT * FROM rooms WHERE branch=?").all(branch)
    : db.prepare("SELECT * FROM rooms").all();
  res.json(rows);
});

app.get("/api/rooms/available", auth, (req, res) => {
  const { date, start, end, branch } = req.query;
  if (!date || !start || !end) return res.status(400).json({ error: "date, start, end required" });
  const booked = db.prepare(
    "SELECT room_id FROM bookings WHERE date=? AND start_time < ? AND end_time > ?"
  ).all(date, end, start).map(r => r.room_id);
  let rooms = branch
    ? db.prepare("SELECT * FROM rooms WHERE branch=?").all(branch)
    : db.prepare("SELECT * FROM rooms").all();
  res.json(rooms.filter(r => !booked.includes(r.id)));
});

// ── HEALTH & DEBUG ────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({
  status:   "ok",
  users:    db.prepare("SELECT COUNT(*) as c FROM users").get().c,
  rooms:    db.prepare("SELECT COUNT(*) as c FROM rooms").get().c,
  bookings: db.prepare("SELECT COUNT(*) as c FROM bookings").get().c,
}));

// No-auth debug endpoint — view all bookings in browser
app.get("/api/debug/bookings", (req, res) => {
  const rows = db.prepare(`
    SELECT b.id, b.subject, b.batch, b.branch, b.room_name,
           b.date, b.start_time, b.end_time, b.capacity, b.priority,
           b.created_at, u.name as booked_by
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all();
  res.json({ total: rows.length, bookings: rows });
});

// No-auth debug — view all rooms
app.get("/api/debug/rooms", (req, res) => {
  res.json(db.prepare("SELECT * FROM rooms ORDER BY id").all());
});

app.listen(PORT, () => {
  console.log(`\n🚀  http://localhost:${PORT}`);
  console.log(`    /api/health          → DB stats`);
  console.log(`    /api/debug/bookings  → all bookings`);
  console.log(`    /api/debug/rooms     → all rooms\n`);
});