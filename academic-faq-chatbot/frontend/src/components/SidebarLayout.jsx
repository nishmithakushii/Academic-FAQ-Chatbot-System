import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Moon, Sun, Menu, X, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SidebarLayout({ navItems, children, title, role }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleColors = {
    admin: 'from-rose-500 to-pink-600',
    cr: 'from-violet-500 to-purple-600',
    student: 'from-blue-500 to-indigo-600',
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-slate-900 dark:text-white text-base leading-none">AcadBot</h1>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{role} Panel</p>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-bold">{(user?.name || user?.username || 'U')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name || user?.username}</p>
            <p className="text-xs text-slate-400 truncate">{user?.student_id || user?.department || role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">{title}</p>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button onClick={toggle} className="sidebar-link w-full text-left">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-slate-900 dark:text-white">AcadBot</span>
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
