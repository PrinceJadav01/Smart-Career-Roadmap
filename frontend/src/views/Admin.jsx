import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Search, Eye, ArrowRight, Upload, Image, X, RotateCcw, Archive, CheckCircle2 } from 'lucide-react';
import * as api from '../services/api';
import AdminDashboard from './AdminDashboard';
import UserDetailDrawer from './UserDetailDrawer';

export default function Admin({ currentUser, activeTab: propActiveTab }) {
  const [localActiveTab, setLocalActiveTab] = useState('dashboard');
  const activeTab = propActiveTab || localActiveTab;
  
  // Tab 1: Skills & Resources
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState({});
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend' });
  const [newResource, setNewResource] = useState({ title: '', platform: '', url: '', duration: '', cost: 'Free', skillName: '' });

  // Tab 2: User Registry
  const [userRegistry, setUserRegistry] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilterTab, setUserFilterTab] = useState('active'); // 'active' | 'archived'
  const [selectedUser, setSelectedUser] = useState(null);

  // Tab 3: Quest Workshop
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', endDate: '', rewardTokens: 100 });
  const [newQuestion, setNewQuestion] = useState({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', points: 25 });
  const [selectedQuestId, setSelectedQuestId] = useState(null);

  // Tab 4: Reward Merchant
  const [rewards, setRewards] = useState([]);
  const [newReward, setNewReward] = useState({ title: '', description: '', tokenCost: 50, imageUrl: '', rewardUrl: '' });

  // Tab 5: Reward Orders Management
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All');

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchData();
    }
  }, [currentUser, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'skills') {
        const skillsData = await api.getUserSkills(currentUser.id);
        setSkills(skillsData);
        const resData = await api.getResources(null, currentUser.id);
        setResources(resData);
      } else if (activeTab === 'users') {
        const data = await api.getAdminUsers();
        setUserRegistry(data);
        // Refresh selected user if open in drawer
        if (selectedUser) {
          const freshUser = data.find(u => u.id === selectedUser.id);
          if (freshUser) setSelectedUser(freshUser);
        }
      } else if (activeTab === 'quests') {
        const data = await api.getAdminQuests();
        setQuests(data);
      } else if (activeTab === 'rewards' || activeTab === 'orders') {
        const res = await api.getRewardsCatalog();
        setRewards(res.catalog || []);
        const ordersData = await api.getAdminRewardOrders();
        setOrders(ordersData || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Tab 1 Handlers ──
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.createSkill(newSkill);
      setNewSkill({ name: '', category: 'Frontend' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!confirm('Are you sure? This will delete all associated courses.')) return;
    try {
      await api.deleteSkill(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const skillObj = skills.find(s => s.name === newResource.skillName);
      if (!skillObj) {
        alert('Please select a valid skill');
        return;
      }
      await api.createResource({
        title: newResource.title,
        platform: newResource.platform,
        url: newResource.url,
        duration: newResource.duration,
        cost: newResource.cost,
        skillId: skillObj.id
      });
      setNewResource({ title: '', platform: '', url: '', duration: '', cost: 'Free', skillName: '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await api.deleteResource(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Tab 2 Handlers ──
  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to soft-delete and archive this user account? Profile data will be retained in database.')) return;
    try {
      await api.deleteAdminUser(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestoreUser = async (id) => {
    if (!confirm('Restore this soft-deleted user account back to active status?')) return;
    try {
      await api.restoreAdminUser(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTokens = async (userId, amount, reason) => {
    await api.updateUserTokens(userId, amount, reason);
    fetchData();
  };

  const handleToggleAdmin = async (userId) => {
    await api.toggleUserAdmin(userId);
    fetchData();
  };

  // ── Tab 3 Handlers ──
  const handleCreateQuest = async (e) => {
    e.preventDefault();
    try {
      const endD = new Date(newQuest.endDate);
      endD.setHours(23, 59, 59, 999);
      await api.createAdminQuest({
        ...newQuest,
        endDate: endD.toISOString()
      });
      setNewQuest({ title: '', description: '', endDate: '', rewardTokens: 100 });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuest = async (id) => {
    if (!confirm('Are you sure you want to delete this weekly quest?')) return;
    try {
      await api.deleteAdminQuest(id);
      if (selectedQuestId === id) setSelectedQuestId(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuestId) return;
    try {
      await api.addQuestQuestion(selectedQuestId, newQuestion);
      setNewQuestion({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', points: 25 });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await api.deleteQuestQuestion(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Tab 4 & 5 Handlers ──
  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminReward(newReward);
      setNewReward({ title: '', description: '', tokenCost: 50, imageUrl: '', rewardUrl: '' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Are you sure you want to delete this reward item?')) return;
    try {
      await api.deleteAdminReward(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setNewReward(prev => ({ ...prev, imageUrl: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-500">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Access Denied</h2>
        <p>You do not have system administrator privileges to view this console.</p>
      </div>
    );
  }

  // Filter user registry
  const filteredUsers = userRegistry.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = userFilterTab === 'archived' ? u.isDeleted : !u.isDeleted;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Tab: Dashboard Overview */}
      {activeTab === 'dashboard' && <AdminDashboard />}

      {/* Tab: Skills & Courses */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-zinc-100">
          {/* SKILLS MANAGEMENT */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest pb-2 border-b border-zinc-800">
              Skills Directory
            </h2>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Skill Name"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600"
                value={newSkill.name}
                onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                required
              />
              <select
                className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-600"
                value={newSkill.category}
                onChange={e => setNewSkill({...newSkill, category: e.target.value})}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Python & ML</option>
                <option>DevOps</option>
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded transition-colors cursor-pointer font-bold">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {skills.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded p-3">
                  <div>
                    <div className="text-zinc-100 font-bold text-xs">{s.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{s.category}</div>
                  </div>
                  <button onClick={() => handleDeleteSkill(s.id)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COURSES MANAGEMENT */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest pb-2 border-b border-zinc-800">
              Course & Material Catalog
            </h2>
            <form onSubmit={handleAddResource} className="space-y-3">
              <input
                type="text" placeholder="Course Title" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600"
                value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})}
              />
              <div className="flex gap-2">
                <input
                  type="text" placeholder="Platform (e.g. YouTube)" required
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-blue-600"
                  value={newResource.platform} onChange={e => setNewResource({...newResource, platform: e.target.value})}
                />
                <select
                  className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-600"
                  value={newResource.skillName} onChange={e => setNewResource({...newResource, skillName: e.target.value})} required
                >
                  <option value="" disabled>Select Skill...</option>
                  {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="URL" required
                  className="flex-[2] bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-650 focus:outline-none"
                  value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})}
                />
                <select
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                  value={newResource.cost} onChange={e => setNewResource({...newResource, cost: e.target.value})}
                >
                  <option>Free</option>
                  <option>Paid</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs">
                <Plus className="w-4 h-4" /> Create Course
              </button>
            </form>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {Object.entries(resources).map(([skillName, courses]) => (
                <div key={skillName} className="space-y-1.5 border-t border-zinc-800 pt-3 first:border-0 first:pt-0">
                  <h3 className="text-blue-400 text-[10px] uppercase tracking-widest font-bold">{skillName}</h3>
                  <div className="space-y-1.5">
                    {courses.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-zinc-950/60 border border-zinc-800 rounded p-2.5">
                        <div className="truncate text-xs text-zinc-350 pr-2">{c.title}</div>
                        <button onClick={() => handleDeleteResource(c.id)} className="text-red-400 hover:text-red-300 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Registry */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4 text-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
                  User Registry ({filteredUsers.length})
                </h2>
                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                  {userFilterTab === 'active' ? 'Active Records' : 'Archived / Soft-Deleted'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Database view of active and soft-deleted user records</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Active vs Soft-Deleted Filter Toggle */}
              <div className="flex items-center bg-zinc-950 p-1 rounded border border-zinc-800">
                <button
                  onClick={() => setUserFilterTab('active')}
                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    userFilterTab === 'active'
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Active ({userRegistry.filter(u => !u.isDeleted).length})
                </button>
                <button
                  onClick={() => setUserFilterTab('archived')}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    userFilterTab === 'archived'
                      ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Archive className="w-3 h-3" />
                  Archived ({userRegistry.filter(u => u.isDeleted).length})
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-600 font-sans placeholder:text-zinc-600"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="pb-3 pt-1 px-2">User ID</th>
                  <th className="pb-3 pt-1 px-2">Name & Status</th>
                  <th className="pb-3 pt-1 px-2">Email</th>
                  <th className="pb-3 pt-1 px-2">Education Level</th>
                  <th className="pb-3 pt-1 px-2">Field of Study</th>
                  <th className="pb-3 pt-1 px-2 text-right">Tokens</th>
                  <th className="pb-3 pt-1 text-center">Inspect</th>
                  <th className="pb-3 pt-1 text-center">{userFilterTab === 'archived' ? 'Restore' : 'Soft Delete'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2.5 px-2 font-mono text-[10px] text-zinc-500 truncate max-w-[100px]" title={u.id}>
                      {u.id}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-zinc-200">
                      <div className="flex items-center gap-1.5">
                        <span className={u.isDeleted ? 'line-through text-zinc-500' : ''}>{u.name}</span>
                        {u.isAdmin && <span className="text-[8px] bg-blue-900/40 text-blue-400 px-1 rounded border border-blue-700/30 font-bold uppercase">ADMIN</span>}
                        {u.isDeleted && <span className="text-[8px] bg-red-900/40 text-red-400 px-1 rounded border border-red-700/30 font-bold uppercase">ARCHIVED</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-zinc-400 font-mono text-[11px]">{u.email}</td>
                    <td className="py-2.5 px-2 text-zinc-300">{u.educationLevel || '—'}</td>
                    <td className="py-2.5 px-2 text-zinc-300">{u.fieldOfStudy || '—'}</td>
                    <td className="py-2.5 px-2 text-right text-zinc-100 font-mono font-semibold">{u.tokens}</td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-blue-400 hover:text-blue-300 bg-blue-600/10 border border-blue-600/20 px-2 py-1 rounded cursor-pointer text-[10px] font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                    <td className="py-2.5 text-center">
                      {u.isDeleted ? (
                        <button
                          onClick={() => handleRestoreUser(u.id)}
                          className="flex items-center justify-center gap-1 mx-auto text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-700/40 px-2 py-1 rounded cursor-pointer text-[10px] font-semibold transition-colors"
                          title="Restore account"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === currentUser.id}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Soft-delete & archive user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Quest Workshop */}
      {activeTab === 'quests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-zinc-100">
          {/* CREATE QUEST */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4 self-start">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
              Create Weekly Quest
            </h2>
            <form onSubmit={handleCreateQuest} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Assessment Title</label>
                <input
                  type="text" placeholder="e.g. Frontend Fundamentals Challenge" required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600"
                  value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  placeholder="Describe what this weekly quest tests..." required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none h-16 resize-none"
                  value={newQuest.description} onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Closing Date</label>
                  <input
                    type="date" required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                    value={newQuest.endDate} onChange={e => setNewQuest({...newQuest, endDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Token Reward Pool</label>
                  <input
                    type="number" required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                    value={newQuest.rewardTokens} onChange={e => setNewQuest({...newQuest, rewardTokens: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs">
                <Plus className="w-4 h-4" /> Create Quest
              </button>
            </form>

            {/* QUEST LIST */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block border-t border-zinc-800 pt-3 mb-2">Active Weekly Quests</label>
              {quests.map(q => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestId(q.id)}
                  className={`flex justify-between items-center p-3 rounded border transition-colors cursor-pointer ${
                    selectedQuestId === q.id
                      ? 'bg-blue-600/10 border-blue-600/35 text-blue-400'
                      : 'bg-zinc-950/60 border-zinc-850 text-zinc-350 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-xs truncate">{q.title}</div>
                    <div className="text-[9px] text-zinc-500 uppercase mt-0.5">{q.questions?.length || 0} Questions • 🪙 {q.rewardTokens}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteQuest(q.id); }} className="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* QUEST QUESTIONS CREATOR */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest flex items-center justify-between">
              <span>Assessment Questions</span>
              {selectedQuestId && <span className="text-[10px] bg-blue-900/30 border border-blue-700/30 text-blue-400 px-2 py-0.5 rounded font-sans">Selected Quest</span>}
            </h2>

            {selectedQuestId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* QUESTION FORM */}
                <form onSubmit={handleAddQuestion} className="space-y-3.5">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Add Multiple Choice Question</h3>
                  <div>
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Question Text</label>
                    <textarea
                      placeholder="e.g. Which keyword defines a class in C#?" required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none h-16 resize-none"
                      value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Option A</label>
                      <input
                        type="text" required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={newQuestion.optionA} onChange={e => setNewQuestion({...newQuestion, optionA: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Option B</label>
                      <input
                        type="text" required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={newQuestion.optionB} onChange={e => setNewQuestion({...newQuestion, optionB: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Option C</label>
                      <input
                        type="text" required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={newQuestion.optionC} onChange={e => setNewQuestion({...newQuestion, optionC: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Option D</label>
                      <input
                        type="text" required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={newQuestion.optionD} onChange={e => setNewQuestion({...newQuestion, optionD: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Correct Option</label>
                      <select
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={newQuestion.correctOption} onChange={e => setNewQuestion({...newQuestion, correctOption: e.target.value})}
                      >
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>D</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Points</label>
                      <input
                        type="number" required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs">
                    <Plus className="w-4 h-4" /> Add MCQ Item
                  </button>
                </form>

                {/* CURRENT QUESTIONS LIST */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-200 border-b border-zinc-800 pb-2">Questions Catalog</h3>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                    {(quests.find(q => q.id === selectedQuestId)?.questions || []).map((q, idx) => (
                      <div key={q.id} className="bg-zinc-950/60 border border-zinc-800 rounded p-3.5 relative">
                        <div className="flex justify-between items-start mb-2 pr-6">
                          <h4 className="text-xs font-bold text-zinc-200">
                            {idx + 1}. {q.questionText}
                          </h4>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-300 cursor-pointer absolute right-3 top-3">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500">
                          <div className={q.correctOption === 'A' ? 'text-emerald-400 font-semibold' : ''}>A: {q.optionA}</div>
                          <div className={q.correctOption === 'B' ? 'text-emerald-400 font-semibold' : ''}>B: {q.optionB}</div>
                          <div className={q.correctOption === 'C' ? 'text-emerald-400 font-semibold' : ''}>C: {q.optionC}</div>
                          <div className={q.correctOption === 'D' ? 'text-emerald-400 font-semibold' : ''}>D: {q.optionD}</div>
                        </div>
                        <div className="text-[8px] bg-zinc-805 border border-zinc-700 text-zinc-400 font-semibold px-2 py-0.5 rounded inline-block mt-3">
                          {q.points} Points
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500 italic text-xs">
                Select a weekly quest from the left panel to manage its question catalog.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Reward Merchant */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-zinc-100">
          {/* ADD REWARD */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4 self-start">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
              Create Redeemed Reward
            </h2>
            <form onSubmit={handleCreateReward} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Reward Title</label>
                <input
                  type="text" placeholder="e.g. 1-on-1 Mentorship Slot" required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600"
                  value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  placeholder="Detail the redemption benefit for the user..." required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-650 focus:outline-none h-20 resize-none"
                  value={newReward.description} onChange={e => setNewReward({...newReward, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  Upload Reward Image from Device
                </label>

                {newReward.imageUrl ? (
                  <div className="relative w-full h-36 rounded border border-blue-500/50 bg-zinc-950 overflow-hidden flex items-center justify-center mb-2">
                    <img src={newReward.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewReward(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full text-xs transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/40 rounded px-3 py-2 text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Browse Image from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-2">
                  <span className="text-[9px] text-zinc-500 block mb-1">Or paste Web Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or image path"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-[11px] text-white placeholder:text-zinc-650 focus:outline-none focus:border-blue-600"
                    value={newReward.imageUrl || ''}
                    onChange={e => setNewReward({ ...newReward, imageUrl: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Token Cost</label>
                <input
                  type="number" required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                  value={newReward.tokenCost} onChange={e => setNewReward({...newReward, tokenCost: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Voucher Access / Booking URL (Optional)</label>
                <input
                  type="url" placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                  value={newReward.rewardUrl} onChange={e => setNewReward({...newReward, rewardUrl: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs">
                <Plus className="w-4 h-4" /> Create Reward
              </button>
            </form>
          </div>

          {/* LIST REWARDS */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
              Reward Catalog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {rewards.map(r => (
                <div key={r.id} className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between space-y-3 relative">
                  <button onClick={() => handleDeleteReward(r.id)} className="absolute right-3 top-3 text-red-400 hover:text-red-300 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-2">
                    {r.imageUrl && (
                      <img src={r.imageUrl} alt={r.title} className="w-full h-28 object-cover rounded border border-zinc-800" />
                    )}
                    <h3 className="text-xs font-bold text-zinc-100 pr-6">{r.title}</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{r.description}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-3">
                    <span className="text-xs font-bold text-blue-400">🪙 {r.tokenCost} Tokens</span>
                    {r.rewardUrl && (
                      <a
                        href={r.rewardUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-zinc-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        Verify Link <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reward Orders & Delivery Fulfillment Module */}
      {activeTab === 'orders' && (
        <div className="space-y-4 text-zinc-100">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                  User Reward Orders & Delivery Fulfillment
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Manage physical reward deliveries, view recipient shipping addresses, and update order status (Waiting, Dispatched, Delivered).
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-semibold">Filter:</span>
                {['All', 'Waiting', 'Dispatched', 'Delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                      orderFilter === status
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">User / Email</th>
                    <th className="py-2.5 px-3">Reward Item</th>
                    <th className="py-2.5 px-3">Shipping Address & Contact</th>
                    <th className="py-2.5 px-3">Redeemed At</th>
                    <th className="py-2.5 px-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {orders
                    .filter(o => orderFilter === 'All' || o.status?.toLowerCase() === orderFilter.toLowerCase())
                    .map(order => (
                      <tr key={order.id} className="hover:bg-zinc-950/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {order.orderId || 'ORD-REQ'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-zinc-200">{order.userName}</div>
                          <div className="text-[10px] text-zinc-500">{order.userEmail}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {order.rewardImageUrl && (
                              <img src={order.rewardImageUrl} alt="" className="w-8 h-8 rounded object-cover border border-zinc-800 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-zinc-200">{order.rewardTitle}</div>
                              <div className="text-[10px] text-emerald-400 font-mono">🪙 {order.tokenCost} Tokens</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-medium text-zinc-300">{order.fullName} ({order.phoneNumber})</div>
                          <div className="text-[11px] text-zinc-500 truncate" title={order.shippingAddress}>
                            {order.shippingAddress}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-zinc-500">
                          {new Date(order.redeemedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={order.status || 'Waiting'}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`bg-zinc-950 border rounded px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
                              order.status === 'Delivered'
                                ? 'text-emerald-400 border-emerald-600/40 bg-emerald-950/20'
                                : order.status === 'Dispatched'
                                ? 'text-blue-400 border-blue-600/40 bg-blue-950/20'
                                : 'text-amber-400 border-amber-600/40 bg-amber-950/20'
                            }`}
                          >
                            <option value="Waiting">🟡 Waiting</option>
                            <option value="Dispatched">🔵 Dispatched</option>
                            <option value="Delivered">🟢 Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No reward orders found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Drawer */}
      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateTokens={handleUpdateTokens}
          onToggleAdmin={handleToggleAdmin}
          onDeleteUser={handleDeleteUser}
          onRestoreUser={handleRestoreUser}
        />
      )}
    </div>
  );
}
