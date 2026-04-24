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

const profileFields = [
  { id: 'fullName',      label: 'Full Name',                  placeholder: 'Jane Smith',                  span: true },
  { id: 'contactEmail',  label: 'Contact Email (for resume)', placeholder: 'jane@example.com',            span: true,
    hint: 'This email appears on your generated resume. Leave blank to use your login email.' },
  { id: 'phone',         label: 'Phone',                      placeholder: '+1 555 000 0000' },
  { id: 'location',      label: 'Location',                   placeholder: 'San Francisco, CA' },
  { id: 'linkedinUrl',   label: 'LinkedIn URL',               placeholder: 'https://linkedin.com/in/jane' },
  { id: 'githubUrl',     label: 'GitHub URL',                 placeholder: 'https://github.com/jane' },
  { id: 'portfolioUrl',  label: 'Portfolio URL',              placeholder: 'https://jane.dev' },
];

// ── Problem 5: school fields added ───────────────────────────────────────────
const emptyEdu = {
  degree: '', fieldOfStudy: '', university: '', graduationYear: '', grade: '',
  schoolTenthName: '', tenthBoard: '', tenthPercentage: '', tenthYear: '',
  schoolTwelfthName: '', twelfthBoard: '', twelfthPercentage: '', twelfthYear: '',
};

