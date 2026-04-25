import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import ScoreBar from '../components/ScoreBar';

const FONT_KEY = 'rf_resume_font';

function Spinner({ size = 'sm' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <svg className={`${cls} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function displayName(skill) {
  const overrides = {
    'ci cd': 'CI/CD', 'solid principles': 'SOLID Principles', 'rest': 'REST',
    'rest api': 'REST API', 'jwt': 'JWT', 'aws': 'AWS',
    'amazon web services': 'Amazon Web Services', 'spring boot': 'Spring Boot',
    'spring data jpa': 'Spring Data JPA', 'mysql': 'MySQL', 'postgresql': 'PostgreSQL',
    'mongodb': 'MongoDB', 'redis': 'Redis', 'docker': 'Docker', 'git': 'Git',
    'github': 'GitHub', 'gitlab': 'GitLab', 'node.js': 'Node.js',
    'react.js': 'React.js', 'vue.js': 'Vue.js', 'next.js': 'Next.js',
    'typescript': 'TypeScript', 'javascript': 'JavaScript', 'html': 'HTML',
    'css': 'CSS', 'sql': 'SQL', 'graphql': 'GraphQL', 'microservices': 'Microservices',
    'kubernetes': 'Kubernetes', 'microsoft azure': 'Microsoft Azure',
    'google cloud': 'Google Cloud', 'machine learning': 'Machine Learning',
    'deep learning': 'Deep Learning',
    'natural language processing': 'Natural Language Processing',
    'object oriented programming': 'Object Oriented Programming',
    'data structures': 'Data Structures', 'unit testing': 'Unit Testing',
    'test driven development': 'Test Driven Development', 'code review': 'Code Review',
    'problem solving': 'Problem Solving', 'open source': 'Open Source',
    'database design': 'Database Design', 'query optimization': 'Query Optimization',
    'agile scrum': 'Agile / Scrum', 'version control': 'Version Control',
  };
  return overrides[skill] ?? skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatResumeContent(content) {
  if (typeof content === 'string') return content;
  if (!content || typeof content !== 'object') return '';
  const lines = [];
  const divider = (char = '─') => lines.push(char.repeat(60));
  const section = (title) => { lines.push(''); lines.push(title.toUpperCase()); divider(); };

  const p = content.profile || content.header || content.contact || {};
  if (p.name || p.fullName) lines.push((p.name || p.fullName).toUpperCase());
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean);
  if (contactParts.length) lines.push(contactParts.join('  |  '));

  const summary = p.summary || content.summary;
  if (summary) { section('Professional Summary'); lines.push(typeof summary === 'string' ? summary : JSON.stringify(summary)); }

  const skills = content.skills || content.technicalSkills;
  if (skills) {
    section('Skills');
    if (typeof skills === 'string') lines.push(skills);
    else if (Array.isArray(skills)) {
      skills.forEach((s) => {
        if (typeof s === 'string') lines.push(`• ${s}`);
        else if (s.category && s.skills) lines.push(`${s.category}: ${Array.isArray(s.skills) ? s.skills.join(', ') : s.skills}`);
        else if (s.skillName) lines.push(s.skillName);
        else lines.push(`• ${JSON.stringify(s)}`);
      });
    } else if (typeof skills === 'object') {
      Object.entries(skills).forEach(([cat, val]) => lines.push(`${cat}: ${Array.isArray(val) ? val.join(', ') : val}`));
    }
  }

  const experience = content.experience || content.workExperience || content.experiences;
  if (experience && (Array.isArray(experience) ? experience.length : true)) {
    section('Experience');
    const expArr = Array.isArray(experience) ? experience : [experience];
    expArr.forEach((exp) => {
      const title = [exp.jobTitle || exp.role, exp.companyName || exp.company].filter(Boolean).join(' — ');
      const dates = [exp.startDate, exp.currentlyWorking ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
      if (title) lines.push(title);
      const meta = [dates, exp.location].filter(Boolean).join('  |  ');
      if (meta) lines.push(meta);
      if (exp.description) {
        const desc = typeof exp.description === 'string' ? exp.description : JSON.stringify(exp.description);
        desc.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) lines.push(trimmed.startsWith('•') || trimmed.startsWith('-') ? trimmed : `• ${trimmed}`);
        });
      }
      lines.push('');
    });
  }

  const projects = content.projects;
  if (projects && Array.isArray(projects) && projects.length) {
    section('Projects');
    projects.forEach((proj) => {
      const name = proj.name || proj.title || 'Project';
      const tech = proj.technologies || proj.techStack || proj.skills;
      const techStr = Array.isArray(tech) ? tech.join(', ') : tech;
      const urlStr = proj.projectUrl || proj.url || proj.link || proj.githubUrl || '';
      const titleParts = [name, techStr, urlStr].filter(Boolean);
      lines.push(titleParts.join('  |  '));
      if (proj.description) {
        const desc = typeof proj.description === 'string' ? proj.description : JSON.stringify(proj.description);
        desc.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) lines.push(trimmed.startsWith('•') || trimmed.startsWith('-') ? trimmed : `• ${trimmed}`);
        });
      }
      lines.push('');
    });
  }

  const education = content.education || content.educations;
  if (education && (Array.isArray(education) ? education.length : true)) {
    section('Education');
    const eduArr = Array.isArray(education) ? education : [education];
    eduArr.forEach((edu) => {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
      const institution = edu.institution || edu.school || edu.university;
      const year = edu.year || edu.graduationYear || edu.endYear;
      if (degree || institution) lines.push([degree, institution].filter(Boolean).join(' — '));
      if (year) lines.push(String(year));
      lines.push('');
    });
  }

  return lines.join('\n');
}

function scoreColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function sectionHint(label, score, max) {
  if (label === 'Skills'     && score < 20) return 'Add more matching skills to your profile';
  if (label === 'Projects'   && score < 15) return 'Improve your project descriptions with more tech keywords';
  if (label === 'Experience' && score < 12) return 'Add more detail to your experience bullet points';
  if (label === 'Summary'    && score < 2)  return "Your summary doesn't match this JD — consider updating it";
  return null;
}

function BreakdownBar({ label, score, max, color }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const hint = sectionHint(label, score, max);
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--rf-text)' }}>{label}</span>
        <span style={{ fontSize: '12px', color: 'var(--rf-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {score} / {max}
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--card-border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: '3px', transition: 'width 0.7s ease',
        }} />
      </div>
      {hint && (
        <p style={{ fontSize: '11px', color: 'var(--rf-text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
          💡 {hint}
        </p>
      )}
    </div>
  );
}

// ── sessionStorage keys ───────────────────────────────────────────────────────
const FORM_KEY   = 'rf_generate_form';
const RESULT_KEY = 'rf_generate_result';

export default function Generate() {
  const { addToast } = useToast();

  // ── Restore from sessionStorage on mount ──────────────────────────────────
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(FORM_KEY);
      return saved ? JSON.parse(saved) : { jobTitle: '', companyName: '', jdText: '' };
    } catch { return { jobTitle: '', companyName: '', jdText: '' }; }
  });

  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem(RESULT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({});
  // ── Track which button is downloading ─────────────────────────────────────
  const [downloading, setDownloading]   = useState(null); // 'pdf' | 'docx' | null

  // ── Persist form on every change ──────────────────────────────────────────
  useEffect(() => {
    try { sessionStorage.setItem(FORM_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  // ── Persist result whenever it changes ────────────────────────────────────
  useEffect(() => {
    try {
      if (result) sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
      else sessionStorage.removeItem(RESULT_KEY);
    } catch {}
  }, [result]);

  const validate = () => {
    const e = {};
    if (!form.jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.jdText.trim()) e.jdText = 'Job description is required';
    else if (form.jdText.trim().split(/\s+/).length < 20)
      e.jdText = 'Please paste a more complete job description (at least 20 words)';
    else if (/\b(hi\s|hello\s|dear\s|regards|salary|lpa|ctc|perks|apply by|deadline|cab facility|health insurance)\b/i.test(form.jdText))
      e.jdText = 'Looks like this contains recruiter email content. Please paste only the job description section.';
    return e;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/resume/generate', form);
      setResult(data);
      addToast('Resume generated successfully!', 'success');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Generation failed. Make sure your profile and skills are set up.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Download: reads font from localStorage, sends as query param ──────────
  const handleDownload = async (type) => {
    const token = localStorage.getItem('token');
    // Read the font key saved by Settings.jsx; default to 'georgia'
    const font  = localStorage.getItem(FONT_KEY) || 'georgia';
    const url   = `http://localhost:8080/api/resume/export/${type}/${result.resumeVersionId}?font=${encodeURIComponent(font)}`;

    setDownloading(type);
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob   = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.setAttribute('download', `resume.${type}`);
      a.click();
      URL.revokeObjectURL(blobUrl);
      addToast(`Resume downloaded as ${type.toUpperCase()}`, 'success');
    } catch {
      addToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  // ── Clear — wipes form + result + sessionStorage ──────────────────────────
  const handleClear = () => {
    setForm({ jobTitle: '', companyName: '', jdText: '' });
    setResult(null);
    setErrors({});
  };

  const wordCount   = form.jdText.trim().split(/\s+/).filter(Boolean).length;
  const previewText = result?.resumeContent ? formatResumeContent(result.resumeContent) : '';
  const score       = result?.atsScore ?? 0;

  const hasBreakdown  = result !== null && result.skillScore !== undefined && result.skillScore !== null;
  const breakdownRows = hasBreakdown ? [
    { label: 'Skills',     score: result.skillScore,      max: 40, color: '#1D9E75' },
    { label: 'Experience', score: result.experienceScore, max: 25, color: '#534AB7' },
    { label: 'Projects',   score: result.projectScore,    max: 30, color: '#185FA5' },
    { label: 'Summary',    score: result.summaryScore,    max: 5,  color: '#854F0B' },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="page-title">Generate Resume</h1>
          <span className="badge bg-forge-600/20 border border-forge-500/30 text-forge-400 text-xs font-mono">AI</span>
        </div>
        <p className="text-sm rf-text-muted">
          Paste a job description and we'll generate a tailored, ATS-optimized resume.
        </p>
      </div>

      {/* ── Input form ────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title *</label>
              <input className={`input-field ${errors.jobTitle ? 'border-red-500/60' : ''}`}
                placeholder="Senior Software Engineer" value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
              {errors.jobTitle && <p className="mt-1.5 text-xs text-red-400">{errors.jobTitle}</p>}
            </div>
            <div>
              <label className="label">Company Name *</label>
              <input className={`input-field ${errors.companyName ? 'border-red-500/60' : ''}`}
                placeholder="Google, Meta, Startup Inc…" value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              {errors.companyName && <p className="mt-1.5 text-xs text-red-400">{errors.companyName}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Job Description *</label>
              <span className={`text-xs font-mono ${wordCount < 20 ? 'text-amber-400' : 'rf-text-muted'}`}>
                {wordCount} words {wordCount < 20 && '(need 20+)'}
              </span>
            </div>
            <textarea
              className={`input-field h-56 resize-none font-mono text-sm leading-relaxed ${errors.jdText ? 'border-red-500/60' : ''}`}
              placeholder="Paste the full job description here…"
              value={form.jdText}
              onChange={(e) => setForm({ ...form, jdText: e.target.value })} />
            {errors.jdText && <p className="mt-1.5 text-xs text-red-400">{errors.jdText}</p>}
            <p className="text-xs rf-text-muted mt-1.5">
              Pro tip: Paste only the job description — not the full email. Include requirements, responsibilities,
              and preferred qualifications for the best ATS score.
            </p>
          </div>

          <div className="flex justify-between items-center">
            {(form.jobTitle || form.companyName || form.jdText || result)
              ? <button type="button" onClick={handleClear} className="btn-secondary text-sm px-4 py-2">Clear</button>
              : <div />}
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-base">
              {loading ? <><Spinner size="lg" /> Generating resume…</> : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Resume
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="card p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-forge-600/20 border border-forge-500/20 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          </div>
          <p className="font-display font-semibold rf-text mb-1">Analyzing job description…</p>
          <p className="text-sm rf-text-muted">Matching your profile, selecting projects, and optimizing for ATS.</p>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="space-y-5 animate-fade-up">

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card p-6"><ScoreBar score={score} /></div>
            <div className="card p-6 flex flex-col justify-between gap-4">
              <div>
                <p className="font-display font-semibold rf-text mb-1">Export Resume</p>
                <p className="text-xs rf-text-muted">
                  Download your tailored resume in your preferred format.{' '}
                  <span className="text-xs" style={{ color: 'var(--rf-text-muted)', fontStyle: 'italic' }}>
                    Font: <strong>{localStorage.getItem(FONT_KEY) || 'georgia'}</strong>
                    {' '}— change in{' '}
                    <a href="/settings" style={{ color: 'var(--rf-accent, #6272f5)', textDecoration: 'underline' }}>
                      Settings
                    </a>
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                {/* PDF button */}
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading !== null}
                  className="btn-primary flex-1 justify-center"
                >
                  {downloading === 'pdf' ? (
                    <><Spinner /> Exporting…</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </>
                  )}
                </button>

                {/* DOCX button */}
                <button
                  onClick={() => handleDownload('docx')}
                  disabled={downloading !== null}
                  className="btn-secondary flex-1 justify-center"
                >
                  {downloading === 'docx' ? (
                    <><Spinner /> Exporting…</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      DOCX
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── ATS Score breakdown ──────────────────────────────────────── */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--rf-text-muted)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="w-full">
                <p className="font-display font-semibold rf-text text-sm mb-1">ATS Score Breakdown</p>
                <p className="text-xs rf-text-muted leading-relaxed">
                  Your score of{' '}
                  <span className="font-bold text-sm" style={{ color: scoreColor(score) }}>{score}/100</span>{' '}
                  is calculated by matching your skills, experience keywords, and profile against the job description.
                  {result.missingSkills?.length === 0
                    ? ' Great — your profile covers the key requirements well!'
                    : result.missingSkills?.length <= 5
                    ? ` You're close — adding the ${result.missingSkills.length} missing skill${result.missingSkills.length > 1 ? 's' : ''} below could push your score higher.`
                    : score >= 70
                    ? ` Your profile matches well. The ${result.missingSkills?.length} missing skills are mostly optional.`
                    : ' Your profile partially matches this role. Adding missing skills will help.'}
                </p>

                {breakdownRows.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--card-border)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rf-text-muted)', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Score by section
                    </p>
                    {breakdownRows.map((row) => <BreakdownBar key={row.label} {...row} />)}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--card-border)', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rf-text)' }}>Total</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: scoreColor(score) }}>{score} / 100</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 px-3 py-2.5 rounded-lg flex items-start gap-2"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs italic leading-relaxed" style={{ color: '#f59e0b', opacity: 0.9 }}>
                    This score is an estimate based on keyword matching and is indicative only.
                    Actual ATS systems used by employers may evaluate resumes differently.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Missing skills ────────────────────────────────────────────── */}
          {result.missingSkills?.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-display font-semibold rf-text">Missing Skills</p>
                <span className="text-xs rf-text-muted">({result.missingSkills.length} skills from JD not in your profile)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, i) => (
                  <span key={i} className="badge bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {displayName(skill)}
                  </span>
                ))}
              </div>
              <p className="text-xs rf-text-muted mt-3">Add these skills to your profile to improve your ATS score for similar roles.</p>
            </div>
          )}

          {/* ── Resume preview ────────────────────────────────────────────── */}
          {previewText && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-semibold rf-text">Resume Preview</p>
                <span className="text-xs rf-text-muted font-mono">Version #{result.resumeVersionId}</span>
              </div>
              <div className="rounded-xl p-6 border overflow-auto max-h-[600px]"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed rf-text">{previewText}</pre>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}