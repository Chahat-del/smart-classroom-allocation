import { useState } from "react";
import {
  Plus, Undo2, Trash2, Search,
  ChevronDown, Building2, Users, Loader2,
  CheckCircle2, AlertTriangle, X, CalendarDays
} from "lucide-react";
import TeacherLayout from "../components/TeacherLayout";
import { BRANCH_DATA, COLOR_MAP, TIME_SLOTS, today } from "../data/dsceData";

// Simple in-memory store
let _bookings = [];
let _listeners = [];
const store = {
  get: () => _bookings,
  add: (b) => { _bookings = [..._bookings, b]; _listeners.forEach(fn => fn()); },
  remove: (id) => { _bookings = _bookings.filter(b => b.id !== id); _listeners.forEach(fn => fn()); },
  undo: () => { if (_bookings.length) { _bookings = _bookings.slice(0,-1); _listeners.forEach(fn => fn()); return true; } return false; },
  subscribe: (fn) => { _listeners.push(fn); return () => { _listeners = _listeners.filter(l => l !== fn); }; },
};
export { store as bookingStore };

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border max-w-sm
      ${isErr ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
      {isErr ? <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
             : <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />}
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
      </div>
      <button onClick={onClose}><X size={13} className="opacity-40 hover:opacity-70" /></button>
    </div>
  );
}

