import React from 'react';
import { Award, ShieldAlert, Star, Sparkles } from 'lucide-react';

const Skills = ({ userSkills, updateSkillLevel }) => {
  const categories = [...new Set(userSkills.map(s => s.category))];

  const getProficiencyLabel = (level) => {
    switch (level) {
      case 5: return { label: 'Expert / Master', badge: 'badge-accent' };
      case 4: return { label: 'Advanced', badge: 'badge-accent' };
      case 3: return { label: 'Intermediate', badge: 'badge-warn' };
      case 2: return { label: 'Elementary', badge: 'badge-neutral' };
      case 1: return { label: 'Beginner', badge: 'badge-neutral' };
      default: return { label: 'Unrated', badge: 'badge-neutral' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Header */}
      <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
          Skill Matrix & Assessment
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.4rem', lineHeight: 1.6, maxWidth: '48rem' }}>
          Rate your self-assessed proficiency across technical competencies. Updating your ratings automatically recalculates your match score for target career paths.
        </p>
      </div>

      {/* Grid of categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {categories.map(category => {
          const categorySkills = userSkills.filter(s => s.category === category);

          return (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.5rem' }}>
                <Sparkles style={{ width: 14, height: 14, color: '#00C896' }} />
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {category}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {categorySkills.map(skill => {
                  const ratingLabel = getProficiencyLabel(skill.level);

                  return (
                    <div 
                      key={skill.name} 
                      className="surface surface-hover"
                      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F2F4' }}>
                            {skill.name}
                          </h3>
                          <span className={`badge ${ratingLabel.badge}`} style={{ marginTop: '0.35rem' }}>
                            {ratingLabel.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#8A8FA8', background: '#161822', padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
                          Lv. {skill.level}/5
                        </span>
                      </div>

                      {/* Interactive Leveling selector */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: '#4B5068' }}>Rate Level:</span>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const isSelected = skill.level === lvl;
                            return (
                              <button
                                key={lvl}
                                onClick={() => updateSkillLevel(skill.name, lvl)}
                                className={`skill-level-btn ${isSelected ? 'active' : ''}`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Skills;
