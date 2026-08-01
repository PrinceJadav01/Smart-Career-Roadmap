import React, { useState } from 'react';
import { X, Coins, ShieldCheck, ShieldAlert, Trash2, Clock, Award, BookOpen, RotateCcw, Archive } from 'lucide-react';

function Field({ label, value, mono }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className={`text-xs text-zinc-200 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value ?? <span className="text-zinc-600 italic">null</span>}
      </p>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold border-b border-zinc-800 pb-1.5 mb-3">
      {children}
    </p>
  );
}

export default function UserDetailDrawer({ user, onClose, onUpdateTokens, onToggleAdmin, onDeleteUser, onRestoreUser }) {
  const [tokenAmount, setTokenAmount]   = useState(user.tokens);
  const [adjustReason, setAdjustReason] = useState('Manual adjustment by administrator');
  const [updatingTokens, setUpdatingTokens] = useState(false);
  const [updatingAdmin, setUpdatingAdmin]   = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setUpdatingTokens(true);
    try {
      await onUpdateTokens(user.id, tokenAmount, adjustReason);
    } catch (err) {
      alert(err.message || 'Token update failed.');
    } finally {
      setUpdatingTokens(false);
    }
  };

  const handleToggleAdmin = async () => {
    setUpdatingAdmin(true);
    try {
      await onToggleAdmin(user.id);
    } catch (err) {
      alert(err.message || 'Role update failed.');
    } finally {
      setUpdatingAdmin(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[480px] pointer-events-auto">
        <div className="flex flex-col w-full bg-zinc-900 border-l border-zinc-800 overflow-y-auto">

          {/* Header */}
          <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">{user.name}</h2>
                {user.isAdmin && (
                  <span className="text-[9px] bg-blue-900/40 border border-blue-700/40 text-blue-400 px-1.5 py-0.5 rounded font-semibold">ADMIN</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{user.id}</p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 px-5 py-5 space-y-6">

            {/* ── Account Record ── */}
            <section>
              <SectionHeader>Account Record</SectionHeader>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Full Name"       value={user.name}   />
                <Field label="Email"           value={user.email}  mono />
                <Field label="Education Level" value={user.educationLevel || '—'} />
                <Field label="Field of Study"  value={user.fieldOfStudy  || '—'} />
                <Field label="Phone"           value={user.phoneNumber   || '—'} mono />
                <Field label="Role"            value={user.isAdmin ? 'Administrator' : 'User'} />
              </div>
            </section>

            {/* ── Platform Metrics ── */}
            <section>
              <SectionHeader>Platform Metrics</SectionHeader>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'User Level',    value: user.level,           icon: Award     },
                  { label: 'XP Points',     value: user.xp,              icon: BookOpen  },
                  { label: 'Token Balance', value: user.tokens,          icon: Coins     },
                  { label: 'Streak (days)', value: user.streak,          icon: Clock     },
                  { label: 'Quests Done',   value: user.questsCompleted, icon: Clock     },
                  { label: 'Redemptions',   value: user.redemptions?.length ?? 0, icon: Coins },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-zinc-800/60 border border-zinc-700/60 rounded-md p-2.5 text-center">
                    <p className="text-base font-bold text-zinc-100 font-mono">{value ?? '—'}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Active Career Path ── */}
            <section>
              <SectionHeader>Career Configuration</SectionHeader>
              <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-md p-3 space-y-1">
                <Field label="Active Career Path" value={user.activeQuest?.roleName || 'Not configured'} />
              </div>
            </section>

            {/* ── Skill Proficiencies ── */}
            <section>
              <SectionHeader>Skill Proficiency Data</SectionHeader>
              {user.skills && user.skills.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-1.5 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Skill</th>
                        <th className="text-left py-1.5 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                        <th className="text-right py-1.5 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {user.skills.filter(s => s.level > 0).map(s => (
                        <tr key={s.skillId} className="hover:bg-zinc-800/30">
                          <td className="py-1.5 font-medium text-zinc-200">{s.name}</td>
                          <td className="py-1.5 text-zinc-500">{s.category || '—'}</td>
                          <td className="py-1.5 text-right font-mono text-zinc-300">{s.level}/3</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 italic">No skill data configured.</p>
              )}
            </section>

            {/* ── Redemption Log ── */}
            <section>
              <SectionHeader>Redemption Transaction Log</SectionHeader>
              {user.redemptions && user.redemptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-1.5 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Reward</th>
                        <th className="text-right py-1.5 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Redeemed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {user.redemptions.map((r, i) => (
                        <tr key={i} className="hover:bg-zinc-800/30">
                          <td className="py-1.5 text-zinc-200">{r.title}</td>
                          <td className="py-1.5 text-right text-zinc-500 font-mono text-[10px]">
                            {new Date(r.redeemedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 italic">No redemptions recorded.</p>
              )}
            </section>

            {/* ── Token Adjustment ── */}
            <section className="bg-zinc-800/40 border border-zinc-700/40 rounded-md p-4 space-y-3">
              <SectionHeader>Token Balance Adjustment</SectionHeader>
              <form onSubmit={handleTokenSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">New Balance</label>
                    <input
                      type="number"
                      value={tokenAmount}
                      onChange={e => setTokenAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Reason / Note</label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={e => setAdjustReason(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
                      placeholder="e.g. Correction for quest grading"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatingTokens}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {updatingTokens ? 'Saving...' : 'Save Token Balance'}
                </button>
              </form>
            </section>

            {/* ── Soft Delete Alert Banner ── */}
            {user.isDeleted && (
              <div className="bg-red-950/40 border border-red-800/60 rounded-md p-3 text-red-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <Archive className="w-4 h-4" /> Account Archived (Soft-Deleted)
                </div>
                <p className="text-[10px] text-red-300/80">
                  This user profile has been soft-deleted. The account cannot log in, but all historical quest activity and data remain safely stored in the database.
                </p>
                {user.deletedAt && (
                  <p className="text-[9px] text-zinc-500 font-mono pt-1">
                    Archived At: {new Date(user.deletedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* ── Administrative Actions ── */}
            <section className="border-t border-zinc-800 pt-5 space-y-2">
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mb-3">Administrative Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleAdmin}
                  disabled={updatingAdmin}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded text-[10px] font-semibold border cursor-pointer transition-colors disabled:opacity-40
                    ${user.isAdmin
                      ? 'border-red-700/40 bg-red-900/20 text-red-400 hover:bg-red-900/30'
                      : 'border-blue-700/40 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'
                    }`}
                >
                  {user.isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {user.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                </button>

                {user.isDeleted ? (
                  <button
                    onClick={() => { if (onRestoreUser) onRestoreUser(user.id); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded text-[10px] font-bold border border-emerald-600/40 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Account
                  </button>
                ) : !confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded text-[10px] font-semibold border border-red-700/30 bg-red-900/10 text-red-400 hover:bg-red-900/25 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Soft Delete
                  </button>
                ) : (
                  <button
                    onClick={() => { onDeleteUser(user.id); onClose(); }}
                    className="flex items-center justify-center gap-1.5 py-2 rounded text-[10px] font-bold border border-red-500 bg-red-600 text-white hover:bg-red-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Soft Delete
                  </button>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
