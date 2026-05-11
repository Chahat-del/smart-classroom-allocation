import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Building2,
  BarChart3, LogOut, BookOpen, Menu, X
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/teacher/bookings",  icon: CalendarDays,    label: "Bookings"   },
  { to: "/teacher/rooms",     icon: Building2,       label: "Rooms"      },
  { to: "/teacher/analytics", icon: BarChart3,       label: "Analytics"  },
];

export default function TeacherLayout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-900 flex flex-col
        transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">DSCE</p>
            <p className="text-slate-500 text-xs mt-0.5">Smart Classroom</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-slate-500 lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile + logout */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 mb-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">P</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Prof. Mehta</p>
              <p className="text-slate-500 text-xs truncate">CSE Department</p>
            </div>
          </div>
          <button onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setOpen(true)} className="text-slate-500">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <BookOpen size={12} className="text-white" />
            </div>
            <p className="font-bold text-slate-800 text-sm">DSCE Smart Classroom</p>
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}