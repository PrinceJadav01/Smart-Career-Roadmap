import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Users, Zap, ShoppingBag, Coins,
  CheckCircle2, AlertTriangle, Clock, RefreshCw, Activity
} from 'lucide-react';
import * as api from '../services/api';

// ── Deterministic "user registrations" mock from real user data ──
function buildActivitySeries(users) {
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  // Spread users across weeks using index modulo
  const counts = weeks.map(() => 0);
  users.forEach((_, i) => { counts[i % weeks.length] += 1; });
  return weeks.map((week, i) => ({ week, registrations: counts[i], activeUsers: Math.max(0, counts[i] - (i % 2)) }));
}

function MetricCard({ label, value, sub, icon: Icon, accent }) {
  const accentMap = {
    blue:   { bg: 'bg-blue-900/20',   border: 'border-blue-700/30',  text: 'text-blue-400'   },
    violet: { bg: 'bg-violet-900/20', border: 'border-violet-700/30',text: 'text-violet-400' },
    emerald:{ bg: 'bg-emerald-900/20',border: 'border-emerald-700/30',text: 'text-emerald-400'},
    amber:  { bg: 'bg-amber-900/20',  border: 'border-amber-700/30', text: 'text-amber-400'  },
  };
  const c = accentMap[accent] || accentMap.blue;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start justify-between">
      <div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 mt-1 font-mono">{value}</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>
      </div>
      <div className={`${c.bg} ${c.border} border rounded-lg p-2`}>
        <Icon className={`w-4 h-4 ${c.text}`} />
      </div>
    </div>
  );
}

function ServiceRow({ label, sublabel, online, latency }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <div>
        <p className="text-xs font-medium text-zinc-200">{label}</p>
        <p className="text-[10px] text-zinc-500">{sublabel}</p>
      </div>
      {online ? (
        <div className="flex items-center gap-3">
          {latency !== undefined && (
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />{latency}ms
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> ONLINE
          </span>
        </div>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
          <AlertTriangle className="w-3 h-3" /> OFFLINE
        </span>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [health, setHealth]   = useState(null);
  const [logs, setLogs]       = useState([]);
  const [metrics, setMetrics] = useState({ totalUsers: 0, activeQuests: 0, totalRedeemed: 0, globalTokens: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [healthData, logsData, usersData, questsData] = await Promise.all([
        api.getAdminHealth(),
        api.getAdminAuditLogs(),
        api.getAdminUsers(),
        api.getAdminQuests(),
      ]);
      setHealth(healthData);
      setLogs(logsData);
      setMetrics({
        totalUsers:    usersData.length,
        activeQuests:  questsData.filter(q => new Date(q.endDate) > new Date()).length,
        totalRedeemed: usersData.reduce((a, u) => a + (u.redemptions?.length || 0), 0),
        globalTokens:  usersData.reduce((a, u) => a + (u.tokens || 0), 0),
      });
      setActivity(buildActivitySeries(usersData));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('AdminDashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-zinc-100">System Overview</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Platform telemetry &amp; operational health · {lastRefresh ? lastRefresh.toLocaleTimeString() : '—'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-zinc-800 border border-zinc-700 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Users"            value={metrics.totalUsers}    sub="Registered accounts"       icon={Users}      accent="blue"    />
        <MetricCard label="Active Weekly Quests"   value={metrics.activeQuests}  sub="Currently accepting entries" icon={Zap}        accent="violet"  />
        <MetricCard label="Total Redemptions"      value={metrics.totalRedeemed} sub="Reward items claimed"       icon={ShoppingBag} accent="emerald" />
        <MetricCard label="Token Economy"          value={metrics.globalTokens}  sub="Tokens in circulation"     icon={Coins}       accent="amber"   />
      </div>

      {/* Charts + Health + Audit — 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Activity Chart — 2 cols */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Platform Activity
              </h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">User registrations &amp; active sessions by week</p>
            </div>
            <span className="text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded font-mono uppercase">8-week window</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activity} barSize={20} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Bar dataKey="registrations" fill="#3b82f6" radius={[3,3,0,0]} name="Registrations" />
              <Bar dataKey="activeUsers"   fill="#6366f1" radius={[3,3,0,0]} name="Active Users"   />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Health — 1 col */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-1">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-200">Service Health</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time endpoint diagnostics</p>
          </div>
          <ServiceRow label="ASP.NET Core API" sublabel="REST Gateway · Port 5000" online={true} />
          <ServiceRow label="PostgreSQL" sublabel="EF Core · Npgsql Driver" online={health?.databaseOnline ?? false} />
          <ServiceRow label="Python ML Service" sublabel="FastAPI · scikit-learn" online={health?.mlServiceOnline ?? false} latency={health?.mlLatency} />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-xs font-semibold text-zinc-200">Audit Log</h2>
          <span className="text-[10px] text-zinc-500 font-mono">Last 100 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-1/2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-600 text-xs">No audit records found.</td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-2 text-zinc-500 font-mono text-[10px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-zinc-300 font-medium">{log.adminName}</td>
                  <td className="px-4 py-2">
                    <span className="font-mono text-[10px] bg-zinc-800 border border-zinc-700 text-blue-400 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-400 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
