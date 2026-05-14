import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Users, ShieldCheck, Eye, EyeOff, BookOpen, Bot } from 'lucide-react';

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-indigo-600', hint: 'Use your Student ID and password' },
  { key: 'cr', label: 'Class Rep', icon: Users, color: 'from-violet-500 to-purple-600', hint: 'Use your CR username and password' },
  { key: 'admin', label: 'Admin', icon: ShieldCheck, color: 'from-rose-500 to-pink-600', hint: 'Use admin credentials' },
];

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectedRole = ROLES.find(r => r.key === role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(username, password, role);
      toast.success(`Welcome back, ${user.name || user.username}!`);
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mb-4 shadow-xl shadow-primary-500/30">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">AcadBot</h1>
          <p className="text-slate-400 mt-1 text-sm">Academic FAQ Chatbot System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Role Tabs */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6 gap-1">
            {ROLES.map(r => (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); setUsername(''); setPassword(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${role === r.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <r.icon className="w-3.5 h-3.5" />
                {r.label}
              </button>
            ))}
          </div>

          {/* Role hint */}
          <div className={`mb-5 p-3 rounded-xl bg-gradient-to-r ${selectedRole.color} bg-opacity-20 border border-white/10`}>
            <p className="text-white/80 text-xs text-center">{selectedRole.hint}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {role === 'student' ? 'Student ID' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={role === 'student' ? 'e.g. CS2021001' : role === 'cr' ? 'e.g. cr001' : 'admin'}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${selectedRole.color} hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg mt-2 disabled:opacity-60`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : `Sign in as ${selectedRole.label}`}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-slate-400 text-xs text-center mb-3 font-medium">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 text-center">
                <p className="text-slate-300 font-semibold mb-1">Admin</p>
                <p className="text-slate-500">admin / admin123</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 text-center">
                <p className="text-slate-300 font-semibold mb-1">CR</p>
                <p className="text-slate-500">cr001 / cr123</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 text-center">
                <p className="text-slate-300 font-semibold mb-1">Student</p>
                <p className="text-slate-500">CS2021001 / student123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Academic FAQ Chatbot System v1.0 • Capstone Project 2024
        </p>
      </div>
    </div>
  );
}
