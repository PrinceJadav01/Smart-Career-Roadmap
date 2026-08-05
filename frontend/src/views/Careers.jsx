import React from 'react';
import { Target, TrendingUp, DollarSign, Award, Star, CheckCircle, Sparkles } from 'lucide-react';

const Careers = ({ careerRoles, selectedRole, userSkills, selectTargetRole }) => {
  
  const getMatchScore = (role) => {
    let totalWeight = 0;
    let earnedWeight = 0;

    role.requirements.forEach(req => {
      const userSkill = userSkills.find(s => s.name === req.skill);
      const level = userSkill ? userSkill.level : 0;
      const targetLevel = req.importance;
      
      totalWeight += targetLevel;
      earnedWeight += Math.min(level, targetLevel);
    });

    const hasAnySkill = userSkills && userSkills.some(s => s.level > 0);
    return (hasAnySkill && totalWeight > 0) ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  };

  const getDemandBadge = (demand) => {
    switch (demand) {
      case 'Critical': return 'badge-danger';
      case 'High Demand': return 'badge-warn';
      case 'Growing': return 'badge-accent';
      default: return 'badge-neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Panel */}
      <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
          Career Pathways & Target Roles
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.4rem', lineHeight: 1.6, maxWidth: '48rem' }}>
          Select your primary target career path. Choosing a role automatically tailors your skill recommendations, priority roadmap, and progress metrics.
        </p>
      </div>

      {/* Grid of Career Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {careerRoles.map(role => {
          const matchScore = getMatchScore(role);
          const isSelected = selectedRole === role.name;

          return (
            <div 
              key={role.name}
              className={`surface ${isSelected ? 'surface-accent' : 'surface-hover'}`}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                position: 'relative',
                background: isSelected ? '#161822' : '#0F1117'
              }}
            >
              <div>
                {/* Title & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.125rem', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                    {role.name}
                  </h3>
                  {isSelected && (
                    <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle style={{ width: 11, height: 11 }} /> Target
                    </span>
                  )}
                </div>
                
                {/* Demand & Salary */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <span className={`badge ${getDemandBadge(role.demand)}`}>
                    {role.demand}
                  </span>
                  <span className="badge badge-neutral" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {role.salary}
                  </span>
                </div>

                {/* Compatibility Progress */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#8A8FA8' }}>Role Compatibility</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: matchScore > 70 ? '#00C896' : matchScore > 40 ? '#60A5FA' : '#8A8FA8' }}>
                      {matchScore}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${matchScore}%`, background: matchScore > 70 ? '#00C896' : matchScore > 40 ? '#60A5FA' : '#8A8FA8' }} />
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#4B5068', display: 'block', marginBottom: '0.5rem' }}>Required Competencies:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {role.requirements.map(req => (
                      <span 
                        key={req.skill}
                        style={{
                          fontSize: '0.7rem',
                          background: '#161822',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 6,
                          padding: '0.25rem 0.5rem',
                          color: '#F1F2F4',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {req.skill} <span style={{ color: '#00C896', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem' }}>★{req.importance}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <button
                  disabled={isSelected}
                  onClick={() => selectTargetRole(role.name)}
                  className={isSelected ? 'btn-ghost' : 'btn-primary'}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    padding: '0.55rem',
                    opacity: isSelected ? 0.7 : 1,
                    cursor: isSelected ? 'default' : 'pointer'
                  }}
                >
                  {isSelected ? 'Current Target Role' : 'Set as Target Role'}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Careers;
