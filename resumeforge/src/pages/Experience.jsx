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

const EMPLOYMENT_TYPES = [
  'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'COLLEGE_PROJECT',
];

const TYPE_LABELS = {
  'FULL_TIME':       'Full-time',
  'PART_TIME':       'Part-time',
  'INTERNSHIP':      'Internship',
  'FREELANCE':       'Freelance',
  'COLLEGE_PROJECT': 'College Project',
};

const TYPE_COLORS = {
  'FULL_TIME':       { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400' },
  'PART_TIME':       { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20', text: 'text-yellow-400' },
  'INTERNSHIP':      { bg: 'bg-green-500/10',   border: 'border-green-500/20',  text: 'text-green-400' },
  'FREELANCE':       { bg: 'bg-orange-500/10',  border: 'border-orange-500/20', text: 'text-orange-400' },
  'COLLEGE_PROJECT': { bg: 'bg-purple-500/10',  border: 'border-purple-500/20', text: 'text-purple-400' },
};

const empty = {
  jobTitle: '', companyName: '', employmentType: 'FULL_TIME',
  startDate: '', endDate: '', currentlyWorking: false,
  location: '', domainTag: '', description: '',
};

export default function Experience() {
  const { addToast } = useToast();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const eRes = await api.get('/experiences');
      setExperiences(eRes.data);
    } catch { addToast('Failed to load data', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      addToast('Company and job title are required', 'error'); return;
    }
    setSubmitting(true);

    const payload = {
      jobTitle:         form.jobTitle,
      companyName:      form.companyName,
      employmentType:   form.employmentType,
      location:         form.location,
      domainTag:        form.domainTag,
      startDate:        form.startDate || null,
      endDate:          form.currentlyWorking ? null : (form.endDate || null),
      currentlyWorking: form.currentlyWorking,
      description:      form.description,
    };

    try {
      if (editId) {
        await api.put(`/experiences/${editId}`, payload);
        addToast('Experience updated', 'success');
      } else {
        await api.post('/experiences', payload);
        addToast('Experience added', 'success');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchData();
    } catch { addToast('Failed to save experience', 'error'); }
    setSubmitting(false);
  };

  const handleEdit = (exp) => {
    setEditId(exp.id);
    setForm({
      jobTitle:         exp.jobTitle        || '',
      companyName:      exp.companyName     || '',
      employmentType:   exp.employmentType  || 'FULL_TIME',
      startDate:        exp.startDate       || '',
      endDate:          exp.endDate         || '',
      currentlyWorking: exp.currentlyWorking || false,
      location:         exp.location        || '',
      domainTag:        exp.domainTag       || '',
      description:      exp.description     || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/experiences/${id}`);
      addToast('Experience removed', 'success');
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch { addToast('Failed to delete', 'error'); }
    setDeletingId(null);
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(empty); };

  const isFresher = ['INTERNSHIP', 'COLLEGE_PROJECT'].includes(form.employmentType);
  const companyLabel = form.employmentType === 'COLLEGE_PROJECT' ? 'College / Institution *' : 'Company *';
  const companyPlaceholder = form.employmentType === 'COLLEGE_PROJECT' ? 'Anna University' : 'Acme Corp';
  const roleLabel = form.employmentType === 'COLLEGE_PROJECT' ? 'Project Title *' : 'Job Title *';
  const rolePlaceholder = form.employmentType === 'COLLEGE_PROJECT' ? 'Final Year Project' : 'Software Engineer';
  const endLabel = form.employmentType === 'COLLEGE_PROJECT' ? 'Submission Date' : 'End Date';
  const currentLabel = form.employmentType === 'COLLEGE_PROJECT' ? 'Ongoing project' : 'Currently working here';

  // ── Description placeholder — shows example bullet lines ─────────────────
  const descriptionPlaceholder = form.employmentType === 'COLLEGE_PROJECT'
    ? 'Built a REST API using Spring Boot and Java\nUsed MySQL for data storage with query optimization\nDeployed using Docker containers\nImplemented JWT authentication for secure access'
    : 'Developed REST APIs using Spring Boot and Java\nOptimized MySQL queries reducing load time by 30%\nImplemented JWT authentication for secure API access\nFollowed agile scrum and CI/CD pipeline practices';

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Experience</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--rf-text-muted)' }}>
            Add work experience, internships, freelance, or college projects.
          </p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true); }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Experience
        </button>
      </div>

      {/* Fresher hint */}
      {!showForm && experiences.length === 0 && !loading && (
        <div style={{
          background: 'var(--input-bg)', border: '1px solid var(--card-border)',
          borderRadius: '0.75rem', padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>🎓</span>
          <p style={{ fontSize: '0.875rem', color: 'var(--rf-text-muted)' }}>
            <strong style={{ color: 'var(--rf-text)' }}>Fresher?</strong> You can add internships, college projects, or freelance work — select the type when adding.
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="section-title mb-5">{editId ? 'Edit Experience' : 'New Experience'}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Employment Type selector */}
            <div>
              <label className="label">Type</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {EMPLOYMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, employmentType: type })}
                    style={form.employmentType === type ? {} : { color: 'var(--rf-text-muted)', background: 'var(--input-bg)' }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.employmentType === type
                        ? `${TYPE_COLORS[type].bg} ${TYPE_COLORS[type].border} ${TYPE_COLORS[type].text}`
                        : 'border-transparent'
                    }`}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
              {isFresher && (
                <p className="text-xs mt-2" style={{ color: 'var(--rf-text-muted)' }}>
                  💡 Perfect for freshers — add your {TYPE_LABELS[form.employmentType].toLowerCase()} experience here.
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{companyLabel}</label>
                <input className="input-field" placeholder={companyPlaceholder} value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div>
                <label className="label">{roleLabel}</label>
                <input className="input-field" placeholder={rolePlaceholder} value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input-field" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="label">{endLabel}</label>
                <input type="date" className="input-field" value={form.endDate} disabled={form.currentlyWorking}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={form.currentlyWorking}
                    onChange={(e) => setForm({ ...form, currentlyWorking: e.target.checked, endDate: '' })} />
                  <span className="text-sm" style={{ color: 'var(--rf-text-muted)' }}>{currentLabel}</span>
                </label>
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input-field" placeholder="Remote / Chennai" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <label className="label">Domain Tag</label>
                <input className="input-field" placeholder="Backend, DevOps, AI…" value={form.domainTag}
                  onChange={(e) => setForm({ ...form, domainTag: e.target.value })} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                {form.employmentType === 'COLLEGE_PROJECT' ? 'Project Description' : 'Description'}
              </label>
              <textarea
                className="input-field"
                rows={5}
                placeholder={descriptionPlaceholder}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--rf-text-muted)' }}>
                💡 Write 3–4 achievements, each on a new line — every line will appear as a bullet point on your resume.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <><Spinner /> Saving…</> : editId ? 'Update' : 'Add Experience'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="card p-6 shimmer-bg h-36" />)}</div>
      ) : experiences.length === 0 && !showForm ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-2">💼</p>
          <p className="font-display font-medium" style={{ color: 'var(--rf-text)' }}>No experience added yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--rf-text-muted)' }}>
            Add work experience, internships, or college projects above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => {
            const typeStyle = TYPE_COLORS[exp.employmentType] || TYPE_COLORS['FULL_TIME'];
            return (
              <div key={exp.id} className="card p-6 group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold" style={{ color: 'var(--rf-text)' }}>{exp.jobTitle}</p>
                      {exp.employmentType && (
                        <span className={`badge border text-xs ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}>
                          {TYPE_LABELS[exp.employmentType] || exp.employmentType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--rf-text-muted)' }}>
                      {exp.companyName}{exp.location && ` · ${exp.location}`}
                    </p>
                    <p className="text-xs mt-1 font-mono" style={{ color: 'var(--rf-text-muted)' }}>
                      {exp.startDate} → {exp.currentlyWorking ? 'Present' : exp.endDate || '—'}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(exp)}
                      className="p-1.5 rounded-lg hover:bg-forge-900/40 hover:text-forge-400 transition-colors"
                      style={{ color: 'var(--rf-text-muted)' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(exp.id)} disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition-colors"
                      style={{ color: 'var(--rf-text-muted)' }}>
                      {deletingId === exp.id ? <Spinner /> : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {exp.domainTag && (
                  <span className="badge bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-3 inline-block">
                    {exp.domainTag}
                  </span>
                )}
                {exp.description && (
                  <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--rf-text)' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}