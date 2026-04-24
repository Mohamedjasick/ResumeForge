import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const quickActions = [
  { label: 'Generate Resume', desc: 'Paste a JD and get a tailored resume', path: '/generate', icon: '⚡', accent: 'from-forge-600 to-forge-400' },
  { label: 'Add Experience', desc: 'Log a new role or position', path: '/experience', icon: '💼', accent: 'from-violet-600 to-violet-400' },
  { label: 'Add Skills', desc: 'Keep your skill set updated', path: '/skills', icon: '🧠', accent: 'from-emerald-600 to-emerald-400' },
  { label: 'View Versions', desc: 'Download past resumes', path: '/versions', icon: '📄', accent: 'from-amber-600 to-amber-400' },
];

function StatCard({ label, value, loading }) {
  return (
    <div className="card p-5">
      {loading ? (
        <div className="shimmer-bg rounded-lg h-12 w-full" />
      ) : (
        <>
          <p className="text-3xl font-display font-bold" style={{ color: 'var(--stat-value)' }}>{value}</p>
          <p className="text-sm font-body mt-1 rf-text-muted">{label}</p>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [displayName, setDisplayName] = useState('');
  const [stats, setStats] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [skillsRes, projectsRes, expRes, versionsRes, profileRes] = await Promise.all([
          api.get('/skills'),
          api.get('/projects'),
          api.get('/experiences'),
          api.get('/resume-versions'),
          api.get('/profile'),
        ]);

        setStats({
          skills: skillsRes.data.length,
          projects: projectsRes.data.length,
          experience: expRes.data.length,
          versions: versionsRes.data.length,
        });
        setVersions(versionsRes.data.slice(0, 3));

        // Use fullName from profile; fall back to email prefix if profile not set up yet
        const fullName = profileRes.data?.fullName;
        if (fullName && fullName.trim()) {
          setDisplayName(fullName.trim().split(' ')[0]); // first name only
        } else {
          const email = localStorage.getItem('email') || '';
          setDisplayName(email.split('@')[0]);
        }
      } catch (_) {
        // If profile fetch fails, fall back to email prefix
        const email = localStorage.getItem('email') || '';
        setDisplayName(email.split('@')[0]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-body rf-text-muted">{greeting},</p>
          <h1 className="font-display font-bold text-3xl page-title capitalize">
            {loading ? '…' : displayName} 👋
          </h1>
        </div>
        <Link to="/generate" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Resume
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Skills" value={stats?.skills ?? '—'} loading={loading} />
        <StatCard label="Projects" value={stats?.projects ?? '—'} loading={loading} />
        <StatCard label="Experience" value={stats?.experience ?? '—'} loading={loading} />
        <StatCard label="Resumes Generated" value={stats?.versions ?? '—'} loading={loading} />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="card p-5 hover:border-forge-700/50 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.accent} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <p className="font-display font-semibold text-sm rf-text mb-1">{action.label}</p>
              <p className="text-xs font-body leading-relaxed rf-text-muted">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent versions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Resumes</h2>
          <Link to="/versions" className="text-sm text-forge-400 hover:text-forge-300 font-display font-medium transition-colors">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 shimmer-bg h-16" />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-display font-medium rf-text mb-1">No resumes yet</p>
            <p className="text-sm rf-text-muted mb-4">Generate your first tailored resume with AI</p>
            <Link to="/generate" className="btn-primary inline-flex mx-auto">Generate Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => (
              <div key={v.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-medium rf-text text-sm">{v.jobTitle || 'Resume'}</p>
                  <p className="text-xs rf-text-muted">{v.companyName} · ATS {v.atsScore ?? '—'}/100</p>
                </div>
                <div className="flex gap-2">
                  <a href={`http://localhost:8080/api/resume/export/pdf/${v.id}`} target="_blank" rel="noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5">PDF</a>
                  <a href={`http://localhost:8080/api/resume/export/docx/${v.id}`} target="_blank" rel="noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5">DOCX</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}