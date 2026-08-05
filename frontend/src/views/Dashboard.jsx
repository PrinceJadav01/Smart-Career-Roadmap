import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle, Shield, Target, TrendingUp, Zap, Sparkles, Layers, ArrowUpRight } from 'lucide-react';

const Dashboard = ({ userProfile, selectedRole, userSkills, careerRoles, setPage }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Find selected role details
  const roleInfo = careerRoles.find(r => r.name === selectedRole) || careerRoles[0];

  // Calculate matching score (employability)
  const calculateEmployability = () => {
    if (!roleInfo) return 0;
    
    let totalWeight = 0;
    let earnedWeight = 0;

    roleInfo.requirements.forEach(req => {
      const userSkill = userSkills.find(s => s.name === req.skill);
      const level = userSkill ? userSkill.level : 0;
      const targetLevel = req.importance;
      
      totalWeight += targetLevel;
      earnedWeight += Math.min(level, targetLevel);
    });

    const hasAnySkill = userSkills && userSkills.some(s => s.level > 0);
    return (hasAnySkill && totalWeight > 0) ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  };

  const score = calculateEmployability();

  useEffect(() => {
    setAnimatedScore(0);
    const timeout = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const strokeCircumference = 2 * Math.PI * 68;
  const strokeDashoffset = strokeCircumference - (animatedScore / 100) * strokeCircumference;

  const getReadinessLabel = (val) => {
    if (val >= 85) return { label: 'Job Ready', badge: 'badge-accent' };
    if (val >= 60) return { label: 'Almost Ready', badge: 'badge-warn' };
    if (val >= 35) return { label: 'Developing Skills', badge: 'badge-neutral' };
    return { label: 'Beginning Journey', badge: 'badge-danger' };
  };

  const status = getReadinessLabel(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div className="surface" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: '100%', background: 'radial-gradient(circle, rgba(0,200,150,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '42rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '0.75rem' }}>
              <Sparkles style={{ width: 12, height: 12 }} /> Target Role: {selectedRole}
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
              Welcome back, {userProfile.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Your career match rating for <strong style={{ color: '#F1F2F4' }}>{selectedRole}</strong> is currently at <strong style={{ color: '#00C896' }}>{score}%</strong>. Keep leveling up your key skills to close the gap.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div className="surface-2" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 95 }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#00C896', display: 'block' }}>
                {userProfile.streak}d
              </span>
              <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Streak
              </span>
            </div>
            <div className="surface-2" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 95 }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#60A5FA', display: 'block' }}>
                {userSkills.filter(s => s.level > 0).length}
              </span>
              <span style={{ fontSize: '0.675rem', color: '#4B5068', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Skills Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Match Ring Card */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8A8FA8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Role Match Rating
            </span>
            <span className={`badge ${status.badge}`}>
              {status.label}
            </span>
          </div>

          <div style={{ position: 'relative', width: 170, height: 170, margin: '1rem 0' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="68" className="score-ring-track" fill="none" strokeWidth="10" />
              <circle
                cx="80"
                cy="80"
                r="68"
                className="score-ring-fill"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#F1F2F4', lineHeight: 1 }}>
                {animatedScore}<span style={{ fontSize: '1.125rem', color: '#00C896' }}>%</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: '#4B5068', marginTop: '0.25rem' }}>Employability</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.5rem' }}>
            Targeting: <strong style={{ color: '#F1F2F4' }}>{selectedRole}</strong>
          </p>
          <button
            onClick={() => setPage('careers')}
            className="btn-ghost"
            style={{ marginTop: '0.875rem', fontSize: '0.75rem', padding: '0.4rem 0.875rem' }}
          >
            Change Target Role <Target style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', gridColumn: 'span 2' }}>
          <div className="stat-card">
            <div className="stat-icon">
              <Layers style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div className="stat-value">Level {userProfile.level}</div>
              <div className="stat-label">Profile Standing</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#60A5FA' }}>
              <BookOpen style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div className="stat-value">{userSkills.filter(s => s.level > 0).length} / {userSkills.length}</div>
              <div className="stat-label">Skills Discovered</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#00C896' }}>
              <CheckCircle style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div className="stat-value">{userSkills.filter(s => s.level >= 4).length} Skills</div>
              <div className="stat-label">Proficient (Lv. 4+)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#FBBF24' }}>
              <Award style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div className="stat-value">{userProfile.badgesEarned} Badges</div>
              <div className="stat-label">Achievements Unlocked</div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Roadmap Preview */}
      <div className="surface" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.875rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.125rem', fontWeight: 600, color: '#F1F2F4' }}>
              Priority Learning Path
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#8A8FA8', marginTop: '0.2rem' }}>Key requirements for {selectedRole}</p>
          </div>
          <button
            onClick={() => setPage('roadmap')}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
          >
            Full Roadmap <ArrowUpRight style={{ width: 13, height: 13 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {roleInfo.requirements.slice(0, 4).map((req, idx) => {
            const userSkill = userSkills.find(s => s.name === req.skill);
            const level = userSkill ? userSkill.level : 0;
            const isCompleted = level >= 4;
            const inProgress = level > 0 && level < 4;

            return (
              <div
                key={req.skill}
                className="surface-2"
                style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderLeft: `3px solid ${isCompleted ? '#00C896' : inProgress ? '#60A5FA' : 'rgba(255,255,255,0.1)'}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 600, color: '#8A8FA8', flexShrink: 0 }}>
                    0{idx + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9375rem', color: '#F1F2F4' }}>
                        {req.skill}
                      </span>
                      {isCompleted && <span className="badge badge-accent">Mastered</span>}
                      {inProgress && <span className="badge badge-warn">In Progress</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#4B5068', marginTop: '0.2rem' }}>
                      Importance: {'★'.repeat(req.importance)}{'☆'.repeat(5 - req.importance)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.675rem', color: '#4B5068', display: 'block' }}>Current Level</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.875rem', color: '#F1F2F4' }}>{level}/5</span>
                  </div>
                  <button
                    onClick={() => setPage('skills')}
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
