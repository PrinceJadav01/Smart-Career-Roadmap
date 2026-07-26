import React, { useState } from 'react';
import {
  LayoutDashboard, Users, BookOpen, Zap, Gift,
  Shield, ChevronRight, LogOut, Terminal, Menu, X,
  Bell, Settings, ChevronDown
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'users',     label: 'User Registry',     icon: Users           },
  { id: 'skills',    label: 'Skills & Courses',  icon: BookOpen        },
  { id: 'quests',    label: 'Weekly Quests',     icon: Zap             },
  { id: 'rewards',   label: 'Reward Catalog',    icon: Gift            },
];

export default function AdminLayout({ adminUser, activeTab, onTabChange, onExitAdmin, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-zinc-900 border-r border-zinc-800 transition-transform duration-200
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-bold text-zinc-100 tracking-wide block">SKILLSATHI</span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Admin Console</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto lg:hidden text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-semibold px-3 py-2">Management</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onTabChange(id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer
                ${activeTab === id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent'
                }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
              {activeTab === id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Admin Identity Footer */}
        <div className="border-t border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
              {adminUser?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="leading-tight min-w-0">
              <span className="text-xs font-semibold text-zinc-200 block truncate">{adminUser?.name || 'Administrator'}</span>
              <span className="text-[9px] text-zinc-500 block truncate">{adminUser?.email}</span>
            </div>
          </div>
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[10px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit to User Portal
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-zinc-500 hover:text-zinc-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Terminal className="w-3.5 h-3.5" />
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200 font-medium">{NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Admin'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-900/20 border border-emerald-700/30 rounded px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">System Online</span>
            </div>
            <button className="relative text-zinc-500 hover:text-zinc-300 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                {adminUser?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:block font-medium">{adminUser?.name?.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
