import React, { useState } from 'react';
import { Search, PlayCircle, GraduationCap, FileText, ExternalLink } from 'lucide-react';

const Resources = ({ resourcesCatalog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const allResources = [];
  Object.keys(resourcesCatalog).forEach(skillName => {
    resourcesCatalog[skillName].forEach(resource => {
      allResources.push({
        ...resource,
        skill: skillName
      });
    });
  });

  const filteredResources = allResources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || res.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle style={{ width: 18, height: 18, color: '#F87171' }} />;
      case 'course': return <GraduationCap style={{ width: 18, height: 18, color: '#60A5FA' }} />;
      default: return <FileText style={{ width: 18, height: 18, color: '#00C896' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Intro Panel */}
      <div className="surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F1117 0%, #161822 100%)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#F1F2F4', letterSpacing: '-0.02em' }}>
          Learning Resource Library
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.4rem', lineHeight: 1.6, maxWidth: '48rem' }}>
          Search and filter hand-curated tutorials, courses, and documentation across all technical competencies to support your growth.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4B5068', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by skill, title, or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div className="tab-nav">
          {['all', 'video', 'course', 'article'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`tab-item${typeFilter === type ? ' active' : ''}`}
            >
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredResources.length > 0 ? (
          filteredResources.map((res, index) => (
            <a
              key={index}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="surface surface-hover"
              style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#161822', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getIcon(res.type)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <span className="badge badge-accent" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>
                    {res.skill}
                  </span>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#F1F2F4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {res.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4B5068', marginTop: '0.15rem' }}>
                    {res.platform} • {res.time} • {res.cost}
                  </div>
                </div>
              </div>
              
              <ExternalLink style={{ width: 14, height: 14, color: '#4B5068', flexShrink: 0 }} />
            </a>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem 0', textAlign: 'center', color: '#4B5068', fontSize: '0.875rem' }}>
            No learning resources match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
