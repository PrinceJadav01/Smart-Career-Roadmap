import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Target, Map, Loader2, ExternalLink, Clock, BookOpen, CheckCircle, Star, TrendingUp, Zap } from 'lucide-react';
import * as api from '../services/api';

const ALL_SKILLS = [
  { name: 'HTML & CSS', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'React JS', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Git', category: 'Frontend' },
  { name: 'Figma', category: 'Frontend' },
  { name: 'UX Research', category: 'Frontend' },
  { name: 'Mobile Dev (iOS/Android)', category: 'Frontend' },
  { name: 'C# Programming', category: 'Backend' },
  { name: 'ASP.NET Core', category: 'Backend' },
  { name: 'REST APIs', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Docker', category: 'Backend' },
  { name: 'AWS', category: 'Backend' },
  { name: 'Kubernetes', category: 'Backend' },
  { name: 'Cybersecurity Basics', category: 'Backend' },
  { name: 'Blockchain & Solidity', category: 'Backend' },
  { name: 'QA & Testing', category: 'Backend' },
  { name: 'IT Support & Networking', category: 'Backend' },
  { name: 'Python Core', category: 'Python & ML' },
  { name: 'FastAPI', category: 'Python & ML' },
  { name: 'scikit-learn', category: 'Python & ML' },
  { name: 'Pandas & NumPy', category: 'Python & ML' },
  { name: 'Agile & Scrum', category: 'Python & ML' },
  { name: 'Product Management', category: 'Python & ML' },
  { name: 'Technical Writing', category: 'Python & ML' },
  { name: 'Business Analysis', category: 'Python & ML' },
  { name: 'Data Visualization', category: 'Python & ML' },
  { name: 'SEO & Marketing', category: 'Python & ML' }
];

const CATEGORY_ICONS = {
  'Frontend': '🎨',
  'Backend': '⚙️',
  'Python & ML': '🧠'
};

const Onboarding = ({ userProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState({});
  const [suggestedRoles, setSuggestedRoles] = useState([]);
  const [suggestSource, setSuggestSource] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev => {
      const next = { ...prev };
      if (next[skillName]) {
        delete next[skillName];
      } else {
        next[skillName] = 1;
      }
      return next;
    });
  };

  const setSkillLevel = (skillName, level) => {
    setSelectedSkills(prev => ({ ...prev, [skillName]: level }));
  };

  const handleStep1Continue = async () => {
    const count = Object.keys(selectedSkills).length;
    if (count === 0) {
      setError('Please select at least 1 skill to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.suggestRoles(selectedSkills);
      setSuggestedRoles(res.suggested_roles || res.suggestedRoles || []);
      setSuggestSource(res.source || '');
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to get role suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    setError('');
    try {
      const res = await api.getAiGeneratedPath(role.role, selectedSkills);
      setRoadmapData(res);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleStartJourney = async () => {
    setSubmitting(true);
    try {
      const targetRole = selectedRole?.role || selectedRole?.name || 'Frontend Developer';
      await onComplete(targetRole, selectedSkills);
    } catch (err) {
      console.error('Error starting journey:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            s < step ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]' :
            s === step ? 'bg-gradient-to-r from-gold to-amber-500 text-[#06070F] shadow-[0_0_15px_rgba(255,184,0,0.4)]' :
            'bg-slate-800/60 text-slate-500 border border-slate-700'
          }`}>
            {s < step ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-16 h-0.5 transition-all duration-500 ${
              s < step ? 'bg-emerald-500' : 'bg-slate-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (step === 1) {
    const categories = [...new Set(ALL_SKILLS.map(s => s.category))];
    const selectedCount = Object.keys(selectedSkills).length;

    return (
      <div className="min-h-screen bg-[#06070F] text-[#EDE8D8] p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <StepIndicator />

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-dim border border-gold/20 rounded-full text-gold text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Step 1 of 3
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gold-light tracking-wide">
              Select Your Skills
            </h1>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">
              Select the skills you already know (at least 1 required). Our AI will analyze your selection and recommend your top matching career paths.
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 max-w-lg mx-auto">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 font-display">
                  <span>{CATEGORY_ICONS[category]}</span> {category}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {ALL_SKILLS.filter(s => s.category === category).map(skill => {
                    const isSelected = selectedSkills[skill.name] !== undefined;
                    const selectedLevel = selectedSkills[skill.name] || 0;
                    return (
                      <div 
                        key={skill.name} 
                        className="surface"
                        style={{
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.875rem',
                          justifyContent: 'space-between',
                          background: isSelected ? '#161822' : '#0F1117',
                          borderColor: isSelected ? 'rgba(0,200,150,0.35)' : 'rgba(255,255,255,0.07)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#F1F2F4',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            width: '100%'
                          }}
                        >
                          <div style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? '#00C896' : 'rgba(255,255,255,0.2)'}`,
                            background: isSelected ? '#00C896' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }} />
                          <span style={{ color: isSelected ? '#00C896' : '#F1F2F4' }}>
                            {skill.name}
                          </span>
                        </button>

                        {isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#4B5068' }}>Level:</span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {[1, 2, 3, 4, 5].map(lvl => {
                                const isActive = selectedLevel === lvl;
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setSkillLevel(skill.name, lvl)}
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 6,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      fontFamily: 'JetBrains Mono, monospace',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.1s',
                                      background: isActive ? 'rgba(0,200,150,0.1)' : '#0F1117',
                                      border: `1px solid ${isActive ? '#00C896' : 'rgba(255,255,255,0.08)'}`,
                                      color: isActive ? '#00C896' : '#8A8FA8'
                                    }}
                                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.borderColor = '#00C896'; }}
                                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                  >
                                    {lvl}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-10 pt-6 border-t border-slate-800">
            <button
              onClick={handleStep1Continue}
              disabled={loading || selectedCount === 0}
              className="px-8 py-3.5 bg-gradient-to-r from-gold to-amber-500 text-[#06070F] font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto min-w-[280px]"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Skills...</>
              ) : selectedCount === 0 ? (
                <>Select at least 1 skill to continue</>
              ) : (
                <>Continue with {selectedCount} skill{selectedCount !== 1 ? 's' : ''} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#06070F] text-[#EDE8D8] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <StepIndicator />

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Target className="w-3.5 h-3.5" /> Step 2 of 3
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gold-light tracking-wide">
              {suggestSource === 'trending' ? 'Trending Career Roles' : 'AI-Suggested Roles For You'}
            </h1>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">
              {suggestSource === 'trending'
                ? 'Here are the hottest career paths in the IT industry right now. Pick one to get started!'
                : 'Based on your skills, our AI recommends these career paths. Choose the one that excites you most!'}
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 max-w-lg mx-auto">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {suggestedRoles.map((role, idx) => (
              <button
                key={role.role}
                onClick={() => handleRoleSelect(role)}
                disabled={loading}
                className="w-full text-left glass-panel p-5 rounded-2xl border border-slate-700/50 hover:border-gold/40 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_20px_rgba(255,184,0,0.08)] disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎯'}</span>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-gold-light transition-colors font-display">
                        {role.role}
                      </h3>
                      {role.is_trending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] text-orange-400 font-bold">
                          <TrendingUp className="w-3 h-3" /> TRENDING
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className={`px-2 py-0.5 rounded-full ${
                        role.demand === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        role.demand === 'High Demand' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-700/50 text-slate-400 border border-slate-600'
                      }`}>
                        {role.demand}
                      </span>
                      <span className="text-gold">{role.salary_range}</span>
                    </div>
                    {role.missing_skills && role.missing_skills.length > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Skills to learn: {role.missing_skills.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {role.match_percent > 0 && (
                      <>
                        <div className="text-2xl font-bold text-gold font-display">{role.match_percent}%</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Match</div>
                      </>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-gold transition-colors mt-2" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-start mt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 text-sm text-slate-400 hover:text-gold transition-all cursor-pointer bg-transparent border border-slate-700 rounded-xl hover:border-gold/30 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Skills
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const courses = roadmapData?.recommended_courses || [];
    const skillGaps = roadmapData?.skill_gaps || [];

    return (
      <div className="min-h-screen bg-[#06070F] text-[#EDE8D8] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <StepIndicator />

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Map className="w-3.5 h-3.5" /> Step 3 of 3
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-gold-light tracking-wide">
              Your Personalized Roadmap
            </h1>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">
              AI has crafted a learning path for <span className="text-gold font-semibold">{selectedRole?.role}</span>. 
              Follow these courses to bridge your skill gaps.
            </p>
          </div>

          {skillGaps.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 mb-6">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Skill Gaps Identified
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGaps.map(gap => (
                  <div key={gap.skill} className="px-3 py-1.5 bg-purple-900/30 border border-purple-500/20 rounded-lg text-xs text-purple-300">
                    {gap.skill}
                    <span className="ml-1.5 text-slate-500">Lv.{gap.current_level} → Lv.{gap.required_level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Recommended Courses ({courses.length})
              </h3>
              <div className="relative border-l-2 border-gold/20 ml-4 pl-6 space-y-4">
                {courses.map((course, idx) => (
                  <div key={course.id} className="relative glass-panel p-4 rounded-xl border border-slate-700/50 hover:border-gold/30 transition-all">
                    <span className="absolute -left-[31px] top-4 w-5 h-5 rounded-full bg-gold-dim border-2 border-gold flex items-center justify-center text-[9px] font-bold text-gold">
                      {idx + 1}
                    </span>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-100">{course.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700">{course.platform}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                          <span className={course.cost === 'Free' ? 'text-emerald-400' : 'text-amber-400'}>{course.cost}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Skill: <span className="text-purple-400">{course.skill}</span> → Level {course.target_level}
                        </p>
                      </div>
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-3 py-2 bg-gold-dim border border-gold/30 rounded-lg text-gold text-xs font-bold hover:bg-gold/20 transition-all flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center border border-emerald-500/20">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-400">You're Already Prepared!</h3>
              <p className="text-sm text-slate-400 mt-2">
                Your current skills are strong enough for this role. Start applying!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 text-sm text-slate-400 hover:text-gold transition-all cursor-pointer bg-transparent border border-slate-700 rounded-xl hover:border-gold/30 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Change Role
            </button>
            <button
              onClick={handleStartJourney}
              disabled={submitting}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Launching Dashboard...</>
              ) : (
                <><Star className="w-5 h-5" /> Start My Journey</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Onboarding;