function BookingForm({ onBook }) {
  const [branch, setBranch]   = useState("CSE");
  const [form,   setForm]     = useState({ subject:"", batch:"", roomId:"", date:today, start:"09:00", end:"10:00", capacity:"", priority:0 });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const branchInfo = BRANCH_DATA[branch];
  const c = COLOR_MAP[branchInfo.color];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r,500));
    onBook({...form, branch, buildingShort: branchInfo.short});
    setForm({ subject:"", batch:"", roomId:"", date:today, start:"09:00", end:"10:00", capacity:"", priority:0 });
    setLoading(false);
  };

  const inp = `w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition placeholder:text-slate-300`;
  const lbl = `block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2`;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit">
      <h2 className="font-bold text-slate-800 mb-5">New Booking</h2>

      {/* Department */}
      <div className="mb-4">
        <label className={lbl}>Department</label>
        <div className="relative">
          <select className={`${inp} appearance-none pr-8`}
            value={branch} onChange={e => { setBranch(e.target.value); set("roomId",""); }}>
            {Object.entries(BRANCH_DATA).map(([k,v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg w-fit ${c.bg} ${c.text}`}>
          <Building2 size={11} /> {branchInfo.building}
        </div>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label className={lbl}>Subject / Purpose</label>
        <input className={inp} placeholder="e.g. Data Structures Lecture"
          value={form.subject} onChange={e=>set("subject",e.target.value)} required />
      </div>

      {/* Batch + Capacity */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={lbl}>Batch</label>
          <input className={inp} placeholder="e.g. CS-3A"
            value={form.batch} onChange={e=>set("batch",e.target.value)} required />
        </div>
        <div>
          <label className={lbl}>Students</label>
          <input className={inp} type="number" min="1" placeholder="Count"
            value={form.capacity} onChange={e=>set("capacity",e.target.value)} required />
        </div>
      </div>

      {/* Room */}
      <div className="mb-4">
        <label className={lbl}>Room <span className="normal-case font-normal text-slate-400">(auto if blank)</span></label>
        <div className="relative">
          <select className={`${inp} appearance-none pr-8`}
            value={form.roomId} onChange={e=>set("roomId",e.target.value)}>
            <option value="">Auto — Best Fit</option>
            {branchInfo.rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name} · Floor {r.floor} · {r.capacity} seats</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className={lbl}>Date</label>
        <input className={inp} type="date" value={form.date} onChange={e=>set("date",e.target.value)} required />
      </div>

      {/* Time */}
      <div className="mb-4">
        <label className={lbl}>Time Slot</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select className={`${inp} appearance-none pr-7`}
              value={form.start} onChange={e=>set("start",e.target.value)}>
              {TIME_SLOTS.slice(0,-1).map(t=><option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-slate-300 text-sm">→</span>
          <div className="relative flex-1">
            <select className={`${inp} appearance-none pr-7`}
              value={form.end} onChange={e=>set("end",e.target.value)}>
              {TIME_SLOTS.slice(1).map(t=><option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Priority */}
      <div className="mb-5">
        <label className={lbl}>Priority</label>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <button type="button" onClick={()=>set("priority",0)}
            className={`flex-1 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5
              ${form.priority===0 ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
            Faculty
          </button>
          <button type="button" onClick={()=>set("priority",1)}
            className={`flex-1 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-1.5
              ${form.priority===1 ? "bg-amber-500 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
            Student
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Allocating…</> : <><Plus size={14} /> Book Room</>}
      </button>
    </form>
  );
}

export default function TeacherBookingsPage() {
  const [bookings, setBookings]   = useState(() => store.get());
  const [toast,    setToast]      = useState(null);
  const [search,   setSearch]     = useState("");
  const [filter,   setFilter]     = useState("all"); // all | today | faculty | student

  const showToast = (type, title, message) => setToast({type, title, message});

  const handleBook = (form) => {
    const branchInfo = BRANCH_DATA[form.branch];
    const conflict = store.get().find(b =>
      b.roomId === form.roomId && form.roomId !== "" &&
      b.date === form.date && b.start < form.end && form.start < b.end
    );
    if (conflict) {
      showToast("error", "Conflict Detected", `${conflict.room} is booked from ${conflict.start}–${conflict.end}`);
      return;
    }
    let room = branchInfo.rooms.find(r => r.id === form.roomId);
    if (!room) {
      const needed   = parseInt(form.capacity,10);
      const sorted   = [...branchInfo.rooms].sort((a,b) => a.capacity - b.capacity);
      const available = sorted.filter(r => !store.get().some(b =>
        b.roomId===r.id && b.date===form.date && b.start<form.end && form.start<b.end));
      room = available.find(r => r.capacity >= needed);
    }
    if (!room) {
      showToast("error", "No Room Available", `All rooms in ${branchInfo.building} are booked or too small.`);
      return;
    }
    const newBooking = {
      id:`b${Date.now()}`, room:room.name, roomId:room.id,
      subject:form.subject, batch:form.batch,
      start:form.start, end:form.end, date:form.date,
      priority:form.priority, capacity:parseInt(form.capacity,10),
      branch:form.branch, building:branchInfo.building,
    };
    store.add(newBooking);
    setBookings(store.get());
    showToast("success", "Room Allocated", `${room.name} assigned for ${form.subject} · ${form.start}–${form.end}`);
  };

  const handleDelete = (id) => {
    const b = store.get().find(x=>x.id===id);
    store.remove(id); setBookings(store.get());
    showToast("success","Booking Removed", `${b?.subject} in ${b?.room} cancelled.`);
  };

  const handleUndo = () => {
    const last = store.get().slice(-1)[0];
    if (store.undo()) { setBookings(store.get()); showToast("success","Undone",`Removed: ${last?.subject}`); }
    else showToast("error","Nothing to Undo","Booking history is empty.");
  };

  const filtered = bookings
    .filter(b => filter==="all"    ? true
               : filter==="today"  ? b.date===today
               : filter==="faculty"? b.priority===0
               : b.priority===1)
    .filter(b => search==="" ? true
      : b.subject.toLowerCase().includes(search.toLowerCase()) ||
        b.room.toLowerCase().includes(search.toLowerCase()) ||
        b.batch.toLowerCase().includes(search.toLowerCase()));

  return (
    <TeacherLayout>
      <Toast toast={toast} onClose={()=>setToast(null)} />
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and create classroom bookings</p>
          </div>
          <button onClick={handleUndo}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:border-slate-300 px-4 py-2 rounded-xl shadow-sm transition">
            <Undo2 size={14} /> Undo Last
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form */}
          <div className="lg:col-span-2">
            <BookingForm onBook={handleBook} />
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

              {/* Toolbar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Search bookings…" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 border border-slate-200 rounded-xl overflow-hidden">
                  {["all","today","faculty","student"].map(f => (
                    <button key={f} onClick={()=>setFilter(f)}
                      className={`px-3 py-2 text-xs font-semibold transition capitalize
                        ${filter===f ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600 bg-white"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div className="px-5 py-3 border-b border-slate-50">
                <p className="text-xs text-slate-400 font-medium">{filtered.length} booking{filtered.length!==1?"s":""}</p>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {filtered.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarDays size={28} className="mb-2 opacity-20" />
                    <p className="text-sm">No bookings found</p>
                  </div>
                ) : (
                  [...filtered].reverse().map((b) => {
                    const branchInfo = BRANCH_DATA[b.branch];
                    const c = branchInfo ? COLOR_MAP[branchInfo.color] : COLOR_MAP.indigo;
                    return (
                      <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition group">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-slate-800 truncate">{b.subject}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.badge}`}>{b.branch}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                              ${b.priority===0 ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>
                              {b.priority===0?"Faculty":"Student"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Building2 size={10}/>{b.room}</span>
                            <span className="flex items-center gap-1"><Users size={10}/>{b.batch} · {b.capacity} students</span>
                            <span>{b.date} · {b.start}–{b.end}</span>
                          </div>
                        </div>
                        <button onClick={()=>handleDelete(b.id)}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}