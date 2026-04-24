import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from '../contexts/ThemeContext';

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const Field = ({ label, name, type = "text", value, onChange, errors, placeholder }) => (
  <div>
    <label className="label" htmlFor={name}>{label}</label>
    <input
      id={name} name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder || ""}
      className={`input-field ${errors?.[name] ? 'border-red-500/60' : ''}`}
    />
    {errors?.[name] && <p className="mt-1.5 text-xs text-red-400">{errors[name]}</p>}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Issue #6: removed username — form now only needs email + password
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const logoSrc = theme === 'warm' ? '/Resume_Forge_Warm.png' : '/Resume_Forge_Dark.png';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim())
      newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.password)
      newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      // Send only email + password — no username
      await api.post("/auth/register", { email: form.email, password: form.password });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(err?.response?.data?.message || "Registration failed. Please try again.");
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

        <div className="relative space-y-6">
          <h2 className="font-display font-bold text-4xl leading-tight page-title">
            Build your future,<br />
            <span className="text-gradient">one resume at a time.</span>
          </h2>
          <p className="font-body text-base leading-relaxed rf-text-muted">
            Join thousands of professionals who use ResumeForge to land their dream jobs with AI-powered, ATS-optimized resumes.
          </p>
          <div className="space-y-3">
            {['Free to get started', 'ATS score for every resume', 'PDF & DOCX export'].map((f) => (
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
            <h1 className="font-display font-bold text-3xl mb-2 page-title">Create your account</h1>
            <p className="font-body rf-text-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-forge-400 hover:text-forge-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {serverError && (
            <div className="mb-5 p-3 rounded-xl border text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Email Address" name="email" type="email"
              value={form.email} onChange={handleChange} errors={errors}
              placeholder="john@example.com" />
            <Field label="Password" name="password" type="password"
              value={form.password} onChange={handleChange} errors={errors}
              placeholder="Min. 6 characters" />
            <Field label="Confirm Password" name="confirmPassword" type="password"
              value={form.confirmPassword} onChange={handleChange} errors={errors}
              placeholder="Re-enter your password" />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}