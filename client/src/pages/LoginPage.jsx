import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, ArrowRight, Eye, EyeOff } from "lucide-react";

const USERS = {
  teacher: [
    { email: "prof.mehta@college.edu",   password: "teacher123", name: "Prof. Mehta"  },
    { email: "prof.sharma@college.edu",  password: "teacher123", name: "Prof. Sharma" },
  ],
  student: [
    { email: "student@college.edu", password: "student123", name: "Alex Kumar"   },
    { email: "cs3a@college.edu",    password: "student123", name: "CS-3A Student" },
  ],
};

export default function LoginPage() {
  const navigate = useNavigate();
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
    await new Promise((r) => setTimeout(r, 700));

    const match = USERS[role].find(
      (u) => u.email === email.trim() && u.password === password
    );

    if (!match) {
      setError("Incorrect email or password. Try the demo credentials below.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(role === "teacher" ? "/teacher" : "/student");
  };

  const fillDemo = () => {
    const demo = USERS[role][0];
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
  };

  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm text-slate-700 bg-white
    focus:outline-none focus:ring-2 transition placeholder:text-slate-400
    ${error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">

      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/50">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Classroom</h1>
          <p className="text-slate-400 text-sm mt-1">Allocation System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 p-8">

          {/* Role toggle */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-7">
            <button
              onClick={() => { setRole("teacher"); setError(""); setEmail(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${role === "teacher" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <BookOpen size={15} /> Teacher
            </button>
            <button
              onClick={() => { setRole("student"); setError(""); setEmail(""); setPassword(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${role === "student" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <GraduationCap size={15} /> Student
            </button>
          </div>

          {/* Welcome text */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {role === "teacher" ? "Welcome back, Professor" : "Welcome back, Student"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {role === "teacher"
                ? "Manage rooms, bookings, and schedules."
                : "View your class schedule and room assignments."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder={role === "teacher" ? "prof.name@college.edu" : "student@college.edu"}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputCls} pr-12`}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all
                ${role === "teacher"
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200"}
                disabled:opacity-60`}>
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
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Demo credentials</p>
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1 font-mono">
              <p><span className="text-slate-400">email</span>    {USERS[role][0].email}</p>
              <p><span className="text-slate-400">password</span> {USERS[role][0].password}</p>
            </div>
            <button onClick={fillDemo}
              className="mt-2 w-full text-xs text-indigo-500 hover:text-indigo-700 font-medium py-1 transition">
              Fill demo credentials →
            </button>
          </div>

        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Smart Classroom Allocation · DSA Project
        </p>
      </div>
    </div>
  );
}