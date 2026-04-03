import { useState, useEffect } from "react";
import {
  CalendarDays, Users, Building2, Plus, Undo2,
  AlertTriangle, CheckCircle2, ChevronDown, BarChart3,
  Trash2, BookOpen, TrendingUp, X, Loader2
} from "lucide-react";

// ─── Mock data (swap these with real API calls later) ────────
const MOCK_ROOMS = [
  { id: "r1", name: "A101", capacity: 30,  building: "Block A", floor: 1 },
  { id: "r2", name: "A102", capacity: 45,  building: "Block A", floor: 1 },
  { id: "r3", name: "B201", capacity: 60,  building: "Block B", floor: 2 },
  { id: "r4", name: "B202", capacity: 80,  building: "Block B", floor: 2 },
  { id: "r5", name: "C301", capacity: 100, building: "Block C", floor: 3 },
  { id: "r6", name: "D401", capacity: 25,  building: "Block D", floor: 4 },
];

const MOCK_BOOKINGS = [
  { id: "b1", room: "A101", roomId: "r1", subject: "Data Structures", teacher: "Prof. Mehta",   batch: "CS-3A", start: "09:00", end: "10:00", date: "2024-01-15", priority: 0, capacity: 28 },
  { id: "b2", room: "B201", roomId: "r3", subject: "DBMS",            teacher: "Prof. Sharma",  batch: "CS-2B", start: "10:00", end: "11:00", date: "2024-01-15", priority: 0, capacity: 55 },
  { id: "b3", room: "C301", roomId: "r5", subject: "Seminar",         teacher: "Dr. Kapoor",    batch: "All",   start: "11:00", end: "13:00", date: "2024-01-15", priority: 0, capacity: 90 },
  { id: "b4", room: "D401", roomId: "r6", subject: "OS Lab",          teacher: "Prof. Reddy",   batch: "CS-1C", start: "14:00", end: "16:00", date: "2024-01-15", priority: 0, capacity: 24 },
  { id: "b5", room: "A102", roomId: "r2", subject: "Study Group",     teacher: "Student",        batch: "CS-4A", start: "15:00", end: "16:00", date: "2024-01-15", priority: 1, capacity: 20 },
];

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const today = new Date().toISOString().split("T")[0];

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Conflict / Success Toast ─────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm
      ${isError ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
      {isError
        ? <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
        : <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />}
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
      </div>
      <button onClick={onClose} className="opacity-50 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ─── Booking Form ─────────────────────────────────────────────
function BookingForm({ rooms, onBook }) {
  const [form, setForm] = useState({
    subject: "", batch: "", roomId: "", date: today,
    start: "09:00", end: "10:00", capacity: "", priority: 0,
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.batch || !form.capacity || !form.date) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API call
    onBook(form);
    setForm({ subject: "", batch: "", roomId: "", date: today, start: "09:00", end: "10:00", capacity: "", priority: 0 });
    setLoading(false);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Plus size={16} className="text-white" />
        </div>
        <h2 className="text-base font-bold text-slate-800">New Booking</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Subject */}
        <div className="col-span-2">
          <label className={labelCls}>Subject / Purpose</label>
          <input className={inputCls} placeholder="e.g. Data Structures Lecture"
            value={form.subject} onChange={(e) => set("subject", e.target.value)} required />
        </div>

        {/* Batch */}
        <div>
          <label className={labelCls}>Batch / Section</label>
          <input className={inputCls} placeholder="e.g. CS-3A"
            value={form.batch} onChange={(e) => set("batch", e.target.value)} required />
        </div>

        {/* Capacity */}
        <div>
          <label className={labelCls}>Students</label>
          <input className={inputCls} type="number" placeholder="No. of students" min="1"
            value={form.capacity} onChange={(e) => set("capacity", e.target.value)} required />
        </div>

        {/* Room selector */}
        <div className="col-span-2">
          <label className={labelCls}>Preferred Room <span className="normal-case font-normal text-slate-400">(optional — greedy picks best fit)</span></label>
          <div className="relative">
            <select className={`${inputCls} appearance-none pr-8`}
              value={form.roomId} onChange={(e) => set("roomId", e.target.value)}>
              <option value="">Auto-assign best fit</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.building} ({r.capacity} seats)</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className={labelCls}>Date</label>
          <input className={inputCls} type="date"
            value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </div>

        {/* Time range */}
        <div>
          <label className={labelCls}>Time Slot</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select className={`${inputCls} appearance-none pr-6`}
                value={form.start} onChange={(e) => set("start", e.target.value)}>
                {TIME_SLOTS.slice(0, -1).map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-3.5 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-slate-400 text-sm">to</span>
            <div className="relative flex-1">
              <select className={`${inputCls} appearance-none pr-6`}
                value={form.end} onChange={(e) => set("end", e.target.value)}>
                {TIME_SLOTS.slice(1).map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Priority toggle */}
        <div className="col-span-2">
          <label className={labelCls}>Booking Priority</label>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button type="button"
              onClick={() => set("priority", 0)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${form.priority === 0 ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <BookOpen size={14} /> Faculty
            </button>
            <button type="button"
              onClick={() => set("priority", 1)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${form.priority === 1 ? "bg-amber-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <Users size={14} /> Student
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {form.priority === 0 ? "Faculty bookings are served first by the priority queue." : "Student bookings enter the queue behind faculty requests."}
          </p>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={15} className="animate-spin" /> Allocating Room…</> : <><Plus size={15} /> Book Room</>}
      </button>
    </form>
  );
}

// ─── Active Bookings List ─────────────────────────────────────
function BookingsList({ bookings, onUndo, onDelete }) {
  const priorityBadge = (p) => p === 0
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">Faculty</span>
    : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Student</span>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
            <CalendarDays size={15} className="text-white" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Active Bookings</h2>
        </div>
        <button onClick={onUndo}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition">
          <Undo2 size={13} /> Undo Last
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
          <CalendarDays size={32} className="mb-2 opacity-30" />
          <p className="text-sm">No bookings yet today</p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
          {bookings.map((b, i) => (
            <div key={b.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition group
                ${i === bookings.length - 1 ? "border-indigo-200 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"}`}>
              {/* Time column */}
              <div className="text-center min-w-[52px]">
                <p className="text-xs font-bold text-slate-700">{b.start}</p>
                <div className="w-px h-3 bg-slate-300 mx-auto my-0.5" />
                <p className="text-xs text-slate-400">{b.end}</p>
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{b.subject}</p>
                  {priorityBadge(b.priority)}
                  {i === bookings.length - 1 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-600 text-white font-medium">Latest</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Building2 size={11} />{b.room}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{b.batch}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{b.capacity} students</span>
                </div>
              </div>
              {/* Delete button */}
              <button onClick={() => onDelete(b.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Room Availability Grid ───────────────────────────────────
function RoomGrid({ rooms, bookings, selectedDate }) {
  const getBooking = (roomId, slot) => {
    return bookings.find((b) =>
      b.roomId === roomId &&
      b.date === selectedDate &&
      b.start <= slot && slot < b.end
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <BarChart3 size={15} className="text-white" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Room Availability Grid</h2>
        <span className="ml-auto text-xs text-slate-400 font-medium">{selectedDate}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 text-slate-500 font-semibold w-24">Room</th>
              {TIME_SLOTS.slice(0, -1).map((slot) => (
                <th key={slot} className="text-center py-2 px-1 text-slate-400 font-medium min-w-[68px]">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-slate-50">
                <td className="py-2 pr-4">
                  <p className="font-bold text-slate-700">{room.name}</p>
                  <p className="text-slate-400">{room.capacity} seats</p>
                </td>
                {TIME_SLOTS.slice(0, -1).map((slot) => {
                  const booking = getBooking(room.id, slot);
                  return (
                    <td key={slot} className="px-0.5 py-1">
                      {booking ? (
                        <div className={`rounded-lg px-1.5 py-1.5 text-center leading-tight
                          ${booking.priority === 0 ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                          <p className="font-semibold truncate max-w-[60px]">{booking.subject}</p>
                          <p className="opacity-70">{booking.batch}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 text-center py-1.5">
                          <span className="text-emerald-500 font-medium">Free</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" />
          <span className="text-xs text-slate-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-indigo-100" />
          <span className="text-xs text-slate-500">Faculty booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-100" />
          <span className="text-xs text-slate-500">Student booked</span>
        </div>
      </div>
    </div>
  );
}

// ─── Utilisation Bar ─────────────────────────────────────────
function UtilisationBar({ rooms, bookings }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <TrendingUp size={15} className="text-white" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Room Utilisation</h2>
        <span className="ml-auto text-xs text-slate-400">Today</span>
      </div>
      <div className="space-y-3">
        {rooms.map((room) => {
          const roomBookings = bookings.filter((b) => b.roomId === room.id);
          const bookedSlots  = roomBookings.length;
          const totalSlots   = TIME_SLOTS.length - 1; // 9 slots
          const pct          = Math.round((bookedSlots / totalSlots) * 100);
          return (
            <div key={room.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{room.name}
                  <span className="text-xs text-slate-400 ml-1.5">{room.building}</span>
                </span>
                <span className="text-xs font-bold text-slate-600">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700
                    ${pct > 70 ? "bg-red-400" : pct > 40 ? "bg-amber-400" : "bg-emerald-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function TeacherDashboard() {
  const [bookings,      setBookings]      = useState(MOCK_BOOKINGS);
  const [rooms]                           = useState(MOCK_ROOMS);
  const [toast,         setToast]         = useState(null);
  const [selectedDate,  setSelectedDate]  = useState(today);

  const showToast = (type, title, message) => setToast({ type, title, message });

  // Simulate greedy allocation + conflict check
  const handleBook = (form) => {
    // Check for conflict (simplified client-side check; real check is in interval tree on server)
    const conflict = bookings.find(
      (b) =>
        b.roomId === form.roomId &&
        b.date   === form.date   &&
        b.start  <  form.end     &&
        form.start < b.end
    );

    if (conflict) {
      showToast("error", "Booking Conflict Detected",
        `${conflict.room} is already booked (${conflict.start}–${conflict.end}) by ${conflict.batch}.`);
      return;
    }

    // Greedy: find smallest room that fits if no preference
    let assignedRoom = rooms.find((r) => r.id === form.roomId);
    if (!assignedRoom) {
      const sorted = [...rooms].sort((a, b) => a.capacity - b.capacity);
      assignedRoom = sorted.find((r) => r.capacity >= parseInt(form.capacity, 10));
    }

    if (!assignedRoom) {
      showToast("error", "No Room Available",
        `No room can fit ${form.capacity} students. Check capacity or split the group.`);
      return;
    }

    const newBooking = {
      id:       `b${Date.now()}`,
      room:     assignedRoom.name,
      roomId:   assignedRoom.id,
      subject:  form.subject,
      teacher:  "Prof. (You)",
      batch:    form.batch,
      start:    form.start,
      end:      form.end,
      date:     form.date,
      priority: form.priority,
      capacity: parseInt(form.capacity, 10),
    };

    setBookings((prev) => [...prev, newBooking]);
    showToast("success", "Room Allocated Successfully",
      `${assignedRoom.name} (${assignedRoom.capacity} seats) assigned for ${form.subject} — ${form.start} to ${form.end}.`);
  };

  const handleUndo = () => {
    if (bookings.length === 0) {
      showToast("error", "Nothing to Undo", "The booking history is empty.");
      return;
    }
    const last = bookings[bookings.length - 1];
    setBookings((prev) => prev.slice(0, -1));
    showToast("success", "Booking Undone", `Removed: ${last.subject} in ${last.room}.`);
  };

  const handleDelete = (id) => {
    const b = bookings.find((x) => x.id === id);
    setBookings((prev) => prev.filter((x) => x.id !== id));
    showToast("success", "Booking Cancelled", `${b?.subject} in ${b?.room} has been removed.`);
  };

  const todayBookings = bookings.filter((b) => b.date === today);
  const totalSeats    = rooms.reduce((s, r) => s + r.capacity, 0);
  const bookedSeats   = bookings.reduce((s, b) => s + b.capacity, 0);
  const utilPct       = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Teacher Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Smart Classroom Allocation System</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={15} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-8 py-7 space-y-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Building2}   label="Total Rooms"      value={rooms.length}          color="bg-indigo-500" />
          <StatCard icon={CalendarDays} label="Today's Bookings" value={todayBookings.length}  color="bg-slate-700"  sub={`${bookings.length} all-time`} />
          <StatCard icon={Users}        label="Seats in Use"     value={bookedSeats}           color="bg-amber-500"  sub={`of ${totalSeats} total`} />
          <StatCard icon={TrendingUp}   label="Utilisation"      value={`${utilPct}%`}         color="bg-emerald-500" />
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Booking form — 2 cols */}
          <div className="lg:col-span-2">
            <BookingForm rooms={rooms} onBook={handleBook} />
          </div>

          {/* Active bookings — 3 cols */}
          <div className="lg:col-span-3">
            <BookingsList
              bookings={bookings}
              onUndo={handleUndo}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* ── Bottom 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Utilisation bars — 1 col */}
          <div className="lg:col-span-1">
            <UtilisationBar rooms={rooms} bookings={bookings} />
          </div>

          {/* Room grid — 2 cols */}
          <div className="lg:col-span-2">
            <RoomGrid rooms={rooms} bookings={bookings} selectedDate={selectedDate} />
          </div>
        </div>

      </main>
    </div>
  );
}