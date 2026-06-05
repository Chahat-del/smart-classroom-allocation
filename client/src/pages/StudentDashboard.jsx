import React, { useState, useEffect } from 'react';
import {
  BookOpen, Clock, MapPin, User, Calendar,
  ChevronDown, ChevronUp, Bell, CheckCircle,
  AlertCircle, Loader2, TrendingUp, Zap, GraduationCap
} from 'lucide-react';

const STUDENT_PROFILES = [
  { email: "student@dsce.edu.in",  name: "Alex Kumar",   usn: "1DS21CS001", branch: "CSE",   sem: "4th Sem", batch: "CSE-B", year: 2 },
  { email: "sahana.p@dsce.edu.in", name: "Sahana P",     usn: "1DS21CS045", branch: "CSE",   sem: "4th Sem", batch: "CSE-A", year: 2 },
  { email: "ram.rao@dsce.edu.in",  name: "Ram Rao",      usn: "1DS21EC012", branch: "ECE",   sem: "4th Sem", batch: "ECE-A", year: 2 },
  { email: "nisha.k@dsce.edu.in",  name: "Nisha K",      usn: "1DS21ME023", branch: "ME",    sem: "6th Sem", batch: "ME-B",  year: 3 },
  { email: "arjun.s@dsce.edu.in",  name: "Arjun Sharma", usn: "1DS22CS067", branch: "CSE",   sem: "2nd Sem", batch: "CSE-C", year: 1 },
  { email: "priya.m@dsce.edu.in",  name: "Priya Menon",  usn: "1DS21IS034", branch: "ISE",   sem: "4th Sem", batch: "ISE-A", year: 2 },
  { email: "kiran.b@dsce.edu.in",  name: "Kiran B",      usn: "1DS21CV009", branch: "Civil", sem: "6th Sem", batch: "CV-A",  year: 3 },
  { email: "divya.r@dsce.edu.in",  name: "Divya R",      usn: "1DS22EC041", branch: "ECE",   sem: "2nd Sem", batch: "ECE-B", year: 1 },
];

const CLASS_SCHEDULE = {
  CSE:   [
    { id:1, subject:"Data Structures",      room:"NB-101", teacher:"Dr. A M Prasad",    time:"09:00", end:"10:00" },
    { id:2, subject:"DBMS",                 room:"NB-203", teacher:"Dr. Anupama Girish", time:"10:00", end:"11:00" },
    { id:3, subject:"Mathematics IV",       room:"NB-105", teacher:"Prof. Nair",         time:"11:00", end:"12:00" },
    { id:4, subject:"Operating Systems",    room:"Lab-3",  teacher:"Dr. Annapoorna BR",  time:"14:00", end:"16:00" },
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
    { id:1, subject:"Software Engineering", room:"NB-102", teacher:"Dr. Patel",  time:"09:00", end:"10:00" },
    { id:2, subject:"Web Technologies",     room:"NB-204", teacher:"Prof. Nair", time:"10:00", end:"11:00" },
    { id:3, subject:"IS Lab",               room:"Lab-4",  teacher:"Dr. Mehta",  time:"14:00", end:"16:00" },
  ],
  Civil: [
    { id:1, subject:"Structural Analysis",  room:"CB-101", teacher:"Dr. Naik",   time:"09:00", end:"10:00" },
    { id:2, subject:"Geotechnical Engg",    room:"CB-202", teacher:"Prof. Soni", time:"11:00", end:"12:00" },
    { id:3, subject:"Survey Lab",           room:"SL-1",   teacher:"Dr. Bhat",   time:"14:00", end:"17:00" },
  ],
};

const NOTIFICATIONS = [
  { id:1, type:"info",    text:"Room NB-203 changed to NB-205 for tomorrow's DBMS class",         time:"2h ago" },
  { id:2, type:"success", text:"Room booking confirmed for CSE-B batch — Data Structures, 04 Jun", time:"5h ago" },
  { id:3, type:"warning", text:"OS Lab shifted to Lab-2 on Wednesday due to maintenance",          time:"1d ago" },
];

function getStatus(startHHMM, endHHMM) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  const st = sh * 60 + sm, en = eh * 60 + em;
  if (cur >= st && cur < en) return "ongoing";
  if (cur < st) return "upcoming";
  return "completed";
}