export default function Profile() {
  const { addToast } = useToast();

  // Profile state
  const [form, setForm] = useState({
    fullName: '', contactEmail: '', phone: '', location: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile,  setSavingProfile]  = useState(false);

  // Education state
  const [educations,    setEducations]    = useState([]);
  const [loadingEdu,    setLoadingEdu]    = useState(true);
  const [showEduForm,   setShowEduForm]   = useState(false);
  const [eduForm,       setEduForm]       = useState(emptyEdu);
  const [editingEduId,  setEditingEduId]  = useState(null);
  const [savingEdu,     setSavingEdu]     = useState(false);
  const [deletingEduId, setDeletingEduId] = useState(null);

  // Load profile
  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setForm({
        fullName:     data.fullName     || '',
        contactEmail: data.contactEmail || '',
        phone:        data.phone        || '',
        location:     data.location     || '',
        linkedinUrl:  data.linkedinUrl  || '',
        githubUrl:    data.githubUrl    || '',
        portfolioUrl: data.portfolioUrl || '',
      });
    }).catch(() => {}).finally(() => setLoadingProfile(false));
  }, []);

  // Load educations
  useEffect(() => {
    api.get('/education').then(({ data }) => {
      setEducations(data);
    }).catch(() => {}).finally(() => setLoadingEdu(false));
  }, []);

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/profile', form);
      addToast('Profile updated successfully', 'success');
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Add or update education — Problem 5: parse tenthYear & twelfthYear as int
  const handleSaveEdu = async (e) => {
    e.preventDefault();
    setSavingEdu(true);
    try {
      const payload = {
        ...eduForm,
        graduationYear: eduForm.graduationYear ? parseInt(eduForm.graduationYear) : null,
        tenthYear:      eduForm.tenthYear      ? parseInt(eduForm.tenthYear)      : null,
        twelfthYear:    eduForm.twelfthYear    ? parseInt(eduForm.twelfthYear)    : null,
      };
      if (editingEduId) {
        const { data } = await api.put(`/education/${editingEduId}`, payload);
        setEducations(educations.map(ed => ed.id === editingEduId ? data : ed));
        addToast('Education updated', 'success');
      } else {
        const { data } = await api.post('/education', payload);
        setEducations([...educations, data]);
        addToast('Education added', 'success');
      }
      setShowEduForm(false);
      setEduForm(emptyEdu);
      setEditingEduId(null);
    } catch {
      addToast('Failed to save education', 'error');
    } finally {
      setSavingEdu(false);
    }
  };

  // Delete education
  const handleDeleteEdu = async (id) => {
    setDeletingEduId(id);
    try {
      await api.delete(`/education/${id}`);
      setEducations(educations.filter(ed => ed.id !== id));
      addToast('Education deleted', 'success');
    } catch {
      addToast('Failed to delete education', 'error');
    } finally {
      setDeletingEduId(null);
    }
  };

  // Edit education — Problem 5: map all school fields
  const handleEditEdu = (edu) => {
    setEduForm({
      degree:            edu.degree            || '',
      fieldOfStudy:      edu.fieldOfStudy      || '',
      university:        edu.university        || '',
      graduationYear:    edu.graduationYear    || '',
      grade:             edu.grade             || '',
      schoolTenthName:   edu.schoolTenthName   || '',
      tenthBoard:        edu.tenthBoard        || '',
      tenthPercentage:   edu.tenthPercentage   || '',
      tenthYear:         edu.tenthYear         || '',
      schoolTwelfthName: edu.schoolTwelfthName || '',
      twelfthBoard:      edu.twelfthBoard      || '',
      twelfthPercentage: edu.twelfthPercentage || '',
      twelfthYear:       edu.twelfthYear       || '',
    });
    setEditingEduId(edu.id);
    setShowEduForm(true);
  };

  const handleCancelEdu = () => {
    setShowEduForm(false);
    setEduForm(emptyEdu);
    setEditingEduId(null);
  };

  // Shared label style
  const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--label-text)', marginBottom: '0.3rem',
  };

  // Shared sub-section heading style
  const subHeadingStyle = {
    fontSize: '0.72rem', fontWeight: 700, color: 'var(--rf-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '0.75rem', marginTop: '0.25rem',
  };

  return (
    <div className="animate-fade-up">

      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Profile</h1>
        <p style={{ color: 'var(--rf-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          This information is used to build your resume header and education section.
        </p>
      </div>

      {/* ── Personal Information ── */}
      {loadingProfile ? (
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer-bg rounded-xl"
              style={{ height: '3rem', width: '100%', marginBottom: '1rem' }} />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{
            color: 'var(--section-title)', fontWeight: 700,
            fontSize: '1rem', marginBottom: '1.25rem',
          }}>
            Personal Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {profileFields.map(({ id, label, placeholder, span, hint }) => (
              <div key={id} className={span ? 'sm:col-span-2' : ''}>
                <label style={{
                  display: 'block', fontSize: '0.875rem', fontWeight: 600,
                  color: 'var(--label-text)', marginBottom: '0.375rem',
                }}>
                  {label}
                </label>
                <input
                  type={id === 'contactEmail' ? 'email' : 'text'}
                  className="input-field"
                  placeholder={placeholder}
                  value={form[id]}
                  onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                />
                {hint && (
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--rf-text-muted)',
                    marginTop: '0.3rem', lineHeight: '1.4',
                  }}>
                    {hint}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? (
                <><Spinner /> Saving…</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Education Section ── */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1.25rem',
        }}>
          <h2 style={{ color: 'var(--section-title)', fontWeight: 700, fontSize: '1rem' }}>
            Education
          </h2>
          {!showEduForm && (
            <button
              onClick={() => { setShowEduForm(true); setEditingEduId(null); setEduForm(emptyEdu); }}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Education
            </button>
          )}
        </div>

        {/* ── Education form ── */}
        {showEduForm && (
          <form onSubmit={handleSaveEdu} style={{
            background: 'var(--input-bg)', borderRadius: '0.75rem',
            padding: '1.25rem', marginBottom: '1.25rem',
            border: '1px solid var(--card-border)',
          }}>
            <h3 style={{
              color: 'var(--section-title)', fontWeight: 600,
              fontSize: '0.9rem', marginBottom: '1.1rem',
            }}>
              {editingEduId ? 'Edit Education' : 'New Education'}
            </h3>

            {/* ── College / University ── */}
            <p style={subHeadingStyle}>🎓 College / University</p>
            <div className="grid sm:grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              {[
                { id: 'degree',         label: 'Degree',          placeholder: 'B.Tech Computer Science', span: true, required: true },
                { id: 'fieldOfStudy',   label: 'Field of Study',  placeholder: 'Computer Science' },
                { id: 'university',     label: 'University',      placeholder: 'Anna University',         required: true },
                { id: 'graduationYear', label: 'Graduation Year', placeholder: '2024', type: 'number' },
                { id: 'grade',          label: 'Grade / GPA',     placeholder: '8.5 CGPA' },
              ].map(({ id, label, placeholder, required, span, type }) => (
                <div key={id} className={span ? 'sm:col-span-2' : ''}>
                  <label style={labelStyle}>
                    {label} {required && <span style={{ color: '#f87171' }}>*</span>}
                  </label>
                  <input
                    type={type || 'text'}
                    className="input-field"
                    placeholder={placeholder}
                    required={required}
                    value={eduForm[id]}
                    onChange={(e) => setEduForm({ ...eduForm, [id]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            {/* ── 12th Standard ── */}
            <p style={subHeadingStyle}>📄 12th Standard (Higher Secondary)</p>
            <div className="grid sm:grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              {[
                { id: 'schoolTwelfthName', label: 'School Name',         placeholder: 'St. Joseph Higher Secondary School', span: true },
                { id: 'twelfthBoard',      label: 'Board',               placeholder: 'CBSE / ICSE / State Board' },
                { id: 'twelfthPercentage', label: 'Percentage / Marks',  placeholder: '92.4%' },
                { id: 'twelfthYear',       label: 'Year of Passing',     placeholder: '2020', type: 'number' },
              ].map(({ id, label, placeholder, span, type }) => (
                <div key={id} className={span ? 'sm:col-span-2' : ''}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type || 'text'}
                    className="input-field"
                    placeholder={placeholder}
                    value={eduForm[id]}
                    onChange={(e) => setEduForm({ ...eduForm, [id]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            {/* ── 10th Standard ── */}
            <p style={subHeadingStyle}>📄 10th Standard (Secondary)</p>
            <div className="grid sm:grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
              {[
                { id: 'schoolTenthName', label: 'School Name',        placeholder: 'St. Joseph High School', span: true },
                { id: 'tenthBoard',      label: 'Board',              placeholder: 'CBSE / ICSE / State Board' },
                { id: 'tenthPercentage', label: 'Percentage / Marks', placeholder: '95.2%' },
                { id: 'tenthYear',       label: 'Year of Passing',    placeholder: '2018', type: 'number' },
              ].map(({ id, label, placeholder, span, type }) => (
                <div key={id} className={span ? 'sm:col-span-2' : ''}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type || 'text'}
                    className="input-field"
                    placeholder={placeholder}
                    value={eduForm[id]}
                    onChange={(e) => setEduForm({ ...eduForm, [id]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem' }}>
              <button type="button" onClick={handleCancelEdu} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={savingEdu} className="btn-primary">
                {savingEdu ? <><Spinner /> Saving…</> : editingEduId ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* ── Education list ── */}
        {loadingEdu ? (
          <div className="shimmer-bg rounded-xl" style={{ height: '5rem', width: '100%' }} />
        ) : educations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--rf-text-muted)' }}>
            <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <p style={{ fontSize: '0.875rem' }}>No education added yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {educations.map((edu) => (
              <div key={edu.id} style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: '0.75rem', padding: '1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1 }}>
                  {/* College */}
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--section-title)' }}>
                    {edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--rf-text-muted)', marginTop: '0.2rem' }}>
                    {edu.university}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {edu.graduationYear && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--rf-text-muted)' }}>
                        🎓 {edu.graduationYear}
                      </span>
                    )}
                    {edu.grade && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--rf-text-muted)' }}>
                        ⭐ {edu.grade}
                      </span>
                    )}
                  </div>

                  {/* 12th */}
                  {edu.schoolTwelfthName && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--section-title)' }}>
                        12th — {edu.schoolTwelfthName}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {edu.twelfthBoard && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--rf-text-muted)' }}>
                            📋 {edu.twelfthBoard}
                          </span>
                        )}
                        {edu.twelfthPercentage && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--rf-text-muted)' }}>
                            ⭐ {edu.twelfthPercentage}
                          </span>
                        )}
                        {edu.twelfthYear && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--rf-text-muted)' }}>
                            📅 {edu.twelfthYear}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 10th */}
                  {edu.schoolTenthName && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--section-title)' }}>
                        10th — {edu.schoolTenthName}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {edu.tenthBoard && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--rf-text-muted)' }}>
                            📋 {edu.tenthBoard}
                          </span>
                        )}
                        {edu.tenthPercentage && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--rf-text-muted)' }}>
                            ⭐ {edu.tenthPercentage}
                          </span>
                        )}
                        {edu.tenthYear && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--rf-text-muted)' }}>
                            📅 {edu.tenthYear}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit / Delete buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleEditEdu(edu)}
                    style={{
                      background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)',
                      borderRadius: '0.5rem', padding: '0.4rem 0.7rem',
                      color: 'var(--btn-secondary-text)', cursor: 'pointer', fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEdu(edu.id)}
                    disabled={deletingEduId === edu.id}
                    style={{
                      background: 'transparent', border: '1px solid #f87171',
                      borderRadius: '0.5rem', padding: '0.4rem 0.7rem',
                      color: '#f87171', cursor: 'pointer', fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    {deletingEduId === edu.id ? <Spinner /> : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}