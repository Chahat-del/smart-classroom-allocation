import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";

const USERS = {
  teacher: { email: "prof.mehta@dsce.edu.in", password: "teacher123", name: "Prof. Mehta" },
  student: { email: "student@dsce.edu.in",    password: "student123", name: "Alex Kumar"  },
};

export default function LoginPage() {
  const navigate   = useNavigate();
  const [role,     setRole]     = useState("teacher");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res  = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));

      setLoading(false);
      navigate(data.user.role === "teacher" ? "/teacher/dashboard" : "/student");

    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(USERS[role].email);
    setPassword(USERS[role].password);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)",
            backgroundSize: "56px 56px"
          }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative flex flex-col h-full px-14 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-auto">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <BookOpen size={19} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold tracking-wide">DSCE</p>
              <p className="text-indigo-300/60 text-xs tracking-wider uppercase">Smart Classroom System</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="my-auto">
            
            {/* UPGRADED BADGE */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all hover:bg-white/10 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] cursor-default">
              {/* Upgraded glowing dot with radar ping effect */}
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </div>
              {/* Upgraded text */}
              <span className="text-indigo-200 text-xs font-bold tracking-widest uppercase">
                DSA-Powered Platform
              </span>
            </div>

            {/* Title that was missing! */}
            <h1 className="text-5xl font-bold text-white leading-[1.1] mb-5">
              Intelligent<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #c084fc)" }}>
                Room Allocation
              </span><br />
              Platform
            </h1>

            {/* Description that was missing! */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-10">
              Automated conflict-free classroom scheduling for Dayananda Sagar College of Engineering — powered by core DSA algorithms.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-800/60">
            <p className="text-slate-600 text-xs">© 2024 DSCE, Bangalore</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-slate-500 text-xs">System Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen size={17} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800">DSCE Smart Classroom</p>
              <p className="text-slate-400 text-xs">Allocation System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 mt-1.5">Sign in to access your dashboard</p>
          </div>

          {/* Role toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            {[
              { key: "teacher", label: "Teacher", Icon: BookOpen },
              { key: "student", label: "Student", Icon: GraduationCap },
            ].map(({ key, label, Icon }) => (
              <button key={key}
                onClick={() => { setRole(key); setError(""); setEmail(""); setPassword(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${role === key
                    ? key === "teacher"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-amber-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"}`}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input type="email" required autoComplete="email"
                value={email}
                placeholder={USERS[role].email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} required autoComplete="current-password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-3.5 text-slate-300 hover:text-slate-500 transition">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2
                ${role === "teacher"
                  ? "bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                  : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"}`}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <> Sign In <ArrowRight size={15} /> </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demo Credentials</p>
              <button onClick={fillDemo}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                Auto-fill →
              </button>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400 w-16 flex-shrink-0">email</span>
                <span className="text-slate-700 select-all">{USERS[role].email}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400 w-16 flex-shrink-0">password</span>
                <span className="text-slate-700">{USERS[role].password}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-300 text-xs mt-6">
            Dayananda Sagar College of Engineering · Bangalore
          </p>

        </div>
      </div>
    </div>
  );
}