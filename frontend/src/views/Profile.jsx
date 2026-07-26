import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Award, Printer, BookOpen, Edit2, Check, ExternalLink } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Profile = ({ 
  userProfile, 
  userSkills, 
  selectedRole, 
  unlockedAchievements, 
  allAchievements, 
  resourcesData = {}, 
  onLogout,
  onUpdateProfile,
  onToggleResource
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editBio, setEditBio] = useState(userProfile.bio || '');
  const [editGithub, setEditGithub] = useState(userProfile.githubUrl || '');
  const [editLinkedin, setEditLinkedin] = useState(userProfile.linkedinUrl || '');

  const activeSkills = userSkills.filter(s => s.level > 0);
  const activeSkillsCount = activeSkills.length;
  const averageProficiency = activeSkillsCount > 0 
    ? (activeSkills.reduce((acc, curr) => acc + curr.level, 0) / activeSkillsCount).toFixed(1) 
    : '0.0';

  const handleSave = async () => {
    if (onUpdateProfile) {
      await onUpdateProfile({
        name: editName,
        bio: editBio,
        githubUrl: editGithub,
        linkedinUrl: editLinkedin
      });
    }
    setIsEditing(false);
  };

  const printCertificate = () => {
    const element = document.getElementById('printable-certificate-container');
    if (!element) {
      alert('Certificate container not found.');
      return;
    }

    const clone = element.cloneNode(true);
    clone.style.background = '#fffdf9';
    clone.style.color = '#1a202c';
    clone.style.border = '8px double #b5843b';
    clone.style.boxShadow = 'none';
    clone.style.padding = '3rem';
    clone.style.width = '800px';
    clone.style.borderRadius = '0px';

    const title = clone.querySelector('.cert-title');
    if (title) title.style.color = '#b5843b';

    const sub = clone.querySelector('.cert-sub');
    if (sub) sub.style.color = '#718096';

    const text = clone.querySelector('.cert-text');
    if (text) {
      text.style.borderColor = '#cbd5e0';
      text.style.color = '#2d3748';
      const strongs = text.querySelectorAll('strong');
      strongs.forEach(s => { s.style.color = '#1a202c'; });
      const goldStrongs = text.querySelectorAll('.cert-gold');
      goldStrongs.forEach(s => { s.style.color = '#b5843b'; });
      const purpleStrongs = text.querySelectorAll('.cert-purple');
      purpleStrongs.forEach(s => { s.style.color = '#5a52a3'; });
    }

    const stats = clone.querySelector('.cert-stats');
    if (stats) {
      stats.style.background = '#f7fafc';
      stats.style.borderColor = '#e2e8f0';
      const values = stats.querySelectorAll('.cert-stat-val');
      values.forEach(v => { v.style.color = '#1a202c'; });
      const labels = stats.querySelectorAll('.cert-stat-label');
      labels.forEach(l => { l.style.color = '#718096'; });
    }

    const signatures = clone.querySelectorAll('.cert-signature-name');
    signatures.forEach(s => { s.style.color = '#2d3748'; });
    const roles = clone.querySelectorAll('.cert-signature-role');
    roles.forEach(r => { r.style.color = '#718096'; });
    const sigLines = clone.querySelectorAll('.cert-signature-line');
    sigLines.forEach(l => { l.style.borderColor = '#cbd5e0'; });
    const sigSerif = clone.querySelectorAll('.font-serif');
    sigSerif.forEach(st => { st.style.color = '#8c6a2c'; });

    const seal = clone.querySelector('.cert-seal');
    if (seal) {
      seal.style.borderColor = '#b5843b';
      seal.style.background = '#fffbeb';
      const sealTexts = seal.querySelectorAll('span, svg');
      sealTexts.forEach(t => { t.style.color = '#b5843b'; });
    }

    const opt = {
      margin:       0.5,
      filename:     `SkillSathi_Certificate_${userProfile.name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2.5, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().from(clone).set(opt).save();
  };

  const activeSkillNames = new Set(activeSkills.map(s => s.name));
  const filteredCourses = [];
  
  Object.entries(resourcesData).forEach(([skillName, items]) => {
    if (activeSkillNames.has(skillName)) {
      items.forEach(item => {
        filteredCourses.push({
          ...item,
          skillName
        });
      });
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Header */}
      <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
            Profile & Certification Registry
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.25rem' }}>
            Manage your personal profile details, view your official career certificate, and track saved course materials.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
          >
            <Edit2 style={{ width: 13, height: 13 }} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          
          <button 
            onClick={printCertificate}
            className="btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
          >
            <Printer style={{ width: 13, height: 13 }} /> Export Certificate PDF
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Detail Panel */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            User Account Details
          </h3>

          <div style={{ fontSize: '0.875rem' }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label className="input-label" htmlFor="edit-name">Full Name</label>
                  <input 
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="edit-bio">Bio</label>
                  <textarea 
                    id="edit-bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Brief professional summary..."
                    className="input-field"
                    style={{ height: 75, resize: 'none' }}
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="edit-github">GitHub Profile URL</label>
                  <input 
                    id="edit-github"
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="edit-linkedin">LinkedIn Profile URL</label>
                  <input 
                    id="edit-linkedin"
                    type="text"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="input-field"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  <Check style={{ width: 14, height: 14 }} /> Save Changes
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#4B5068', display: 'block' }}>Name</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#F1F2F4', fontSize: '1rem' }}>{userProfile.name}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#4B5068', display: 'block' }}>Email</span>
                  <span style={{ color: '#8A8FA8' }}>{userProfile.email}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#4B5068', display: 'block', marginBottom: '0.25rem' }}>Bio</span>
                  <div className="surface-2" style={{ padding: '0.75rem', fontSize: '0.8125rem', color: '#8A8FA8', fontStyle: 'italic' }}>
                    {userProfile.bio || 'No bio specified yet.'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.875rem' }}>
                  {userProfile.githubUrl && (
                    <a href={userProfile.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#00C896', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      GitHub <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  )}
                  {userProfile.linkedinUrl && (
                    <a href={userProfile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#00C896', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      LinkedIn <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <button 
                onClick={onLogout}
                className="btn-ghost"
                style={{ width: '100%', color: '#F87171', justifyContent: 'center' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Certificate Display Panel */}
        <div 
          id="printable-certificate-container"
          className="surface"
          style={{ gridColumn: 'span 2', padding: '2rem', border: '2px dashed rgba(0,200,150,0.3)', background: 'linear-gradient(180deg, #0F1117 0%, #161822 100%)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📜</div>
              <h2 className="cert-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#00C896', letterSpacing: '0.05em' }}>
                CERTIFICATE OF ACCOMPLISHMENT
              </h2>
              <span className="cert-sub" style={{ fontSize: '0.75rem', color: '#8A8FA8', fontStyle: 'italic' }}>
                Issued by SkillSathi Career Progression Registry
              </span>
            </div>

            <div className="cert-text" style={{ maxWidth: 480, margin: '0 auto', fontSize: '0.875rem', color: '#8A8FA8', lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 0' }}>
              This official credential certifies that <strong className="cert-gold" style={{ color: '#00C896', fontFamily: 'Outfit, sans-serif' }}>{userProfile.name.toUpperCase()}</strong> has attained a profile standing of <strong className="cert-purple" style={{ color: '#60A5FA' }}>LEVEL {userProfile.level}</strong> with an average competency score of <strong style={{ color: '#F1F2F4' }}>{averageProficiency}/5.0</strong> across mapped career pathways.
            </div>

            {/* Micro Stats inside Certificate */}
            <div className="cert-stats surface-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', maxWidth: 380, margin: '0 auto', padding: '0.875rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="cert-stat-val" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F1F2F4', display: 'block' }}>
                  {activeSkillsCount}
                </span>
                <span className="cert-stat-label" style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase' }}>
                  Skills Rated
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span className="cert-stat-val" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F1F2F4', display: 'block' }}>
                  {unlockedAchievements.length}
                </span>
                <span className="cert-stat-label" style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase' }}>
                  Milestones
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span className="cert-stat-val" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F1F2F4', display: 'block' }}>
                  {selectedRole ? selectedRole.split(' ')[0] : 'None'}
                </span>
                <span className="cert-stat-label" style={{ fontSize: '0.65rem', color: '#4B5068', textTransform: 'uppercase' }}>
                  Target Path
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#00C896', fontWeight: 700, height: 24 }}>
                  Savan Chauhan
                </div>
                <div className="cert-signature-line" style={{ width: 80, margin: '0.25rem auto', borderTop: '1px solid rgba(255,255,255,0.15)' }} />
                <div className="cert-signature-name" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F1F2F4' }}>Savan Chauhan</div>
                <div className="cert-signature-role" style={{ fontSize: '0.65rem', color: '#4B5068' }}>Founder, SkillSathi</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="cert-seal" style={{ width: 56, height: 56, borderRadius: '50%', border: '2px dashed #00C896', background: 'rgba(0,200,150,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Award style={{ width: 18, height: 18, color: '#00C896' }} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#00C896', letterSpacing: '0.04em' }}>OFFICIAL</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#00C896', fontWeight: 700, height: 24 }}>
                  Prince Jadav
                </div>
                <div className="cert-signature-line" style={{ width: 80, margin: '0.25rem auto', borderTop: '1px solid rgba(255,255,255,0.15)' }} />
                <div className="cert-signature-name" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F1F2F4' }}>Prince Jadav</div>
                <div className="cert-signature-role" style={{ fontSize: '0.65rem', color: '#4B5068' }}>Co-Founder, SkillSathi</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Skill Masteries & Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            Active Skill Proficiency
          </h3>
          
          {activeSkillsCount > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userSkills
                .filter(s => s.level > 0)
                .map(skill => (
                  <div key={skill.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F2F4', display: 'block' }}>{skill.name}</span>
                      <span style={{ fontSize: '0.675rem', color: '#4B5068' }}>{skill.category}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#00C896', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        {'★'.repeat(skill.level)}{'☆'.repeat(5 - skill.level)}
                      </span>
                      <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                        Lv. {skill.level}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: '#4B5068', fontSize: '0.8125rem' }}>
              No active skills rated yet.
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="surface" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#F1F2F4', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            Saved & Active Resources
          </h3>
          
          {filteredCourses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 320, overflowY: 'auto' }}>
              {filteredCourses.map((course, idx) => (
                <div 
                  key={course.id || idx} 
                  className="surface-2"
                  style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                    <input 
                      type="checkbox"
                      checked={!!course.isCompleted}
                      onChange={(e) => onToggleResource && onToggleResource(course.id, e.target.checked)}
                      style={{ accentColor: '#00C896', width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: course.isCompleted ? '#4B5068' : '#F1F2F4', textDecoration: course.isCompleted ? 'line-through' : 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </span>
                      <div style={{ fontSize: '0.675rem', color: '#4B5068', marginTop: '0.1rem' }}>
                        {course.skillName} • {course.platform}
                      </div>
                    </div>
                  </div>
                  
                  {course.url && (
                    <a href={course.url} target="_blank" rel="noreferrer" style={{ color: '#00C896', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <ExternalLink style={{ width: 13, height: 13 }} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: '#4B5068', fontSize: '0.8125rem' }}>
              Rate your skills to receive personalized course recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
