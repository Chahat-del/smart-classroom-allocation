import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Building2, Users, TrendingUp,
  Clock, CheckCircle2, BookOpen, Loader2
} from "lucide-react";
import TeacherLayout from "../components/TeacherLayout";
import { BRANCH_DATA, today } from "../data/dsceData";
import { bookingStore } from "./TeacherBookings";

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate  = useNavigate();
  const [bookings, setBookings] = useState(() => bookingStore.get());
  const [user,     setUser]     = useState({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Read logged-in user
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(stored);

    // If no token redirect to login
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    // Fetch bookings from DB
    fetch("http://localhost:5000/api/bookings", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.bookings ?? [];
        const normalised = list.map(b => ({
          id:       String(b.id),
          room:     b.room_name ?? b.room ?? "—",
          roomId:   String(b.room_id ?? ""),
          subject:  b.subject,
          batch:    b.batch,
          start:    b.start_time ?? b.start,
          end:      b.end_time   ?? b.end,
          date:     b.date,
          priority: b.priority ?? 0,
          capacity: b.capacity,
          branch:   b.branch,
          building: b.building ?? BRANCH_DATA[b.branch]?.building ?? "",
        }));
        bookingStore.set(normalised);
        setBookings(bookingStore.get());
      })
      .catch(() => {})
      .finally(() => setFetching(false));

    // Stay in sync when bookings page adds/removes
    const unsub = bookingStore.subscribe(() => setBookings(bookingStore.get()));
    return unsub;
  }, [navigate]);

  const todayBookings = bookings.filter(b => b.date === today);
  const totalStudents = bookings.reduce((sum, b) => sum + (parseInt(b.capacity) || 0), 0);
  const uniqueRooms   = [...new Set(bookings.map(b => b.room))].length;
  const facultyCount  = bookings.filter(b => b.priority === 0).length;

  const upcoming = [...todayBookings].sort((a, b) => a.start.localeCompare(b.start)).slice(0, 5);
  const recent   = [...bookings].reverse().slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <TeacherLayout>
      <div className="p-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {greeting}, {user.name || "Professor"} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={CalendarDays} label="Today's Bookings" value={fetching ? "…" : todayBookings.length} sub="scheduled today"      color="bg-indigo-50 text-indigo-600"   />
          <StatCard icon={Building2}   label="Rooms In Use"      value={fetching ? "…" : uniqueRooms}          sub="across all buildings" color="bg-sky-50 text-sky-600"         />
          <StatCard icon={Users}       label="Total Students"    value={fetching ? "…" : totalStudents}         sub="across all bookings"  color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={BookOpen}    label="Faculty Bookings"  value={fetching ? "…" : facultyCount}          sub="priority sessions"    color="bg-amber-50 text-amber-600"     />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-indigo-500" />
                <h2 className="font-bold text-slate-800 text-sm">Today's Schedule</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{today}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {fetching ? (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CalendarDays size={24} className="mb-2 opacity-20" />
                  <p className="text-sm">No bookings for today</p>
                  <button onClick={() => navigate("/teacher/bookings")}
                    className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                    Schedule a room →
                  </button>
                </div>
              ) : upcoming.map(b => {
                const now = new Date();
                const [sh,sm] = b.start.split(":").map(Number);
                const [eh,em] = b.end.split(":").map(Number);
                const cur = now.getHours()*60+now.getMinutes();
                const st  = sh*60+sm, en = eh*60+em;
                const status = cur>=st&&cur<en?"ongoing":cur<st?"upcoming":"done";
                return (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="text-center w-14 flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">{b.start}</p>
                      <p className="text-xs text-slate-400">{b.end}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{b.subject}</p>
                      <p className="text-xs text-slate-400 truncate">{b.room} · {b.batch}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0
                      ${status==="ongoing"?"bg-green-100 text-green-700":status==="upcoming"?"bg-blue-50 text-blue-600":"bg-slate-100 text-slate-400"}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-500" />
                <h2 className="font-bold text-slate-800 text-sm">Recent Bookings</h2>
              </div>
              <span className="text-xs text-slate-400">{bookings.length} total</span>
            </div>
            <div className="divide-y divide-slate-50">
              {fetching ? (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle2 size={24} className="mb-2 opacity-20" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : recent.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${b.priority===0?"bg-slate-400":"bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{b.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{b.room} · {b.date} · {b.start}–{b.end}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                    ${b.priority===0?"bg-slate-100 text-slate-600":"bg-amber-100 text-amber-700"}`}>
                    {b.priority===0?"Faculty":"Student"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Department summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Building2 size={15} className="text-sky-500" />
              <h2 className="font-bold text-slate-800 text-sm">Bookings by Department</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-slate-100">
              {Object.entries(BRANCH_DATA).map(([key, info]) => {
                const count = bookings.filter(b => b.branch === key).length;
                const pct   = bookings.length ? Math.round((count/bookings.length)*100) : 0;
                return (
                  <div key={key} className="bg-white px-4 py-4 text-center">
                    <p className="text-xl font-bold text-slate-800">{count}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{key}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{info.building.split("(")[0].trim()}</p>
                    <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width:`${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}