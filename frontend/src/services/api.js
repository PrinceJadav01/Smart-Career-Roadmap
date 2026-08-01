// ═══════════════════════════════════════════════════════════
// Smart Career Roadmap — API Service Layer
// Centralized HTTP client for all backend communication
// ═══════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ── Token Management ──────────────────────────────────────
let authToken = localStorage.getItem('scr_token');
let currentUserId = localStorage.getItem('scr_userId');

export function setAuth(token, userId) {
  authToken = token;
  currentUserId = userId;
  localStorage.setItem('scr_token', token);
  localStorage.setItem('scr_userId', userId);
}

export function clearAuth() {
  authToken = null;
  currentUserId = null;
  localStorage.removeItem('scr_token');
  localStorage.removeItem('scr_userId');
}

export function getStoredUserId() {
  return currentUserId || localStorage.getItem('scr_userId');
}

export function getStoredToken() {
  return authToken || localStorage.getItem('scr_token');
}

// ── HTTP Helpers ──────────────────────────────────────────
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error ${res.status}`);
  }

  // Handle empty responses (204 No Content)
  if (res.status === 204) return null;

  return res.json();
}

// ── Auth Endpoints ────────────────────────────────────────
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuth(data.token, data.user.id);
  return data;
}

export async function register({ name, email, password, confirmPassword, phoneNumber, educationLevel, fieldOfStudy }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword, phoneNumber, educationLevel, fieldOfStudy }),
  });
  setAuth(data.token, data.user.id);
  return data;
}

// ── User Endpoints ────────────────────────────────────────
export async function getUser(userId) {
  return request(`/users/${userId}`);
}

export async function updateUser(userId, userData) {
  return request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// ── Skills Endpoints ──────────────────────────────────────
export async function getUserSkills(userId) {
  return request(`/users/${userId}/skills`);
}

export async function updateSkillLevel(userId, skillId, level) {
  return request(`/users/${userId}/skills/${skillId}`, {
    method: 'PUT',
    body: JSON.stringify({ level }),
  });
}

// ── Careers Endpoints ─────────────────────────────────────
export async function getCareers() {
  return request('/careers');
}

export async function getCareer(careerId) {
  return request(`/careers/${careerId}`);
}

// ── Quest Endpoints ───────────────────────────────────────
export async function getActiveQuest(userId) {
  return request(`/users/${userId}/quest`);
}

export async function setActiveQuest(userId, roleId) {
  return request(`/users/${userId}/quest`, {
    method: 'POST',
    body: JSON.stringify({ roleId }),
  });
}

export async function updateQuestProgress(userId, questData) {
  return request(`/users/${userId}/quest`, {
    method: 'PUT',
    body: JSON.stringify(questData),
  });
}

// ── Resources Endpoints ───────────────────────────────────
export async function getResources(skillName, userId) {
  const params = [];
  if (skillName) params.push(`skill=${encodeURIComponent(skillName)}`);
  if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return request(`/resources${query}`);
}

export async function updateResourceProgress(resourceId, userId, isCompleted) {
  return request(`/resources/${resourceId}/progress?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ isCompleted }),
  });
}

// ── Achievements Endpoints ────────────────────────────────
export async function getAchievements(userId) {
  return request(`/users/${userId}/achievements`);
}

export async function unlockAchievement(userId, achievementKey) {
  return request(`/users/${userId}/achievements`, {
    method: 'POST',
    body: JSON.stringify({ achievementKey }),
  });
}

// ── Admin Endpoints ───────────────────────────────────────
export async function createSkill(skillData) {
  return request('/skills', {
    method: 'POST',
    body: JSON.stringify(skillData),
  });
}

export async function deleteSkill(skillId) {
  return request(`/skills/${skillId}`, {
    method: 'DELETE',
  });
}

export async function createResource(resourceData) {
  return request('/resources', {
    method: 'POST',
    body: JSON.stringify(resourceData),
  });
}

export async function deleteResource(resourceId) {
  return request(`/resources/${resourceId}`, {
    method: 'DELETE',
  });
}

// ── ML Endpoints ──────────────────────────────────────────
export async function getAiGeneratedPath(targetRole, currentSkills) {
  return request('/ml/predict-path', {
    method: 'POST',
    body: JSON.stringify({
      targetRole,
      skills: currentSkills
    }),
  });
}

export async function suggestRoles(currentSkills) {
  return request('/ml/suggest-roles', {
    method: 'POST',
    body: JSON.stringify({
      skills: currentSkills
    }),
  });
}

// ── Admin CRUD Endpoints ────────────────────────────────────
export async function getAdminUsers() {
  return request('/admin/users');
}

export async function deleteAdminUser(id) {
  return request(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function restoreAdminUser(id) {
  return request(`/admin/users/${id}/restore`, {
    method: 'POST',
  });
}

export async function getAdminQuests() {
  return request('/admin/quests');
}

export async function createAdminQuest(quest) {
  return request('/admin/quests', {
    method: 'POST',
    body: JSON.stringify(quest),
  });
}

export async function deleteAdminQuest(id) {
  return request(`/admin/quests/${id}`, {
    method: 'DELETE',
  });
}

export async function addQuestQuestion(questId, question) {
  return request(`/admin/quests/${questId}/questions`, {
    method: 'POST',
    body: JSON.stringify(question),
  });
}

export async function deleteQuestQuestion(id) {
  return request(`/admin/questions/${id}`, {
    method: 'DELETE',
  });
}

export async function createAdminReward(reward) {
  return request('/admin/rewards', {
    method: 'POST',
    body: JSON.stringify(reward),
  });
}

export async function deleteAdminReward(id) {
  return request(`/admin/rewards/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminHealth() {
  return request('/admin/health');
}

export async function getAdminAuditLogs() {
  return request('/admin/audit-logs');
}

export async function updateUserTokens(id, amount, reason = 'Gifted by Admin') {
  return request(`/admin/users/${id}/tokens`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
}

export async function toggleUserAdmin(id) {
  return request(`/admin/users/${id}/toggle-admin`, {
    method: 'POST',
  });
}


// ── Weekly Quest Endpoints ──────────────────────────────────
export async function getActiveWeeklyQuest() {
  return request('/weeklyquests/active');
}

export async function submitWeeklyQuest(submission) {
  return request('/weeklyquests/submit', {
    method: 'POST',
    body: JSON.stringify(submission),
  });
}

export async function getQuestLeaderboard(questId) {
  return request(`/weeklyquests/leaderboard/${questId}`);
}

// ── Token Shop Endpoints ────────────────────────────────────
export async function getRewardsCatalog() {
  return request('/rewards');
}

export async function redeemReward(rewardId, shippingData = {}) {
  return request(`/rewards/redeem/${rewardId}`, {
    method: 'POST',
    body: JSON.stringify(shippingData),
  });
}

export async function getAdminRewardOrders() {
  return request('/admin/orders');
}

export async function updateOrderStatus(orderId, status) {
  return request(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
