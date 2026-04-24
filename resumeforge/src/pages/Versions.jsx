import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import ScoreBar from '../components/ScoreBar';

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/**
 * Same formatter used in Generate.jsx.
 * Converts resumeContent (JSON object or plain string) → readable plain text
 * so <pre> never receives [object Object].
 */
function formatResumeContent(content) {
  if (typeof content === 'string') return content;
  if (!content || typeof content !== 'object') return '';

  const lines = [];
  const divider = () => lines.push('─'.repeat(60));
  const section = (title) => { lines.push(''); lines.push(title.toUpperCase()); divider(); };

  // Profile / header
  const p = content.profile || content.header || content.contact || {};
  if (p.name || p.fullName) lines.push((p.name || p.fullName).toUpperCase());
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.linkedinUrl, p.github, p.githubUrl].filter(Boolean);
  if (contactParts.length) lines.push(contactParts.join('  |  '));

  // Summary
  const summary = p.summary || content.summary;
  if (summary) { section('Professional Summary'); lines.push(typeof summary === 'string' ? summary : JSON.stringify(summary)); }

  // Skills
  const skills = content.skills || content.technicalSkills;
  if (skills) {
    section('Skills');
    if (typeof skills === 'string') {
      lines.push(skills);
    } else if (Array.isArray(skills)) {
      skills.forEach((s) => {
        if (typeof s === 'string') lines.push(`• ${s}`);
        else if (s.skillName) lines.push(`• ${s.skillName}${s.proficiency ? ` (${s.proficiency})` : ''}`);
        else if (s.category && s.skills) lines.push(`${s.category}: ${Array.isArray(s.skills) ? s.skills.join(', ') : s.skills}`);
        else lines.push(`• ${JSON.stringify(s)}`);
      });
    } else if (typeof skills === 'object') {
      Object.entries(skills).forEach(([cat, val]) => lines.push(`${cat}: ${Array.isArray(val) ? val.join(', ') : val}`));
    }
  }

  // Experience
  const experience = content.experience || content.workExperience || content.experiences;
  if (experience && (Array.isArray(experience) ? experience.length : true)) {
    section('Experience');
    const expArr = Array.isArray(experience) ? experience : [experience];
    expArr.forEach((exp) => {
      const title = [exp.jobTitle || exp.role, exp.companyName || exp.company].filter(Boolean).join(' — ');
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      if (title) lines.push(title);
      const meta = [dates, exp.location].filter(Boolean).join('  |  ');
      if (meta) lines.push(meta);
      if (exp.description) {
        const desc = typeof exp.description === 'string' ? exp.description : JSON.stringify(exp.description);
        desc.split('\n').forEach((line) => {
          const t = line.trim();
          if (t) lines.push(t.startsWith('•') || t.startsWith('-') ? t : `• ${t}`);
        });
      }
      lines.push('');
    });
  }

  // Projects
  const projects = content.projects;
  if (projects && Array.isArray(projects) && projects.length) {
    section('Projects');
    projects.forEach((proj) => {
      const name = proj.name || proj.title || 'Project';
      const tech = proj.technologies || proj.techStack || proj.skills;
      const techStr = Array.isArray(tech) ? tech.join(', ') : tech;
      lines.push(techStr ? `${name}  [${techStr}]` : name);
      if (proj.description) {
        const desc = typeof proj.description === 'string' ? proj.description : JSON.stringify(proj.description);
        desc.split('\n').forEach((line) => {
          const t = line.trim();
          if (t) lines.push(t.startsWith('•') || t.startsWith('-') ? t : `• ${t}`);
        });
      }
      lines.push('');
    });
  }

  // Education
  const education = content.education;
  if (education && (Array.isArray(education) ? education.length : true)) {
    section('Education');
    const eduArr = Array.isArray(education) ? education : [education];
    eduArr.forEach((edu) => {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
      const institution = edu.institution || edu.school || edu.university;
      if (degree || institution) lines.push([degree, institution].filter(Boolean).join(' — '));
      if (edu.year || edu.graduationYear) lines.push(String(edu.year || edu.graduationYear));
      lines.push('');
    });
  }

  // Fallback: unknown top-level keys
  const knownKeys = new Set(['profile','header','contact','summary','skills','technicalSkills',
    'experience','workExperience','experiences','projects','education','certifications','certificates']);
  Object.entries(content).forEach(([key, val]) => {
    if (!knownKeys.has(key)) { section(key); lines.push(typeof val === 'string' ? val : JSON.stringify(val, null, 2)); }
  });

  return lines.join('\n');
}

/**
 * Issue #7: derive matched/total keyword counts from missingSkills.
 * missingSkills = JD keywords NOT in user profile.
 * We don't have totalKeywords directly, but we can show missing count clearly.
 */
function KeywordMatchBadge({ missingSkills }) {
  if (!missingSkills) return null;
  const missing = missingSkills.length;
  if (missing === 0) {
    return (
      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        ✓ All keywords matched
      </span>
    );
  }
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
      {missing} keyword{missing > 1 ? 's' : ''} missing
    </span>
  );
}

