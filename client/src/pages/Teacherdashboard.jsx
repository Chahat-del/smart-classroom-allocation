import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Building2, CalendarDays, Users, TrendingUp,
  ArrowRight, Clock
} from "lucide-react";
import TeacherLayout from "../components/TeacherLayout";
import { BRANCH_DATA, COLOR_MAP, today } from "../data/dsceData";

// ── Shared booking store (in real app this comes from API) ────
// We use a simple module-level store so pages share state.
// Replace with Context or Zustand when wiring to backend.
import { bookingStore } from "./TeacherBookings";
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
        {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  // Read from shared store (will re-render when navigating back)
 const [bookings, setBookings] = useState(() => bookingStore.get());

useEffect(() => {
  const unsub = bookingStore.subscribe(() => {
    setBookings(bookingStore.get());
  });
  return unsub;
}, []);

  const todayBookings  = bookings.filter((b) => b.date === today);
  const totalRooms     = Object.values(BRANCH_DATA).reduce((s, b) => s + b.rooms.length, 0);
  const totalCapacity  = Object.values(BRANCH_DATA).reduce((s, b) => s + b.rooms.reduce((r, rm) => r + rm.capacity, 0), 0);
  const bookedSeats    = bookings.reduce((s, b) => s + (b.capacity || 0), 0);

  // Recent 5 bookings
  const recent = [...bookings].reverse().slice(0, 5);

  // Per-building summary
  const buildings = Object.entries(
    Object.entries(BRANCH_DATA).reduce((acc, [key, val]) => {
      const bldg = val.building;
      if (!acc[bldg]) acc[bldg] = { rooms: val.rooms.length, booked: 0, short: val.short, color: val.color };
      else acc[bldg].rooms += val.rooms.length;
      acc[bldg].booked += bookings.filter((b) => b.branch === key && b.date === today).length;
      return acc;
    }, {})
  ).slice(0, 6);

  return (
    <TeacherLayout>
      <div className="p-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Building2}    label="Total Classrooms"  value={totalRooms}            accent="bg-indigo-600" sub="campus-wide" />
          <StatCard icon={CalendarDays} label="Today's Bookings"  value={todayBookings.length}  accent="bg-slate-700"  sub={`${bookings.length} total`} />
          <StatCard icon={Users}        label="Seats Allocated"   value={bookedSeats}           accent="bg-amber-500"  sub={`of ${totalCapacity}`} />
          <StatCard icon={TrendingUp}   label="Departments"       value={Object.keys(BRANCH_DATA).length} accent="bg-emerald-600" sub="buildings active" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Recent Bookings</h2>
              <button onClick={() => navigate("/teacher/bookings")}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition">
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CalendarDays size={28} className="mb-2 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                  <button onClick={() => navigate("/teacher/bookings")}
                    className="mt-3 text-xs text-indigo-600 font-semibold hover:underline">
                    Create your first booking →
                  </button>
                </div>
              ) : (
                recent.map((b) => {
                  const branchInfo = BRANCH_DATA[b.branch];
                  const c = branchInfo ? COLOR_MAP[branchInfo.color] : COLOR_MAP.indigo;
                  return (
                    <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.border} border`}>
                        <Building2 size={14} className={c.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{b.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{b.room} · {b.batch} · {b.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-slate-600">{b.start}–{b.end}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{b.branch}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Building overview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Buildings</h2>
              <button onClick={() => navigate("/teacher/rooms")}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition">
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {buildings.map(([bldg, stat]) => {
                const pct = Math.min(100, Math.round((stat.booked / (stat.rooms * 9)) * 100));
                const c   = COLOR_MAP[stat.color];
                return (
                  <div key={bldg}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.badge}`}>{stat.short}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[120px]">{stat.rooms} rooms</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${c.dot}`}
                        style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "New Booking",    sub: "Reserve a classroom",     to: "/teacher/bookings",  icon: CalendarDays, accent: "bg-indigo-600" },
            { label: "Browse Rooms",   sub: "View availability",       to: "/teacher/rooms",     icon: Building2,    accent: "bg-slate-700"  },
            { label: "Analytics",      sub: "Usage reports",           to: "/teacher/analytics", icon: TrendingUp,   accent: "bg-emerald-600"},
            { label: "Today's Slots",  sub: `${todayBookings.length} bookings`, to: "/teacher/bookings", icon: Clock, accent: "bg-amber-500" },
          ].map(({ label, sub, to, icon: Icon, accent }) => (
            <button key={label} onClick={() => navigate(to)}
              className="bg-white border border-slate-100 rounded-2xl p-4 text-left hover:border-slate-200 hover:shadow-md transition-all shadow-sm group">
              <div className={`w-8 h-8 rounded-xl ${accent} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={15} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

      </div>
    </TeacherLayout>
  );
}