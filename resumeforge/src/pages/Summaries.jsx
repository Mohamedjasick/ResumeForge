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

const empty = { content: '', domainTag: '' };

export default function Summaries() {
  const { addToast } = useToast();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSummaries = async () => {
    try {
      const { data } = await api.get('/summaries');
      setSummaries(data);
    } catch { addToast('Failed to load summaries', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchSummaries(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) { addToast('Summary content is required', 'error'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/summaries/${editId}`, form);
        addToast('Summary updated', 'success');
      } else {
        await api.post('/summaries', form);
        addToast('Summary added', 'success');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchSummaries();
    } catch { addToast('Failed to save summary', 'error'); }
    setSubmitting(false);
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({ content: s.content, domainTag: s.domainTag || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/summaries/${id}`);
      addToast('Summary removed', 'success');
      setSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch { addToast('Failed to delete', 'error'); }
    setDeletingId(null);
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(empty); };
  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Summaries</h1>
          <p className="text-sm mt-1 rf-text-muted">Write domain-specific professional summaries for resume customization.</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true); }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Summary
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="section-title mb-5">{editId ? 'Edit Summary' : 'New Summary'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Domain Tag</label>
              <input className="input-field" placeholder="Full Stack, Data Science, DevOps…" value={form.domainTag}
                onChange={(e) => setForm({ ...form, domainTag: e.target.value })} />
              <p className="text-xs rf-text-muted mt-1.5">Tag helps the engine pick the best summary for each job description.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Summary Content *</label>
                <span className={`text-xs font-mono ${wordCount > 80 ? 'text-amber-400' : 'rf-text-muted'}`}>{wordCount} words</span>
              </div>
              <textarea className="input-field h-36 resize-none" placeholder="Results-driven software engineer with 3+ years building scalable…"
                value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              <p className="text-xs rf-text-muted mt-1.5">Aim for 40–80 words. Write in third person, lead with impact.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <><Spinner /> Saving…</> : editId ? 'Update' : 'Add Summary'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="card p-6 shimmer-bg h-28" />)}</div>
      ) : summaries.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-2">📝</p>
          <p className="font-display font-medium rf-text">No summaries yet</p>
          <p className="text-sm rf-text-muted mt-1">Create professional summaries tailored to different domains</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => (
            <div key={s.id} className="card p-6 group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {s.domainTag ? (
                    <span className="badge bg-forge-500/10 border border-forge-500/20 text-forge-400">{s.domainTag}</span>
                  ) : (
                    <span className="badge border rf-text-muted" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>General</span>
                  )}
                  <span className="text-xs font-mono rf-text-muted">
                    {s.content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-forge-900/40 rf-text-muted hover:text-forge-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id} className="p-1.5 rounded-lg hover:bg-red-900/30 rf-text-muted hover:text-red-400 transition-colors">
                    {deletingId === s.id ? <Spinner /> : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm font-body leading-relaxed rf-text">{s.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}