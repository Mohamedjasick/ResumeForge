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

const PROFICIENCIES = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
const CATEGORIES = ['TECHNICAL', 'TOOL', 'SOFT'];

const profColors = {
  BEGINNER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  INTERMEDIATE: 'bg-forge-500/10 text-forge-400 border-forge-500/20',
  EXPERT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const catColors = {
  TECHNICAL: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  TOOL: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  SOFT: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const empty = { name: '', proficiency: 'INTERMEDIATE', category: 'TECHNICAL' };

export default function Skills() {
  const { addToast } = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSkills = async () => {
    try {
      const { data } = await api.get('/skills');
      setSkills(data);
    } catch { addToast('Failed to load skills', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast('Skill name is required', 'error'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/skills/${editId}`, form);
        addToast('Skill updated', 'success');
      } else {
        await api.post('/skills', form);
        addToast('Skill added', 'success');
      }
      setForm(empty); setEditId(null);
      fetchSkills();
    } catch { addToast('Failed to save skill', 'error'); }
    setSubmitting(false);
  };

  const handleEdit = (skill) => {
    setEditId(skill.id);
    setForm({ name: skill.name, proficiency: skill.proficiency, category: skill.category });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/skills/${id}`);
      addToast('Skill removed', 'success');
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch { addToast('Failed to delete skill', 'error'); }
    setDeletingId(null);
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="page-title">Skills</h1>
        <p className="text-sm mt-1 rf-text-muted">Manage the skills used to match your resume to job descriptions.</p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <h2 className="section-title mb-4">{editId ? 'Edit Skill' : 'Add Skill'}</h2>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="label">Skill Name</label>
            <input className="input-field" placeholder="e.g. React, Python…" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Proficiency</label>
            <select className="input-field" value={form.proficiency}
              onChange={(e) => setForm({ ...form, proficiency: e.target.value })}>
              {PROFICIENCIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3 flex gap-3 justify-end">
            {editId && (
              <button type="button" onClick={() => { setForm(empty); setEditId(null); }} className="btn-secondary">
                Cancel
              </button>
            )}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <><Spinner /> Saving…</> : editId ? 'Update Skill' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>

      {/* Skill list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="card p-6 shimmer-bg h-32" />)}
        </div>
      ) : skills.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-2">🧠</p>
          <p className="font-display font-medium rf-text">No skills yet</p>
          <p className="text-sm rf-text-muted mt-1">Add your first skill above</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((cat) => grouped[cat].length > 0 && (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge border ${catColors[cat]}`}>{cat}</span>
                <span className="text-xs rf-text-muted">{grouped[cat].length} skills</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[cat].map((skill) => (
                  <div key={skill.id} className="card p-4 flex items-center justify-between group">
                    <div>
                      <p className="font-display font-medium rf-text text-sm">{skill.name}</p>
                      <span className={`badge border text-xs mt-1.5 ${profColors[skill.proficiency]}`}>
                        {skill.proficiency.charAt(0) + skill.proficiency.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(skill)}
                        className="p-1.5 rounded-lg hover:bg-forge-900/40 rf-text-muted hover:text-forge-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(skill.id)} disabled={deletingId === skill.id}
                        className="p-1.5 rounded-lg hover:bg-red-900/30 rf-text-muted hover:text-red-400 transition-colors">
                        {deletingId === skill.id ? <Spinner /> : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}