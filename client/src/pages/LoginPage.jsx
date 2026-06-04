import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";

const USERS = {
  teacher: [
    { email: "prof.mehta@dsce.edu.in",  password: "teacher123",  name: "Prof. Mehta",  dept: "CSE"   },
    { email: "prof.singh@dsce.edu.in",  password: "teach2024",   name: "Dr. Singh",    dept: "ECE"   },
    { email: "prof.rao@dsce.edu.in",    password: "lecturer321", name: "Prof. Rao",    dept: "ME"    },
    { email: "prof.kumar@dsce.edu.in",  password: "dsce@2024",   name: "Prof. Kumar",  dept: "Civil" },
    { email: "prof.nair@dsce.edu.in",   password: "nair1234",    name: "Dr. Nair",     dept: "ISE"   },
  ],
  student: [
    { email: "student@dsce.edu.in",     password: "student123",  name: "Alex Kumar",   usn: "1DS21CS001", branch: "CSE",   sem: "4th Sem" },
    { email: "sahana.p@dsce.edu.in",    password: "stud2024",    name: "Sahana P",     usn: "1DS21CS045", branch: "CSE",   sem: "4th Sem" },
    { email: "ram.rao@dsce.edu.in",     password: "password1",   name: "Ram Rao",      usn: "1DS21EC012", branch: "ECE",   sem: "4th Sem" },
    { email: "nisha.k@dsce.edu.in",     password: "welcome123",  name: "Nisha K",      usn: "1DS21ME023", branch: "ME",    sem: "6th Sem" },
    { email: "arjun.s@dsce.edu.in",     password: "arjun2024",   name: "Arjun Sharma", usn: "1DS22CS067", branch: "CSE",   sem: "2nd Sem" },
    { email: "priya.m@dsce.edu.in",     password: "priya@123",   name: "Priya Menon",  usn: "1DS21IS034", branch: "ISE",   sem: "4th Sem" },
    { email: "kiran.b@dsce.edu.in",     password: "kiran999",    name: "Kiran B",      usn: "1DS21CV009", branch: "Civil", sem: "6th Sem" },
    { email: "divya.r@dsce.edu.in",     password: "divya321",    name: "Divya R",      usn: "1DS22EC041", branch: "ECE",   sem: "2nd Sem" },
  ],
};

// Stats shown on the left panel
const STATS = [
  { value: "2,400+", label: "Students" },
  { value: "180+",   label: "Classrooms" },
  { value: "40+",    label: "Faculty" },
  { value: "99.9%",  label: "Uptime"  },
];

export default function LoginPage() {
  const navigate    = useNavigate();
  const [role,      setRole]      = useState("teacher");
  const [demoIndex, setDemoIndex] = useState(0);
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check demo credentials first
    const matched = (USERS[role] || []).find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (matched) {
      localStorage.setItem("token", `demo-${role}-${matched.email}`);
      localStorage.setItem("user",  JSON.stringify({ email: matched.email, name: matched.name, role }));
      setLoading(false);
      navigate(role === "teacher" ? "/teacher" : "/student");
      return;
    }

    try {
      const res  = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      setLoading(false);
      navigate(data.user.role === "teacher" ? "/teacher" : "/student");
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
      setLoading(false);
    }
  };

  const pickDemo = (i) => {
    setDemoIndex(i);
    setEmail(USERS[role][i].email);
    setPassword(USERS[role][i].password);
    setError("");
  };

  const switchRole = (r) => { setRole(r); setDemoIndex(0); setEmail(""); setPassword(""); setError(""); };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0c1445 0%, #1a1a5e 40%, #0d0d2b 100%)" }}>

        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col h-full px-14 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <BookOpen size={19} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold tracking-wide">DSCE</p>
              <p className="text-blue-300/50 text-xs tracking-widest uppercase">Smart Classroom System</p>
            </div>
          </div>

          {/* Main content */}
          <div className="my-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-blue-200 text-xs font-semibold tracking-widest uppercase">System Live · Academic Year 2024–25</span>
            </div>

            <h1 className="text-5xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Smarter<br />
              <span style={{ WebkitTextStroke: "2px rgba(147,197,253,0.6)", color: "transparent" }}>
                Classrooms
              </span><br />
              Start Here.
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-10">
              DSCE's intelligent room allocation platform — zero conflicts, real-time availability, and DSA-powered scheduling for every department.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3 mb-10">
              {STATS.map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-3 py-4 text-center">
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Department pills */}
            <div className="flex flex-wrap gap-2">
              {["CSE","ECE","ME","Civil","ISE","EEE","BioTech","Maths"].map(d => (
                <span key={d} className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-400 font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-800/60">
            <p className="text-slate-600 text-xs">© 2024 DSCE, Bangalore</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-slate-500 text-xs">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={17} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">DSCE Smart Classroom</p>
              <p className="text-slate-400 text-xs">Allocation System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-slate-400 mt-1.5 text-sm">Access your classroom dashboard</p>
          </div>

          {/* Role toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            {[
              { key: "teacher", label: "Teacher", Icon: BookOpen },
              { key: "student", label: "Student", Icon: GraduationCap },
            ].map(({ key, label, Icon }) => (
              <button key={key} onClick={() => switchRole(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${role===key
                    ? key==="teacher" ? "bg-slate-900 text-white shadow-sm" : "bg-amber-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
              <input type="email" required autoComplete="email" value={email}
                placeholder={USERS[role][demoIndex].email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} required autoComplete="current-password" value={password}
                  placeholder="Enter your password"
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-500 transition">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60
                ${role==="teacher"
                  ? "bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                  : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"}`}>
              {loading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                : <> Sign In <ArrowRight size={15} /> </>}
            </button>
          </form>

          {/* ── Demo accounts panel ── */}
          <div className="mt-6 rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Demo Accounts
              </p>
              <span className="text-xs text-slate-400">{USERS[role].length} available · click to fill</span>
            </div>

            {/* Scrollable user list */}
            <div className="max-h-40 overflow-y-auto">
              {USERS[role].map((u, i) => (
                <button key={u.email} type="button" onClick={() => pickDemo(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition border-b border-slate-50 last:border-0
                    ${demoIndex===i ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                    ${role==="teacher" ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-700"}`}>
                    {u.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">
                    {role==="teacher" ? u.dept : u.branch}
                  </span>
                  {demoIndex===i && <span className="text-blue-500 text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100">
              <span className="text-xs text-slate-400">Password:</span>
              <code className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {USERS[role][demoIndex].password}
              </code>
            </div>
          </div>

          <p className="text-center text-slate-300 text-xs mt-6">Dayananda Sagar College of Engineering · Bangalore</p>
        </div>
      </div>
    </div>
  );
}