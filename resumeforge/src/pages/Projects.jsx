import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../components/Toast';

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const empty = { title: '', description: '', domainTag: '', githubUrl: '', liveUrl: '', skillIds: [] };

export default function Projects() {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([api.get('/projects'), api.get('/skills')]);
      setProjects(pRes.data);
      setSkills(sRes.data);
    } catch { addToast('Failed to load data', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast('Title is required', 'error'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, form);
        addToast('Project updated', 'success');
      } else {
        await api.post('/projects', form);
        addToast('Project added', 'success');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchData();
    } catch { addToast('Failed to save project', 'error'); }
    setSubmitting(false);
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description || '', domainTag: p.domainTag || '', githubUrl: p.githubUrl || '', liveUrl: p.liveUrl || '', skillIds: p.skillIds || [] });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      addToast('Project removed', 'success');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch { addToast('Failed to delete', 'error'); }
    setDeletingId(null);
  };

  const toggleSkill = (id) => {
    setForm((f) => ({
      ...f,
      skillIds: f.skillIds.includes(id) ? f.skillIds.filter((s) => s !== id) : [...f.skillIds, id],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-sm mt-1 rf-text-muted">Showcase your work with linked skills and live demos.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="section-title mb-5">{editId ? 'Edit Project' : 'New Project'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Title *</label>
                <input className="input-field" placeholder="ResumeForge" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Domain Tag</label>
                <input className="input-field" placeholder="Full Stack, AI/ML…" value={form.domainTag}
                  onChange={(e) => setForm({ ...form, domainTag: e.target.value })} />
              </div>
              <div>
                <label className="label">GitHub URL</label>
                <input className="input-field" placeholder="https://github.com/…" value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
              </div>
              <div>
                <label className="label">Live URL</label>
                <input className="input-field" placeholder="https://…" value={form.liveUrl}
                  onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field h-24 resize-none" placeholder="Describe what you built and its impact…"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {skills.length > 0 && (
              <div>
                <label className="label">Related Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.map((s) => (
                    <button key={s.id} type="button"
                      onClick={() => toggleSkill(s.id)}
                      className={`badge border cursor-pointer transition-all ${form.skillIds.includes(s.id) ? 'bg-forge-600/20 border-forge-500/50 text-forge-300' : 'border-ink-700/40 hover:border-ink-600'}`}
                      style={!form.skillIds.includes(s.id) ? { color: 'var(--rf-text-muted)', background: 'var(--input-bg)' } : {}}>
                      {form.skillIds.includes(s.id) && '✓ '}{s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <><Spinner /> Saving…</> : editId ? 'Update' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="card p-6 shimmer-bg h-28" />)}</div>
      ) : projects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-2">🚀</p>
          <p className="font-display font-medium rf-text">No projects yet</p>
          <p className="text-sm rf-text-muted mt-1">Add your first project to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card p-5 hover:border-ink-700/50 transition-all group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold rf-text">{p.title}</p>
                  {p.domainTag && <span className="badge bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mt-1">{p.domainTag}</span>}
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-forge-900/40 rf-text-muted hover:text-forge-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-1.5 rounded-lg hover:bg-red-900/30 rf-text-muted hover:text-red-400 transition-colors">
                    {deletingId === p.id ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {p.description && <p className="text-sm font-body leading-relaxed mb-3 line-clamp-2 rf-text-muted">{p.description}</p>}
              <div className="flex gap-3 text-xs">
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-forge-400 hover:text-forge-300 transition-colors font-display">GitHub ↗</a>}
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors font-display">Live Demo ↗</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}