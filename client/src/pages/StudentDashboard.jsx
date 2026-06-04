import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, MapPin, User, Calendar, ChevronDown, ChevronUp, Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const STUDENT_PROFILES = [
  { email: "student@dsce.edu.in",    name: "Alex Kumar",   usn: "1DS21CS001", branch: "CSE",   sem: "4th Sem", batch: "CSE-B", year: 2 },
  { email: "sahana.p@dsce.edu.in",   name: "Sahana P",     usn: "1DS21CS045", branch: "CSE",   sem: "4th Sem", batch: "CSE-A", year: 2 },
  { email: "ram.rao@dsce.edu.in",    name: "Ram Rao",      usn: "1DS21EC012", branch: "ECE",   sem: "4th Sem", batch: "ECE-A", year: 2 },
  { email: "nisha.k@dsce.edu.in",    name: "Nisha K",      usn: "1DS21ME023", branch: "ME",    sem: "6th Sem", batch: "ME-B",  year: 3 },
  { email: "arjun.s@dsce.edu.in",    name: "Arjun Sharma", usn: "1DS22CS067", branch: "CSE",   sem: "2nd Sem", batch: "CSE-C", year: 1 },
  { email: "priya.m@dsce.edu.in",    name: "Priya Menon",  usn: "1DS21IS034", branch: "ISE",   sem: "4th Sem", batch: "ISE-A", year: 2 },
  { email: "kiran.b@dsce.edu.in",    name: "Kiran B",      usn: "1DS21CV009", branch: "Civil", sem: "6th Sem", batch: "CV-A",  year: 3 },
  { email: "divya.r@dsce.edu.in",    name: "Divya R",      usn: "1DS22EC041", branch: "ECE",   sem: "2nd Sem", batch: "ECE-B", year: 1 },
];

// Classes vary per branch
const CLASS_SCHEDULE = {
  CSE:   [
    { id:1, subject:"Data Structures",      room:"NB-101", teacher:"Dr. Mehta",   time:"09:00", end:"10:00" },
    { id:2, subject:"DBMS",                 room:"NB-203", teacher:"Prof. Sharma",time:"10:00", end:"11:00" },
    { id:3, subject:"Operating Systems",    room:"Lab-3",  teacher:"Dr. Iyer",    time:"14:00", end:"16:00" },
    { id:4, subject:"Mathematics IV",       room:"NB-105", teacher:"Prof. Nair",  time:"11:00", end:"12:00" },
  ],
  ECE:   [
    { id:1, subject:"Signals & Systems",    room:"OB-201", teacher:"Dr. Kamath",  time:"09:00", end:"10:00" },
    { id:2, subject:"VLSI Design",          room:"OB-104", teacher:"Prof. Rao",   time:"10:00", end:"11:00" },
    { id:3, subject:"Microprocessors Lab",  room:"Lab-5",  teacher:"Dr. Shetty",  time:"14:00", end:"16:00" },
  ],
  ME:    [
    { id:1, subject:"Thermodynamics",       room:"MB-301", teacher:"Prof. Kumar", time:"09:00", end:"10:00" },
    { id:2, subject:"Fluid Mechanics",      room:"MB-205", teacher:"Dr. Pillai",  time:"11:00", end:"12:00" },
    { id:3, subject:"CAD/CAM Lab",          room:"ML-2",   teacher:"Prof. Hegde", time:"14:00", end:"16:00" },
  ],
  ISE:   [
    { id:1, subject:"Software Engineering", room:"NB-102", teacher:"Dr. Patel",   time:"09:00", end:"10:00" },
    { id:2, subject:"Web Technologies",     room:"NB-204", teacher:"Prof. Nair",  time:"10:00", end:"11:00" },
    { id:3, subject:"IS Lab",               room:"Lab-4",  teacher:"Dr. Mehta",   time:"14:00", end:"16:00" },
  ],
  Civil: [
    { id:1, subject:"Structural Analysis",  room:"CB-101", teacher:"Dr. Naik",    time:"09:00", end:"10:00" },
    { id:2, subject:"Geotechnical Engg",    room:"CB-202", teacher:"Prof. Soni",  time:"11:00", end:"12:00" },
    { id:3, subject:"Survey Lab",           room:"SL-1",   teacher:"Dr. Bhat",    time:"14:00", end:"17:00" },
  ],
};

const NOTIFICATIONS = [
  { id:1, type:"info",    text:"Room NB-203 changed to NB-205 for tomorrow's DBMS class", time:"2h ago" },
  { id:2, type:"success", text:"Room booking confirmed for CSE-B batch — Data Structures, 04 Jun", time:"5h ago" },
  { id:3, type:"warning", text:"OS Lab shifted to Lab-2 on Wednesday due to maintenance", time:"1d ago" },
];

function getStatus(startHHMM, endHHMM) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  const st = sh * 60 + sm;
  const en = eh * 60 + em;
  if (cur >= st && cur < en) return "ongoing";
  if (cur < st) return "upcoming";
  return "completed";
}

const statusStyle = {
  ongoing:   "bg-green-100 text-green-700 border border-green-200",
  upcoming:  "bg-blue-50 text-blue-600 border border-blue-100",
  completed: "bg-slate-100 text-slate-500 border border-slate-200",
};

