import React, { useState } from 'react';
import { PlayCircle, GraduationCap, FileText, CheckCircle, Clock, ChevronRight, Brain, Loader2, Lock, Sparkles, ExternalLink } from 'lucide-react';
import * as api from '../services/api';

const Roadmap = ({ selectedRole, userSkills, careerRoles, resourcesCatalog }) => {
  const roleInfo = careerRoles.find(r => r.name === selectedRole) || careerRoles[0];
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const generatePath = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const skillsMap = {};
      userSkills.forEach(s => { skillsMap[s.name] = s.level; });
      const res = await api.getAiGeneratedPath(selectedRole, skillsMap);
      setAiResult(res);
    } catch (err) {
      console.error(err);
      alert('Failed to generate AI path');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Header */}
      <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ maxWidth: '42rem' }}>
          <div className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>
            <Sparkles style={{ width: 12, height: 12 }} /> Adaptive Learning Pathway
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
            {selectedRole} Progression Sequence
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.4rem', lineHeight: 1.6 }}>
            Follow this sequential learning path to achieve readiness for {selectedRole}. Reaching Level 4+ in each key competency completes the step.
          </p>
          
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={generatePath}
              disabled={aiLoading}
              className="btn-ghost"
              style={{ fontSize: '0.8125rem', opacity: aiLoading ? 0.6 : 1 }}
            >
              {aiLoading ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Brain style={{ width: 14, height: 14, color: '#60A5FA' }} />}
              Generate AI-Optimized Progression
            </button>
          </div>

          {aiResult && (
            <div className="surface-2" style={{ marginTop: '1rem', padding: '1rem 1.25rem', borderColor: 'rgba(96,165,250,0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                AI Analysis Result
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#F1F2F4' }}>
                Current Baseline: <strong>{aiResult.Current_Role}</strong>
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', marginTop: '0.2rem' }}>
                Estimated missing skill competencies to achieve target readiness: <strong style={{ color: '#00C896', fontFamily: 'JetBrains Mono, monospace' }}>{aiResult.Predicted_Missing_Courses_Count}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="badge badge-neutral" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
          {roleInfo.requirements.length} Core Milestones
        </div>
      </div>

      {/* Timeline Sequence */}
      <div style={{ position: 'relative', borderLeft: '2px solid rgba(255,255,255,0.08)', marginLeft: '1.25rem', paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {roleInfo.requirements.map((req, index) => {
          const skill = userSkills.find(s => s.name === req.skill);
          const level = skill ? skill.level : 0;
          const isCompleted = level >= 4;
          const inProgress = level > 0 && level < 4;
          const isLocked = index > 0 && (userSkills.find(s => s.name === roleInfo.requirements[index - 1].skill)?.level || 0) < 3;

          const skillResources = resourcesCatalog[req.skill] || [];

          return (
            <div 
              key={req.skill}
              style={{ position: 'relative', opacity: isLocked ? 0.5 : 1 }}
            >
              {/* Timeline node */}
              <div style={{
                position: 'absolute',
                left: '-2.4rem',
                top: '0.25rem',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: isCompleted ? '#00C896' : inProgress ? '#60A5FA' : '#161822',
                border: `2px solid ${isCompleted ? '#00C896' : inProgress ? '#60A5FA' : 'rgba(255,255,255,0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: isCompleted || inProgress ? '#08090E' : '#8A8FA8',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Step Card */}
              <div className="surface" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
                      Step {index + 1}: {req.skill}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#4B5068', marginTop: '0.25rem' }}>
                      <span>Target Level: <strong style={{ color: '#8A8FA8' }}>4+</strong></span>
                      <span>•</span>
                      <span>Importance: <strong style={{ color: '#00C896', fontFamily: 'JetBrains Mono, monospace' }}>{'★'.repeat(req.importance)}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCompleted && <span className="badge badge-accent">Mastered</span>}
                    {inProgress && <span className="badge badge-warn">In Progress</span>}
                    <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#8A8FA8', background: '#161822', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                      Level {level}/5
                    </span>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#4B5068', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    Recommended Resources
                  </div>
                  
                  {isLocked ? (
                    <div style={{ background: '#161822', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.875rem', textAlign: 'center', fontSize: '0.8125rem', color: '#4B5068', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Lock style={{ width: 14, height: 14 }} /> Complete previous milestone to unlock resources.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.625rem' }}>
                      {skillResources.map((res, rIdx) => {
                        const getResourceIcon = (type) => {
                          if (type === 'video') return <PlayCircle style={{ width: 15, height: 15, color: '#F87171', flexShrink: 0 }} />;
                          if (type === 'course') return <GraduationCap style={{ width: 15, height: 15, color: '#60A5FA', flexShrink: 0 }} />;
                          return <FileText style={{ width: 15, height: 15, color: '#00C896', flexShrink: 0 }} />;
                        };

                        return (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="surface-2"
                            style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', transition: 'border-color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,200,150,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                          >
                            {getResourceIcon(res.type)}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.8125rem', color: '#F1F2F4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {res.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#4B5068', marginTop: '0.15rem' }}>
                                {res.platform} • {res.time} • {res.cost}
                              </div>
                            </div>
                            <ExternalLink style={{ width: 13, height: 13, color: '#4B5068', flexShrink: 0 }} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
