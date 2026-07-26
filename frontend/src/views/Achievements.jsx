import React from 'react';
import { Award, Lock, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';

const Achievements = ({ userProfile, unlockedAchievements, allAchievements }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Panel */}
      <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
          Milestones & Accomplishments
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.4rem', lineHeight: 1.6, maxWidth: '48rem' }}>
          Track key milestones earned as you level up competencies, complete challenges, and maintain learning consistency.
        </p>
      </div>

      {/* Grid listing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {allAchievements.map((ach) => {
          const isUnlocked = unlockedAchievements.includes(ach.id);
          
          return (
            <div 
              key={ach.id} 
              className={`surface ${isUnlocked ? 'surface-accent' : ''}`}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justify: 'space-between',
                gap: '1rem',
                opacity: isUnlocked ? 1 : 0.5,
                background: isUnlocked ? '#161822' : '#0F1117'
              }}
            >
              {/* Badge Icon */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                background: isUnlocked ? 'rgba(0,200,150,0.15)' : '#161822',
                border: `2px solid ${isUnlocked ? '#00C896' : 'rgba(255,255,255,0.08)'}`,
                color: isUnlocked ? '#00C896' : '#4B5068'
              }}>
                {isUnlocked ? (
                  <Award style={{ width: 26, height: 26, color: '#00C896' }} />
                ) : (
                  <Lock style={{ width: 20, height: 20, color: '#4B5068' }} />
                )}
              </div>

              {/* Title & Desc */}
              <div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: isUnlocked ? '#F1F2F4' : '#8A8FA8', marginBottom: '0.35rem' }}>
                  {ach.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#8A8FA8', lineHeight: 1.5 }}>
                  {ach.description}
                </p>
              </div>

              {/* Status */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.875rem', width: '100%' }}>
                <span className={`badge ${isUnlocked ? 'badge-accent' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                  {isUnlocked ? '✓ Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