function AttendanceBar({ pct, label }) {
  const color = pct >= 85 ? "bg-green-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium truncate pr-2">{label}</span>
        <span className={`font-bold ${pct>=85?"text-green-600":pct>=75?"text-amber-600":"text-red-600"}`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width:`${pct}%` }} />
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [loading,       setLoading]       = useState(true);

  // ✅ Read logged-in user from localStorage
  useEffect(() => { setTimeout(() => setLoading(false), 400); }, []);

  const storedUser  = JSON.parse(localStorage.getItem("user") || "{}");
  const loginEmail  = (storedUser.email || "").toLowerCase();
  const loginName   = storedUser.name || "Student";

  const profile = STUDENT_PROFILES.find(p => p.email.toLowerCase() === loginEmail) || {
    name: loginName, usn: "1DS21CS000", branch: "CSE", sem: "4th Sem", batch: "CSE-A", year: 2,
  };
  const student = { ...profile, name: loginName };
  const classes = CLASS_SCHEDULE[student.branch] || CLASS_SCHEDULE.CSE;

  const ongoingClass  = classes.find(c => getStatus(c.time, c.end) === "ongoing");
  const upcomingCount = classes.filter(c => getStatus(c.time, c.end) === "upcoming").length;

  // Fake attendance based on branch + name (deterministic)
  const seed = student.usn.charCodeAt(student.usn.length - 1);
  const attendance = classes.map((c, i) => ({
    subject: c.subject,
    pct: Math.min(98, 72 + ((seed + i * 7) % 26)),
  }));
  const avgAttendance = Math.round(attendance.reduce((s, a) => s + a.pct, 0) / attendance.length);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={24} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white shadow-lg overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -right-4 -bottom-12 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-xl bg-blue-800">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}&backgroundColor=1d4ed8&fontFamily=Arial`}
              alt={student.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-2xl font-black">${student.name.charAt(0)}</div>`;
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs mb-0.5 uppercase tracking-wider">Welcome back</p>
            <h1 className="text-2xl font-black truncate">{student.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <User size={10} /> {student.usn}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <BookOpen size={10} /> {student.batch}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <Calendar size={10} /> {student.sem}
              </span>
            </div>
          </div>

          {/* Attendance ring */}
          <div className="hidden sm:flex flex-col items-center flex-shrink-0">
            <div className={`text-3xl font-black ${avgAttendance>=85?"text-green-300":avgAttendance>=75?"text-amber-300":"text-red-300"}`}>
              {avgAttendance}%
            </div>
            <p className="text-blue-200 text-xs mt-0.5">Attendance</p>
          </div>
        </div>

        {/* Ongoing class banner */}
        {ongoingClass && (
          <div className="relative mt-4 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <p className="text-sm text-white font-semibold">
              Ongoing: <span className="font-black">{ongoingClass.subject}</span>
            </p>
            <span className="ml-auto text-xs text-blue-200 flex items-center gap-1">
              <MapPin size={10} /> {ongoingClass.room}
            </span>
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:"Classes Today",    value: classes.length,  color:"bg-blue-50  text-blue-700"   },
          { label:"Upcoming",         value: upcomingCount,   color:"bg-sky-50   text-sky-700"    },
          { label:"Avg Attendance",   value: `${avgAttendance}%`,
            color: avgAttendance>=85?"bg-green-50 text-green-700":avgAttendance>=75?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <p className={`text-2xl font-black px-3 py-1 rounded-lg inline-block mb-1 ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Today's Classes (2/3 width) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Today's Classes</h2>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
              {new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}
            </span>
          </div>

          <div className="space-y-2">
            {classes.map(cls => {
              const status  = getStatus(cls.time, cls.end);
              const isOpen  = selectedClass?.id === cls.id;
              const fmt = (t) => {
                const [h, m] = t.split(":").map(Number);
                const ampm = h >= 12 ? "PM" : "AM";
                return `${h > 12 ? h-12 : h || 12}:${m.toString().padStart(2,"0")} ${ampm}`;
              };
              return (
                <div key={cls.id}
                  onClick={() => setSelectedClass(isOpen ? null : cls)}
                  className={`rounded-xl border cursor-pointer transition-all
                    ${isOpen ? "border-blue-200 bg-blue-50/50" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"}`}>
                  <div className="flex items-center gap-3 p-3.5">
                    {/* Time column */}
                    <div className="text-center w-14 flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">{fmt(cls.time)}</p>
                      <p className="text-xs text-slate-400">{fmt(cls.end)}</p>
                    </div>

                    <div className="w-px h-8 bg-slate-100 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{cls.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{cls.teacher}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle[status]}`}>
                        {status}
                      </span>
                      {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2 border-t border-blue-100">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin size={10}/> Room</p>
                        <p className="font-bold text-slate-800 text-sm">{cls.room}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock size={10}/> Duration</p>
                        <p className="font-bold text-slate-800 text-sm">{fmt(cls.time)} – {fmt(cls.end)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100 col-span-2">
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><User size={10}/> Instructor</p>
                        <p className="font-bold text-slate-800 text-sm">{cls.teacher}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Attendance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Subject Attendance</h3>
            <div className="space-y-3">
              {attendance.map(a => <AttendanceBar key={a.subject} pct={a.pct} label={a.subject} />)}
            </div>
            {avgAttendance < 75 && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600">Attendance below 75% — at risk of detain</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              </div>
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                {NOTIFICATIONS.length}
              </span>
            </div>
            <div className="space-y-2">
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className={`flex gap-2.5 p-2.5 rounded-xl text-xs
                  ${n.type==="info"    ? "bg-blue-50 text-blue-800"
                  : n.type==="success" ? "bg-green-50 text-green-800"
                  :                     "bg-amber-50 text-amber-800"}`}>
                  {n.type==="success"
                    ? <CheckCircle size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                    : n.type==="warning"
                    ? <AlertCircle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    : <Bell size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="leading-snug">{n.text}</p>
                    <p className="opacity-60 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}