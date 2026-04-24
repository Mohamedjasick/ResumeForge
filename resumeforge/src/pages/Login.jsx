import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import { useTheme } from '../contexts/ThemeContext';

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const logoSrc = theme === 'warm' ? '/Resume_Forge_Warm.png' : '/Resume_Forge_Dark.png';

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('email', data.email);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--page-bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] p-12 relative overflow-hidden"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--card-border)' }}>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-forge-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-forge-800/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <img src={logoSrc} alt="ResumeForge" className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-display font-bold text-xl tracking-tight page-title">ResumeForge</span>
        </div>

        {/* Tagline */}
        <div className="relative space-y-6">
          <h2 className="font-display font-bold text-4xl leading-tight page-title">
            Your career,<br />
            <span className="text-gradient">intelligently crafted.</span>
          </h2>
          <p className="font-body text-base leading-relaxed rf-text-muted">
            Generate ATS-optimized resumes tailored to each job description using your profile, skills, and experience.
          </p>
          <div className="space-y-3">
            {['Rule-based context intelligence', 'ATS score optimization', 'PDF & DOCX export'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-forge-600/20 border border-forge-500/30 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-body rf-text">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs rf-text-muted relative">© 2024 ResumeForge. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={logoSrc} alt="ResumeForge" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-display font-bold text-lg page-title">ResumeForge</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl mb-2 page-title">Welcome back</h1>
            <p className="font-body rf-text-muted">Sign in to continue building your career.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email"
                className={`input-field ${errors.email ? 'border-red-500/60' : ''}`}
                placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password"
                className={`input-field ${errors.password ? 'border-red-500/60' : ''}`}
                placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm rf-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-forge-400 hover:text-forge-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}