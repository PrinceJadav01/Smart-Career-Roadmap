import React, { useState, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import Dashboard from './views/Dashboard';
import Skills from './views/Skills';
import Careers from './views/Careers';
import Roadmap from './views/Roadmap';
import Resources from './views/Resources';
import Achievements from './views/Achievements';
import Profile from './views/Profile';
import Admin from './views/Admin';
import Onboarding from './views/Onboarding';
import WeeklyQuest from './views/WeeklyQuest';
import TokenShop from './views/TokenShop';
import Login from './views/Login';
import SignUp from './views/SignUp';
import AdminLayout from './views/AdminLayout';
import { 
  Shield, Target, Award, BookOpen, User, 
  Menu, X, Edit3, Map,
  Sun, Moon
} from 'lucide-react';
import * as api from './services/api';

// Static Data definitions
const initialSkills = [
  // Frontend
  { name: 'HTML & CSS', level: 2, category: 'Frontend' },
  { name: 'JavaScript', level: 1, category: 'Frontend' },
  { name: 'React JS', level: 0, category: 'Frontend' },
  { name: 'TypeScript', level: 0, category: 'Frontend' },
  { name: 'Tailwind CSS', level: 2, category: 'Frontend' },
  // Backend
  { name: 'C# Programming', level: 1, category: 'Backend' },
  { name: 'ASP.NET Core', level: 0, category: 'Backend' },
  { name: 'REST APIs', level: 1, category: 'Backend' },
  { name: 'PostgreSQL', level: 1, category: 'Backend' },
  { name: 'Node.js', level: 0, category: 'Backend' },
  // Python & Machine Learning
  { name: 'Python Core', level: 2, category: 'Python & ML' },
  { name: 'FastAPI', level: 0, category: 'Python & ML' },
  { name: 'scikit-learn', level: 0, category: 'Python & ML' },
  { name: 'Pandas & NumPy', level: 1, category: 'Python & ML' },
  { name: 'Docker', level: 0, category: 'Backend' },
  { name: 'AWS', level: 0, category: 'Backend' },
  { name: 'Git', level: 2, category: 'Frontend' },
  { name: 'Kubernetes', level: 0, category: 'Backend' },
  { name: 'Cybersecurity Basics', level: 0, category: 'Backend' },
  { name: 'Figma', level: 0, category: 'Frontend' },
  { name: 'UX Research', level: 0, category: 'Frontend' },
  { name: 'Agile & Scrum', level: 0, category: 'Python & ML' },
  { name: 'Product Management', level: 0, category: 'Python & ML' },
  { name: 'Technical Writing', level: 0, category: 'Python & ML' },
  { name: 'Business Analysis', level: 0, category: 'Python & ML' },
  { name: 'Blockchain & Solidity', level: 0, category: 'Backend' },
  { name: 'Data Visualization', level: 0, category: 'Python & ML' },
  { name: 'QA & Testing', level: 0, category: 'Backend' },
  { name: 'SEO & Marketing', level: 0, category: 'Python & ML' },
  { name: 'IT Support & Networking', level: 0, category: 'Backend' },
  { name: 'Mobile Dev (iOS/Android)', level: 0, category: 'Frontend' }
];

const careerRoles = [
  {
    name: 'Frontend Developer',
    demand: 'High Demand',
    salary: '₹6-18 LPA',
    requirements: [
      { skill: 'HTML & CSS', importance: 5 },
      { skill: 'JavaScript', importance: 5 },
      { skill: 'React JS', importance: 5 },
      { skill: 'Tailwind CSS', importance: 4 },
      { skill: 'TypeScript', importance: 4 }
    ]
  },
  {
    name: 'Backend Developer',
    demand: 'Critical',
    salary: '₹8-22 LPA',
    requirements: [
      { skill: 'C# Programming', importance: 5 },
      { skill: 'ASP.NET Core', importance: 5 },
      { skill: 'REST APIs', importance: 5 },
      { skill: 'PostgreSQL', importance: 4 },
      { skill: 'Node.js', importance: 3 }
    ]
  },
  {
    name: 'Full Stack Developer',
    demand: 'Critical',
    salary: '₹10-25 LPA',
    requirements: [
      { skill: 'HTML & CSS', importance: 4 },
      { skill: 'JavaScript', importance: 5 },
      { skill: 'React JS', importance: 5 },
      { skill: 'C# Programming', importance: 4 },
      { skill: 'ASP.NET Core', importance: 4 },
      { skill: 'REST APIs', importance: 5 },
      { skill: 'PostgreSQL', importance: 4 }
    ]
  },
  {
    name: 'Machine Learning Engineer',
    demand: 'High Demand',
    salary: '₹12-28 LPA',
    requirements: [
      { skill: 'Python Core', importance: 5 },
      { skill: 'FastAPI', importance: 4 },
      { skill: 'scikit-learn', importance: 5 },
      { skill: 'Pandas & NumPy', importance: 5 },
      { skill: 'REST APIs', importance: 3 }
    ]
  },
  {
    name: 'Data Scientist',
    demand: 'High Demand',
    salary: '₹15-30 LPA',
    requirements: [
      { skill: 'Python Core', importance: 5 },
      { skill: 'PostgreSQL', importance: 4 },
      { skill: 'Data Visualization', importance: 4 },
      { skill: 'AWS', importance: 2 }
    ]
  },
  {
    name: 'DevOps Engineer',
    demand: 'Critical',
    salary: '₹15-28 LPA',
    requirements: [
      { skill: 'Docker', importance: 5 },
      { skill: 'AWS', importance: 4 },
      { skill: 'Git', importance: 4 },
      { skill: 'Python Core', importance: 3 },
      { skill: 'Kubernetes', importance: 4 }
    ]
  },
  {
    name: 'Cloud Architect',
    demand: 'Critical',
    salary: '₹18-35 LPA',
    requirements: [
      { skill: 'AWS', importance: 5 },
      { skill: 'Docker', importance: 4 },
      { skill: 'Kubernetes', importance: 4 },
      { skill: 'Python Core', importance: 3 },
      { skill: 'Git', importance: 3 }
    ]
  },
  {
    name: 'Cybersecurity Analyst',
    demand: 'High Demand',
    salary: '₹10-25 LPA',
    requirements: [
      { skill: 'Cybersecurity Basics', importance: 5 },
      { skill: 'Python Core', importance: 4 },
      { skill: 'IT Support & Networking', importance: 3 },
      { skill: 'PostgreSQL', importance: 2 }
    ]
  },
  {
    name: 'Mobile App Developer',
    demand: 'High Demand',
    salary: '₹8-20 LPA',
    requirements: [
      { skill: 'Mobile Dev (iOS/Android)', importance: 5 },
      { skill: 'JavaScript', importance: 4 },
      { skill: 'React JS', importance: 4 },
      { skill: 'Git', importance: 3 }
    ]
  },
  {
    name: 'UI/UX Designer',
    demand: 'High Demand',
    salary: '₹6-18 LPA',
    requirements: [
      { skill: 'Figma', importance: 5 },
      { skill: 'UX Research', importance: 4 },
      { skill: 'HTML & CSS', importance: 3 }
    ]
  },
  {
    name: 'Product Manager',
    demand: 'High Demand',
    salary: '₹15-35 LPA',
    requirements: [
      { skill: 'Product Management', importance: 5 },
      { skill: 'Agile & Scrum', importance: 4 },
      { skill: 'Business Analysis', importance: 3 },
      { skill: 'UX Research', importance: 2 }
    ]
  },
  {
    name: 'Scrum Master',
    demand: 'Average',
    salary: '₹12-24 LPA',
    requirements: [
      { skill: 'Agile & Scrum', importance: 5 },
      { skill: 'Product Management', importance: 3 },
      { skill: 'Business Analysis', importance: 2 }
    ]
  },
  {
    name: 'Technical Writer',
    demand: 'Average',
    salary: '₹6-15 LPA',
    requirements: [
      { skill: 'Technical Writing', importance: 5 },
      { skill: 'HTML & CSS', importance: 3 },
      { skill: 'Git', importance: 3 }
    ]
  },
  {
    name: 'Business Analyst',
    demand: 'High Demand',
    salary: '₹8-20 LPA',
    requirements: [
      { skill: 'Business Analysis', importance: 5 },
      { skill: 'Data Visualization', importance: 4 },
      { skill: 'PostgreSQL', importance: 3 },
      { skill: 'Agile & Scrum', importance: 3 }
    ]
  },
  {
    name: 'IT Support Specialist',
    demand: 'Average',
    salary: '₹3-8 LPA',
    requirements: [
      { skill: 'IT Support & Networking', importance: 5 },
      { skill: 'Cybersecurity Basics', importance: 3 },
      { skill: 'PostgreSQL', importance: 2 }
    ]
  },
  {
    name: 'Blockchain Developer',
    demand: 'High Demand',
    salary: '₹15-30 LPA',
    requirements: [
      { skill: 'Blockchain & Solidity', importance: 5 },
      { skill: 'JavaScript', importance: 4 },
      { skill: 'Python Core', importance: 3 },
      { skill: 'Git', importance: 3 }
    ]
  },
  {
    name: 'Data Analyst',
    demand: 'High Demand',
    salary: '₹6-16 LPA',
    requirements: [
      { skill: 'PostgreSQL', importance: 5 },
      { skill: 'Data Visualization', importance: 5 },
      { skill: 'Python Core', importance: 4 },
      { skill: 'Business Analysis', importance: 3 }
    ]
  },
  {
    name: 'QA Engineer',
    demand: 'Average',
    salary: '₹6-15 LPA',
    requirements: [
      { skill: 'QA & Testing', importance: 5 },
      { skill: 'Python Core', importance: 3 },
      { skill: 'JavaScript', importance: 3 },
      { skill: 'Git', importance: 3 },
      { skill: 'Agile & Scrum', importance: 2 }
    ]
  },
  {
    name: 'Digital Marketing Specialist',
    demand: 'High Demand',
    salary: '₹5-12 LPA',
    requirements: [
      { skill: 'SEO & Marketing', importance: 5 },
      { skill: 'Data Visualization', importance: 3 },
      { skill: 'HTML & CSS', importance: 2 }
    ]
  }
];

const allAchievements = [
  { id: 'first_quest', name: 'First Milestone', description: 'Unlock your first skill node by leveling it up.', icon: '🌟' },
  { id: 'streak_3', name: 'Dedicated Learner', description: 'Gain a 3-day active quest log streak.', icon: '🔥' },
  { id: 'skills_10', name: 'Jack of All Trades', description: 'Unlock 10 distinct skill spheres.', icon: '⚡' },
  { id: 'target_chosen', name: 'Destiny Defined', description: 'Accept a career target role quest.', icon: '🎯' },
  { id: 'master_level', name: 'Guild Master', description: 'Reach Level 10 on your profile.', icon: '👑' },
  { id: 'job_ready', name: 'Vanguard Adept', description: 'Achieve 85% score readiness.', icon: '🛡️' }
];

const resourcesCatalog = {
  'HTML & CSS': [
    { title: 'HTML & CSS Full Course for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=mU6anWqZJcc', time: '6 hrs', cost: 'Free', type: 'video' },
    { title: 'CSS Layouts Masterclass', platform: 'Coursera', url: 'https://www.coursera.org/specializations/css-design', time: '4 weeks', cost: 'Free Audit', type: 'course' }
  ],
  'JavaScript': [
    { title: 'JavaScript Tutorial for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', time: '1 hr', cost: 'Free', type: 'video' },
    { title: 'Modern JavaScript (Deep Dive)', platform: 'Udemy', url: 'https://www.udemy.com/course/the-complete-javascript-course/', time: '68 hrs', cost: 'Paid', type: 'course' }
  ],
  'React JS': [
    { title: 'React JS Course for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', time: '3 hrs', cost: 'Free', type: 'video' },
    { title: 'React Documentation Core Guides', platform: 'Official Docs', url: 'https://react.dev/learn', time: 'Self-paced', cost: 'Free', type: 'article' }
  ],
  'TypeScript': [
    { title: 'TypeScript Course for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs', time: '4 hrs', cost: 'Free', type: 'video' },
    { title: 'TypeScript Official Handbook', platform: 'Official Docs', url: 'https://www.typescriptlang.org/docs/', time: 'Self-paced', cost: 'Free', type: 'article' }
  ],
  'Tailwind CSS': [
    { title: 'Tailwind CSS Course', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=UBOj6rqRUME', time: '2 hrs', cost: 'Free', type: 'video' },
    { title: 'Tailwind CSS Docs', platform: 'Official Docs', url: 'https://tailwindcss.com/docs', time: 'Self-paced', cost: 'Free', type: 'article' }
  ],
  'C# Programming': [
    { title: 'C# Tutorial for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=GhQdlIFylQ8', time: '4 hrs', cost: 'Free', type: 'video' },
    { title: 'C# Fundamentals', platform: 'Pluralsight', url: 'https://www.pluralsight.com/courses/csharp-fundamentals', time: '5 hrs', cost: 'Paid', type: 'course' }
  ],
  'ASP.NET Core': [
    { title: 'ASP.NET Core Web API Complete Course', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=hBso78531cf', time: '8 hrs', cost: 'Free', type: 'video' },
    { title: 'ASP.NET Core Official Microsoft Tutorials', platform: 'Microsoft Docs', url: 'https://learn.microsoft.com/en-us/aspnet/core/', time: 'Self-paced', cost: 'Free', type: 'article' }
  ],
  'REST APIs': [
    { title: 'REST API Concepts & Designing', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=-M5Ax5Uxpcg', time: '1 hr', cost: 'Free', type: 'video' }
  ],
  'PostgreSQL': [
    { title: 'PostgreSQL Tutorial for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=qw5y87951cf', time: '4 hrs', cost: 'Free', type: 'video' }
  ],
  'Node.js': [
    { title: 'Node.js Full Course', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', time: '10 hrs', cost: 'Free', type: 'video' }
  ],
  'Python Core': [
    { title: 'Python for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', time: '6 hrs', cost: 'Free', type: 'video' }
  ],
  'FastAPI': [
    { title: 'FastAPI Tutorial', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=tLKKmCO5SIk', time: '3 hrs', cost: 'Free', type: 'video' }
  ],
  'scikit-learn': [
    { title: 'Machine Learning with Scikit-Learn', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=pqNCD_5r0IU', time: '4 hrs', cost: 'Free', type: 'video' }
  ],
  'Pandas & NumPy': [
    { title: 'Data Analysis with Pandas & NumPy', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=r-uOLxNyhdw', time: '5 hrs', cost: 'Free', type: 'video' }
  ]
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  const [isLoggedIn, setIsLoggedIn] = useState(!!api.getStoredToken());
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'signup'
  const [theme, setTheme] = useState('dark');
  const [onboardingComplete, setOnboardingComplete] = useState(true); // assume true until we check
  const [adminTab, setAdminTab] = useState('dashboard');
  
  // Game user profile state
  const [userProfile, setUserProfile] = useState({
    id: null,
    name: 'Adventurer',
    email: '',
    level: 1,
    xp: 0,
    maxXp: 3000,
    streak: 0,
    badgesEarned: 0,
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    isAdmin: false
  });

  // User Skill matrices state (will be fetched from API)
  const [userSkills, setUserSkills] = useState(initialSkills);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  // Career roles from API
  const [careerRolesData, setCareerRolesData] = useState(careerRoles);
  // Resources from API
  const [resourcesData, setResourcesData] = useState(resourcesCatalog);
  
  // Dynamic Attributes derived from skill levels
  const [attributes, setAttributes] = useState({
    technical: 72,
    problemSolving: 65,
    collaboration: 80,
    communication: 58
  });

  // Recalculate attributes on skill levels change
  useEffect(() => {
    const activeSkills = userSkills.filter(s => s.level > 0).length;
    const avgSkillLvl = activeSkills > 0 
      ? userSkills.reduce((acc, curr) => acc + curr.level, 0) / userSkills.length 
      : 0;

    // Simulate attribute scores based on actual skill ratings
    const calculatedTech = Math.min(40 + Math.round(avgSkillLvl * 12), 100);
    const calculatedProblem = Math.min(45 + Math.round(avgSkillLvl * 10), 100);
    
    setAttributes(prev => ({
      ...prev,
      technical: calculatedTech,
      problemSolving: calculatedProblem
    }));
  }, [userSkills]);

  // ── Fetch all data from API after login ──────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const userId = api.getStoredUserId();
    if (!userId) return;

    const loadData = async () => {
      try {
        // Fetch user profile
        const userData = await api.getUser(userId);
        if (userData) {
          setUserProfile({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            level: userData.level,
            xp: userData.xp,
            maxXp: userData.maxXp,
            streak: userData.streak,
            badgesEarned: userData.badgesEarned,
            bio: userData.bio || '',
            githubUrl: userData.githubUrl || '',
            linkedinUrl: userData.linkedinUrl || '',
            isAdmin: userData.isAdmin || false,
            tokens: userData.tokens || 0
          });
        }

        // Fetch user skills
        const skillsData = await api.getUserSkills(userId);
        if (skillsData && skillsData.length > 0) {
          setUserSkills(skillsData.map(s => ({
            id: s.id,
            name: s.name,
            level: s.level,
            category: s.category
          })));
        }

        // Fetch career roles
        const careersData = await api.getCareers();
        if (careersData && careersData.length > 0) {
          setCareerRolesData(careersData.map(r => ({
            id: r.id,
            name: r.name,
            demand: r.demand,
            salary: r.salary,
            requirements: r.requirements
          })));
        }

        // Fetch active quest — also determines if onboarding is needed
        const questData = await api.getActiveQuest(userId);
        if (questData && questData.roleName) {
          setSelectedRole(questData.roleName);
          setOnboardingComplete(true);
        } else {
          // No active quest means user hasn't onboarded yet
          setOnboardingComplete(false);
        }

        // Fetch achievements
        const achievementsData = await api.getAchievements(userId);
        if (achievementsData) {
          setUnlockedAchievements(achievementsData.map(a => a.achievementKey));
        }

        // Fetch resources
        const resourcesResult = await api.getResources(null, userId);
        if (resourcesResult && Object.keys(resourcesResult).length > 0) {
          // Transform API response to match frontend shape
          const transformed = {};
          for (const [skillName, items] of Object.entries(resourcesResult)) {
            transformed[skillName] = items.map(r => ({
              id: r.id,
              title: r.title,
              platform: r.platform,
              url: r.url,
              time: r.duration || 'N/A',
              cost: r.cost || 'Free',
              type: r.platform === 'YouTube' ? 'video' : r.platform === 'Official Docs' ? 'article' : 'course',
              isCompleted: r.isCompleted
            }));
          }
          setResourcesData(prev => ({ ...prev, ...transformed }));
        }
      } catch (err) {
        console.error('Failed to load data from API:', err);
        // Fallback: keep mock data if API is unreachable
      }
    };

    loadData();
  }, [isLoggedIn]);

  // ── Skill updates — calls API then syncs local state ────
  const updateSkillLevel = async (skillName, newLevel) => {
    // Find the skill's ID for the API call
    const skill = userSkills.find(s => s.name === skillName);
    const userId = api.getStoredUserId();

    // Optimistic local update first
    setUserSkills(prev => prev.map(s => s.name === skillName ? { ...s, level: newLevel } : s));

    try {
      if (skill?.id && userId) {
        const result = await api.updateSkillLevel(userId, skill.id, newLevel);
        // Sync profile with server-calculated XP/Level
        if (result?.user) {
          setUserProfile(prev => ({
            ...prev,
            xp: result.user.xp,
            level: result.user.level,
            maxXp: result.user.maxXp,
            badgesEarned: result.user.badgesEarned
          }));
        }
      } else {
        // Fallback: client-side XP calc if no API
        const oldSkill = userSkills.find(s => s.name === skillName);
        const diff = newLevel - (oldSkill?.level || 0);
        if (diff > 0) awardXp(diff * 250);
      }
    } catch (err) {
      console.error('Skill update API failed:', err);
      // Fallback: client-side XP calc
      const oldSkill = userSkills.find(s => s.name === skillName);
      const diff = newLevel - (oldSkill?.level || 0);
      if (diff > 0) awardXp(diff * 250);
    }

    // Check achievements
    const updatedSkills = userSkills.map(s => s.name === skillName ? { ...s, level: newLevel } : s);
    const activeCount = updatedSkills.filter(s => s.level > 0).length;
    if (activeCount >= 10 && !unlockedAchievements.includes('skills_10')) {
      unlockAchievement('skills_10');
    }
  };

  const awardXp = (amount) => {
    setUserProfile(prev => {
      let newXp = prev.xp + amount;
      let newLvl = prev.level;
      let newMaxXp = prev.maxXp;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLvl += 1;
        newMaxXp = Math.round(newMaxXp * 1.25);
        
        if (newLvl >= 10 && !unlockedAchievements.includes('master_level')) {
          unlockAchievement('master_level');
        }
      }

      return { ...prev, xp: newXp, level: newLvl, maxXp: newMaxXp };
    });
  };

  const unlockAchievement = async (id) => {
    if (unlockedAchievements.includes(id)) return;
    
    setUnlockedAchievements(prev => [...prev, id]);
    setUserProfile(p => ({ ...p, badgesEarned: p.badgesEarned + 1 }));

    try {
      const userId = api.getStoredUserId();
      if (userId) await api.unlockAchievement(userId, id);
    } catch (err) {
      console.error('Achievement unlock API failed:', err);
    }
  };

  const selectTargetRole = async (roleName) => {
    setSelectedRole(roleName);

    try {
      const userId = api.getStoredUserId();
      const role = careerRolesData.find(r => r.name === roleName);
      if (userId && role?.id) {
        await api.setActiveQuest(userId, role.id);
        // Refresh profile to get updated XP from server
        const userData = await api.getUser(userId);
        if (userData) {
          setUserProfile(prev => ({
            ...prev,
            xp: userData.xp,
            level: userData.level,
            maxXp: userData.maxXp
          }));
        }
      } else {
        awardXp(200);
      }
    } catch (err) {
      console.error('Quest select API failed:', err);
      awardXp(200); // Fallback
    }

    if (!unlockedAchievements.includes('target_chosen')) {
      unlockAchievement('target_chosen');
    }
  };

  const renderView = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={userProfile} 
            selectedRole={selectedRole}
            userSkills={userSkills}
            careerRoles={careerRolesData}
            setPage={setCurrentPage}
          />
        );
      case 'skills':
        return (
          <Skills 
            userSkills={userSkills}
            updateSkillLevel={updateSkillLevel}
          />
        );
      case 'careers':
        return (
          <Careers 
            careerRoles={careerRolesData}
            selectedRole={selectedRole}
            userSkills={userSkills}
            selectTargetRole={selectTargetRole}
          />
        );
      case 'roadmap':
        return (
          <Roadmap 
            selectedRole={selectedRole}
            userSkills={userSkills}
            careerRoles={careerRolesData}
            resourcesCatalog={resourcesData}
          />
        );
      case 'resources':
        return (
          <Resources 
            resourcesCatalog={resourcesData}
          />
        );
      case 'achievements':
        return (
          <Achievements 
            userProfile={userProfile}
            unlockedAchievements={unlockedAchievements}
            allAchievements={allAchievements}
          />
        );
      case 'weeklyquest':
        return (
          <WeeklyQuest />
        );
      case 'tokenshop':
        return (
          <TokenShop 
            userProfile={userProfile} 
            onUpdateTokens={(tok) => setUserProfile(prev => ({ ...prev, tokens: tok }))} 
          />
        );
      case 'profile':
        return (
          <Profile 
            userProfile={userProfile}
            userSkills={userSkills}
            selectedRole={selectedRole}
            unlockedAchievements={unlockedAchievements}
            allAchievements={allAchievements}
            resourcesData={resourcesData}
            onLogout={() => {
              api.clearAuth();
              setIsLoggedIn(false);
              setCurrentPage('dashboard');
            }}
            onUpdateProfile={async (updatedData) => {
              try {
                const updated = await api.updateUser(userProfile.id, {
                  ...userProfile,
                  name: updatedData.name,
                  bio: updatedData.bio,
                  githubUrl: updatedData.githubUrl,
                  linkedinUrl: updatedData.linkedinUrl
                });
                setUserProfile(prev => ({
                  ...prev,
                  name: updated.name,
                  bio: updated.bio,
                  githubUrl: updated.githubUrl,
                  linkedinUrl: updated.linkedinUrl
                }));
              } catch (err) {
                console.error('Failed to update profile:', err);
              }
            }}
            onToggleResource={async (resourceId, isCompleted) => {
              try {
                await api.updateResourceProgress(resourceId, userProfile.id, isCompleted);
                // Sync local state
                setResourcesData(prev => {
                  const next = { ...prev };
                  for (const [skillName, items] of Object.entries(next)) {
                    next[skillName] = items.map(item => 
                      item.id === resourceId ? { ...item, isCompleted } : item
                    );
                  }
                  return next;
                });
              } catch (err) {
                console.error('Failed to update resource completion:', err);
              }
            }}
          />
        );
      case 'admin':
        return <Admin currentUser={userProfile} />;
      default:
        return <Dashboard userProfile={userProfile} selectedRole={selectedRole} userSkills={userSkills} careerRoles={careerRolesData} setPage={setCurrentPage} />;
    }
  };

  const xpPercentage = (userProfile.xp / userProfile.maxXp) * 100;

  // ── Onboarding screen (after login, before main app) ────
  if (isLoggedIn && !onboardingComplete) {
    return (
      <Onboarding
        userProfile={userProfile}
        onComplete={async (roleName, selectedSkillsMap) => {
          // Save selected skills to API
          try {
            const userId = api.getStoredUserId();
            if (userId) {
              // Update skill levels on server
              for (const [skillName, level] of Object.entries(selectedSkillsMap)) {
                const skill = userSkills.find(s => s.name === skillName);
                if (skill?.id) {
                  await api.updateSkillLevel(userId, skill.id, level);
                }
              }
              // Set active quest
              const role = careerRolesData.find(r => r.name === roleName);
              if (role?.id) {
                await api.setActiveQuest(userId, role.id);
              }
            }
          } catch (err) {
            console.error('Failed to save onboarding data:', err);
          }
          // Update local state
          setSelectedRole(roleName);
          setUserSkills(prev => prev.map(s => {
            const newLevel = selectedSkillsMap[s.name];
            return newLevel !== undefined ? { ...s, level: newLevel } : s;
          }));
          setOnboardingComplete(true);
          setCurrentPage('dashboard');
        }}
      />
    );
  }

  // ── Auth success handler (shared by Login + SignUp) ──────
  const handleAuthSuccess = (data) => {
    setUserProfile({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      level: data.user.level,
      xp: data.user.xp,
      maxXp: data.user.maxXp,
      streak: data.user.streak,
      badgesEarned: data.user.badgesEarned,
      isAdmin: data.user.isAdmin || false,
      tokens: data.user.tokens || 0
    });
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100dvh', background: '#08090E' }}>
        {authPage === 'login' ? (
          <Login
            onLoginSuccess={async (email, password) => {
              const data = await api.login(email, password);
              handleAuthSuccess(data);
            }}
            onSwitchToSignUp={() => setAuthPage('signup')}
          />
        ) : (
          <SignUp
            onRegisterSuccess={async (formData) => {
              const data = await api.register(formData);
              handleAuthSuccess(data);
            }}
            onSwitchToLogin={() => setAuthPage('login')}
          />
        )}
      </div>
    );
  }

  if (isLoggedIn && currentPage === 'admin') {
    return (
      <AdminLayout
        adminUser={userProfile}
        activeTab={adminTab}
        onTabChange={setAdminTab}
        onExitAdmin={() => setCurrentPage('dashboard')}
      >
        <Admin currentUser={userProfile} activeTab={adminTab} />
      </AdminLayout>
    );
  }

  // ── Nav item definitions ─────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>, tag: null },
    { id: 'skills',    label: 'Skills',         icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>, tag: userSkills.filter(s => s.level > 0).length },
    { id: 'weeklyquest', label: 'Weekly Quest', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, tag: null },
    { id: 'tokenshop', label: 'Rewards',        icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M9 11h6"/></svg>, tag: userProfile.tokens || null },
    { id: 'careers',   label: 'Careers',        icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>, tag: null },
    { id: 'roadmap',   label: 'Roadmap',        icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3"/></svg>, tag: null },
    { id: 'resources', label: 'Resources',      icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>, tag: null },
    { id: 'achievements', label: 'Achievements', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>, tag: unlockedAchievements.length || null },
    { id: 'profile',   label: 'Profile',        icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, tag: null },
    ...(userProfile.isAdmin ? [{ id: 'admin', label: 'Admin', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, tag: null }] : [])
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#08090E', color: '#F1F2F4', fontFamily: 'Inter, sans-serif' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99 }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: 256,
        background: '#0B0C14',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }} className={`fixed top-0 bottom-0 left-0 z-[100] ${sidebarOpen ? 'translate-x-0' : '-translate-x-[260px]'} lg:translate-x-0 lg:static lg:z-0`}>
        
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem 1.25rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
            <img src="/logo.png" alt="SkillSathi Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.975rem', color: '#F1F2F4', lineHeight: 1.2 }}>SkillSathi</div>
              <div style={{ fontSize: '0.675rem', color: '#4B5068', marginTop: '0.15rem', letterSpacing: '0.04em' }}>Smart Career Roadmap</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  style={{ width: '100%' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, flexShrink: 0, color: 'inherit' }}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.tag !== null && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 6,
                      background: 'var(--color-accent-dim)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border-accent)'
                    }}>{item.tag}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.675rem', color: '#4B5068' }}>
          SkillSathi &copy; {new Date().getFullYear()}
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100dvh' }}>
        
        {/* Top Header bar */}
        <header style={{
          height: 64,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(11, 12, 20, 0.5)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#8A8FA8', cursor: 'pointer', padding: 0 }}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Title or custom breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#8A8FA8', fontWeight: 500 }} className="hidden sm:inline">
              Workspace
            </span>
            <span style={{ color: '#4B5068' }} className="hidden sm:inline">/</span>
            <span style={{ fontSize: '0.8125rem', color: '#F1F2F4', fontWeight: 600, textTransform: 'capitalize' }}>
              {currentPage}
            </span>
          </div>

          {/* User profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setCurrentPage('profile')}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #00C896 0%, #008765 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#08090E' }}>
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8125rem', color: '#F1F2F4', fontWeight: 650 }} className="hidden md:inline">
                {userProfile.name}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page viewport */}
        <main style={{ flex: 1, padding: '1.5rem 1.5rem 3rem 1.5rem', overflowY: 'auto' }} className="lg:max-w-7xl lg:mx-auto w-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