export default function Versions() {
  const { addToast } = useToast();
  const [versions, setVersions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [expandedData, setExpandedData] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);

  useEffect(() => { fetchVersions(); }, []);

  const fetchVersions = async () => {
    try {
      const { data } = await api.get('/resume-versions');
      setVersions(data);
    } catch { addToast('Failed to load versions', 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume version?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/resume-versions/${id}`);
      addToast('Version deleted', 'success');
      setVersions((prev) => prev.filter((v) => v.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { addToast('Failed to delete', 'error'); }
    setDeletingId(null);
  };

  const handleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (expandedData[id]) return;
    setLoadingDetail(id);
    try {
      const { data } = await api.get(`/resume-versions/${id}`);
      setExpandedData((prev) => ({ ...prev, [id]: data }));
    } catch { addToast('Failed to load details', 'error'); }
    setLoadingDetail(null);
  };

  const handleDownload = (type, id) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8080/api/resume/export/${type}/${id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `resume-${id}.${type}`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => addToast('Download failed', 'error'));
  };

  const scoreColor = (score) => {
    if ((score ?? 0) >= 80) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if ((score ?? 0) >= 60) return 'bg-forge-500/10 border-forge-500/30 text-forge-400';
    if ((score ?? 0) >= 40) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-red-500/10 border-red-500/30 text-red-400';
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Resume Versions</h1>
          <p className="text-sm mt-1 rf-text-muted">All your generated resumes, ready to download.</p>
        </div>
        <Link to="/generate" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate New
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="card p-6 shimmer-bg h-24" />)}
        </div>
      ) : versions.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">📄</p>
          <p className="font-display font-semibold rf-text text-lg mb-2">No resumes generated yet</p>
          <p className="text-sm rf-text-muted mb-6">Generate your first tailored resume by pasting a job description</p>
          <Link to="/generate" className="btn-primary inline-flex mx-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Resume
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div key={v.id} className="card overflow-hidden">

              {/* Row */}
              <div className="p-5 flex items-center gap-4">
                {/* Score circle */}
                <div className={`shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center font-display font-bold text-sm ${scoreColor(v.atsScore)}`}>
                  {v.atsScore ?? '—'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold rf-text truncate">
                    {v.jobTitle || 'Resume'}
                    {v.companyName && (
                      <span className="rf-text-muted font-normal"> @ {v.companyName}</span>
                    )}
                  </p>
                  <p className="text-xs rf-text-muted font-mono mt-0.5">
                    Version #{v.id} · {v.createdAt
                      ? new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Unknown date'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleExpand(v.id)} className="btn-secondary text-xs px-3 py-1.5">
                    {expandedId === v.id ? 'Collapse' : 'Preview'}
                  </button>
                  <button onClick={() => handleDownload('pdf', v.id)} className="btn-primary text-xs px-3 py-1.5">PDF</button>
                  <button onClick={() => handleDownload('docx', v.id)} className="btn-secondary text-xs px-3 py-1.5">DOCX</button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    {deletingId === v.id ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded view */}
              {expandedId === v.id && (
                <div className="p-5 space-y-5"
                  style={{ borderTop: '1px solid var(--card-border)', background: 'var(--input-bg)' }}>
                  {loadingDetail === v.id ? (
                    <div className="flex items-center gap-3 rf-text-muted text-sm">
                      <Spinner /> Loading details…
                    </div>
                  ) : expandedData[v.id] ? (() => {
                    const detail = expandedData[v.id];
                    const previewText = detail.resumeContent
                      ? formatResumeContent(detail.resumeContent)
                      : '';
                    return (
                      <>
                        {/* Score bar */}
                        <ScoreBar score={detail.atsScore ?? 0} />

                        {/* Issue #7: keyword match info */}
                        <div className="flex items-center gap-3">
                          <KeywordMatchBadge missingSkills={detail.missingSkills} />
                          {detail.missingSkills?.length > 0 && (
                            <span className="text-xs rf-text-muted">
                              Add missing skills to your profile to improve this score
                            </span>
                          )}
                        </div>

                        {/* Missing skills */}
                        {detail.missingSkills?.length > 0 && (
                          <div>
                            <p className="text-xs font-display font-semibold rf-text-muted mb-2 uppercase tracking-wide">
                              Missing Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {detail.missingSkills.map((s, i) => (
                                <span key={i} className="badge bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resume preview — fixed [object Object] bug */}
                        {previewText && (
                          <div>
                            <p className="text-xs font-display font-semibold rf-text-muted mb-2 uppercase tracking-wide">
                              Resume Preview
                            </p>
                            <div className="rounded-xl p-5 border max-h-[500px] overflow-auto"
                              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed rf-text">
                                {previewText}
                              </pre>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })() : (
                    <p className="text-sm rf-text-muted">No details available.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}