const fmt = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h > 12 ? h-12 : h || 12}:${m.toString().padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function StudentDashboard() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState("schedule");

  useEffect(() => { setTimeout(() => setLoading(false), 400); }, []);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loginEmail = (storedUser.email || "").toLowerCase();
  const loginName  = storedUser.name || "Student";

  const profile = STUDENT_PROFILES.find(p => p.email.toLowerCase() === loginEmail) || {
    name: loginName, usn: "1DS21CS000", branch: "CSE", sem: "4th Sem", batch: "CSE-A", year: 2,
  };
  const student = { ...profile, name: loginName };
  const classes = CLASS_SCHEDULE[student.branch] || CLASS_SCHEDULE.CSE;

  const ongoingClass  = classes.find(c => getStatus(c.time, c.end) === "ongoing");
  const upcomingClasses = classes.filter(c => getStatus(c.time, c.end) === "upcoming");
  const completedCount  = classes.filter(c => getStatus(c.time, c.end) === "completed").length;

  const seed = student.usn.charCodeAt(student.usn.length - 1);
  const attendance = classes.map((c, i) => ({
    subject: c.subject, pct: Math.min(98, 72 + ((seed + i * 7) % 26)),
  }));
  const avgAttendance = Math.round(attendance.reduce((s,a) => s+a.pct, 0) / attendance.length);
  const initials = student.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)" }}>

          {/* Background pattern */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 40%)",
            }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }} />

          <div className="relative p-6">
            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 border-2 border-indigo-400/40 flex items-center justify-center flex-shrink-0 shadow-xl">
                <span className="text-white text-xl font-black tracking-tight">{initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
                <h1 className="text-white text-2xl font-bold truncate">{student.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { icon: User,        text: student.usn   },
                    { icon: BookOpen,    text: student.batch  },
                    { icon: Calendar,    text: student.sem    },
                    { icon: GraduationCap, text: student.branch },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="inline-flex items-center gap-1 bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg text-xs font-semibold text-white/80">
                      <Icon size={10} className="text-indigo-300" /> {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attendance ring */}
              <div className="hidden sm:flex flex-col items-center flex-shrink-0 bg-white/10 border border-white/15 rounded-2xl px-5 py-3">
                <p className={`text-3xl font-black ${avgAttendance>=85?"text-emerald-300":avgAttendance>=75?"text-amber-300":"text-red-300"}`}>
                  {avgAttendance}%
                </p>
                <p className="text-indigo-300 text-xs mt-0.5 font-medium">Attendance</p>
              </div>
            </div>

            {/* Ongoing class pill */}
            {ongoingClass ? (
              <div className="mt-4 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <p className="text-sm text-white font-semibold">
                  Now in session: <span className="text-emerald-300 font-bold">{ongoingClass.subject}</span>
                </p>
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-300">
                  <MapPin size={10}/> {ongoingClass.room}
                </span>
              </div>
            ) : upcomingClasses.length > 0 ? (
              <div className="mt-4 flex items-center gap-3 bg-indigo-500/15 border border-indigo-400/30 rounded-xl px-4 py-2.5">
                <Zap size={14} className="text-indigo-300 flex-shrink-0" />
                <p className="text-sm text-white font-semibold">
                  Next: <span className="text-indigo-300 font-bold">{upcomingClasses[0].subject}</span>
                  <span className="text-white/50 ml-2 font-normal">at {fmt(upcomingClasses[0].time)}</span>
                </p>
                <span className="ml-auto flex items-center gap-1 text-xs text-indigo-300">
                  <MapPin size={10}/> {upcomingClasses[0].room}
                </span>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 bg-slate-500/15 border border-slate-400/30 rounded-xl px-4 py-2.5">
                <CheckCircle size={14} className="text-slate-300 flex-shrink-0" />
                <p className="text-sm text-white/70 font-medium">All classes done for today 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Today's Classes", value: classes.length,    icon: BookOpen,    bg: "bg-indigo-50",  text: "text-indigo-700",  iconBg: "bg-indigo-600"  },
            { label: "Upcoming",        value: upcomingClasses.length, icon: Clock,   bg: "bg-sky-50",     text: "text-sky-700",     iconBg: "bg-sky-500"     },
            { label: "Completed",       value: completedCount,    icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-600" },
            { label: "Avg Attendance",  value: `${avgAttendance}%`,
              icon: TrendingUp,
              bg:   avgAttendance>=85?"bg-emerald-50":avgAttendance>=75?"bg-amber-50":"bg-red-50",
              text: avgAttendance>=85?"text-emerald-700":avgAttendance>=75?"text-amber-700":"text-red-700",
              iconBg: avgAttendance>=85?"bg-emerald-600":avgAttendance>=75?"bg-amber-500":"bg-red-500",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                <s.icon size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-none ${s.text}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit">
          {["schedule","attendance","notifications"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all
                ${activeTab===tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-700"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Schedule Tab ── */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Today's Schedule</h2>
                <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                  {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"short" })}
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {classes.map(cls => {
                  const status = getStatus(cls.time, cls.end);
                  const isOpen = selectedClass?.id === cls.id;
                  const statusConfig = {
                    ongoing:   { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
                    upcoming:  { cls: "bg-indigo-50 text-indigo-600 border-indigo-100",     dot: "bg-indigo-400" },
                    completed: { cls: "bg-slate-100 text-slate-400 border-slate-200",       dot: "bg-slate-300"  },
                  }[status];

                  return (
                    <div key={cls.id}>
                      <div onClick={() => setSelectedClass(isOpen ? null : cls)}
                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors
                          ${isOpen ? "bg-indigo-50/50" : "hover:bg-slate-50/50"}`}>
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot} ${status==="ongoing"?"animate-pulse":""}`} />

                        {/* Time */}
                        <div className="text-center w-16 flex-shrink-0">
                          <p className="text-xs font-bold text-slate-700">{fmt(cls.time)}</p>
                          <p className="text-xs text-slate-400">{fmt(cls.end)}</p>
                        </div>

                        <div className="w-px h-8 bg-slate-100 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{cls.subject}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{cls.teacher}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusConfig.cls}`}>
                            {status}
                          </span>
                          {isOpen ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-6 pb-4 bg-indigo-50/30 border-t border-indigo-100">
                          <div className="grid grid-cols-3 gap-3 pt-3">
                            <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm">
                              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin size={10}/> Room</p>
                              <p className="font-bold text-slate-800">{cls.room}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm">
                              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock size={10}/> Duration</p>
                              <p className="font-bold text-slate-800 text-sm">{fmt(cls.time)}–{fmt(cls.end)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm">
                              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><User size={10}/> Instructor</p>
                              <p className="font-bold text-slate-800 text-xs leading-snug">{cls.teacher}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Today at a Glance</h3>
                <div className="space-y-3">
                  {classes.map(cls => {
                    const status = getStatus(cls.time, cls.end);
                    return (
                      <div key={cls.id} className="flex items-center gap-3">
                        <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                          status==="ongoing"?"bg-emerald-500":status==="upcoming"?"bg-indigo-400":"bg-slate-200"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{cls.subject}</p>
                          <p className="text-xs text-slate-400">{cls.room} · {cls.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`rounded-2xl border p-5 ${
                avgAttendance>=85?"bg-emerald-50 border-emerald-100":
                avgAttendance>=75?"bg-amber-50 border-amber-100":"bg-red-50 border-red-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${
                    avgAttendance>=85?"text-emerald-600":avgAttendance>=75?"text-amber-600":"text-red-600"}`}>
                    Attendance Status
                  </p>
                  <p className={`text-2xl font-black ${
                    avgAttendance>=85?"text-emerald-700":avgAttendance>=75?"text-amber-700":"text-red-700"}`}>
                    {avgAttendance}%
                  </p>
                </div>
                <p className={`text-xs ${
                  avgAttendance>=85?"text-emerald-600":avgAttendance>=75?"text-amber-600":"text-red-600"}`}>
                  {avgAttendance>=85?"Excellent! Keep it up 🎉":avgAttendance>=75?"On track — maintain regularity":"Below 75% — at risk of detain ⚠️"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Attendance Tab ── */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">Subject-wise Attendance</h2>
              <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
                avgAttendance>=85?"bg-emerald-50 text-emerald-700":
                avgAttendance>=75?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>
                Overall {avgAttendance}%
              </div>
            </div>
            <div className="space-y-5">
              {attendance.map(a => {
                const color = a.pct>=85?"bg-emerald-500":a.pct>=75?"bg-amber-500":"bg-red-500";
                const textC = a.pct>=85?"text-emerald-600":a.pct>=75?"text-amber-600":"text-red-600";
                return (
                  <div key={a.subject}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-700">{a.subject}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {a.pct>=85?"Good standing":a.pct>=75?"Acceptable":"At risk"}
                        </span>
                        <span className={`text-sm font-black ${textC}`}>{a.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width:`${a.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {avgAttendance < 75 && (
              <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Attendance Warning</p>
                  <p className="text-xs text-red-600 mt-0.5">Your overall attendance is below 75%. You may be detained from exams. Please consult your class coordinator immediately.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Notifications</h2>
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                {NOTIFICATIONS.length}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                    ${n.type==="success"?"bg-emerald-100":n.type==="warning"?"bg-amber-100":"bg-indigo-100"}`}>
                    {n.type==="success"
                      ? <CheckCircle size={14} className="text-emerald-600" />
                      : n.type==="warning"
                      ? <AlertCircle size={14} className="text-amber-600" />
                      : <Bell size={14} className="text-indigo-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}