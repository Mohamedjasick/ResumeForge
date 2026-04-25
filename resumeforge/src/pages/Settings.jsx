import { useState, useEffect, useCallback } from "react";
import { useToast } from "../components/Toast";
import { useTheme } from "../contexts/ThemeContext";

// ── icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const UserIcon    = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const LockIcon    = () => <Icon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />;
const PaletteIcon = () => <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h4M18 12h4M12 2v4M12 18v4" />;
const BellIcon    = () => <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />;
const TypeIcon    = () => <Icon d="M4 7V4h16v3M9 20h6M12 4v16" />;
const TrashIcon   = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const SunIcon     = () => <Icon d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />;
const MoonIcon    = () => <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
const SystemIcon  = () => <Icon d="M2 3h20v14H2zM8 21h8M12 17v4" />;

// ── theme palettes ────────────────────────────────────────────────────────────
const WARM = {
  pageBg:     "#F2EDE4", cardBg:     "#FFFDF8", cardBorder: "#DDD4C5",
  accent:     "#B06A2A", accentHov:  "#8F521E", accentBg:   "#FDF3E7",
  text:       "#2E1F0F", textMid:    "#6B5240", textMuted:  "#9E8776",
  inputBg:    "#FBF8F4", inputBdr:   "#CEC3B5",
  dangerBg:   "#FDF2F2", dangerBdr:  "#E8C4C4", dangerTxt:  "#922B2B",
  dangerBtn:  "#C0392B", dangerHov:  "#962d22",
  divider:    "#EDE5D8", toggleOn:   "#B06A2A", toggleOff:  "#D4C9BA",
  sectionHd:  "#3D2B1A", saveBtnTxt: "#FFF9F2",
  statusBg:   "#FDF3E7", statusBdr:  "#DDD4C5", statusTxt:  "#B06A2A",
};

const DARK = {
  pageBg:     "#0f0f17", cardBg:     "#1a1a28", cardBorder: "#2e2e45",
  accent:     "#6272f5", accentHov:  "#4c52e8", accentBg:   "#1c1e4f",
  text:       "#e8e8f0", textMid:    "#b6b6c1", textMuted:  "#717183",
  inputBg:    "#111118", inputBdr:   "#2e2e45",
  dangerBg:   "#1a0f0f", dangerBdr:  "#4a1f1f", dangerTxt:  "#f87171",
  dangerBtn:  "#c0392b", dangerHov:  "#962d22",
  divider:    "#2e2e45", toggleOn:   "#6272f5", toggleOff:  "#40404c",
  sectionHd:  "#e8e8f0", saveBtnTxt: "#ffffff",
  statusBg:   "#1c1e4f", statusBdr:  "#3337a4", statusTxt:  "#a5bcfd",
};

function getPalette(theme) {
  if (theme === "dark") return DARK;
  if (theme === "warm") return WARM;
  if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) return DARK;
  return WARM;
}

// ── localStorage key for font preference ─────────────────────────────────────
const FONT_KEY = "rf_resume_font";

// ── sub-components ────────────────────────────────────────────────────────────
const Section = ({ icon, title, children, s }) => (
  <div style={{ background: s.cardBg, border: `1px solid ${s.cardBorder}`,
    borderRadius: 16, padding: "1.75rem 2rem", marginBottom: "1.25rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
      <span style={{ color: s.accent }}>{icon}</span>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: s.sectionHd,
        fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, type = "text", value, onChange, placeholder, helper, s }) => (
  <div style={{ marginBottom: "1.1rem" }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: s.textMid,
      letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6,
      fontFamily: "'Inter', system-ui, sans-serif" }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 14px", background: s.inputBg,
        border: `1px solid ${s.inputBdr}`, borderRadius: 10, fontSize: 14,
        color: s.text, outline: "none", fontFamily: "'Inter', system-ui, sans-serif",
        transition: "border-color .2s, box-shadow .2s" }}
      onFocus={e => { e.target.style.borderColor = s.accent; e.target.style.boxShadow = `0 0 0 3px ${s.accentBg}`; }}
      onBlur={e  => { e.target.style.borderColor = s.inputBdr; e.target.style.boxShadow = "none"; }}
    />
    {helper && <p style={{ fontSize: 12, color: s.textMuted, marginTop: 5,
      fontFamily: "'Inter', system-ui, sans-serif" }}>{helper}</p>}
  </div>
);

const SaveBtn = ({ onClick, label = "Save changes", s }) => (
  <button onClick={onClick}
    style={{ marginTop: 8, padding: "10px 22px", background: s.accent,
      color: s.saveBtnTxt, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
      cursor: "pointer", transition: "background .2s",
      fontFamily: "'Inter', system-ui, sans-serif" }}
    onMouseEnter={e => e.currentTarget.style.background = s.accentHov}
    onMouseLeave={e => e.currentTarget.style.background = s.accent}
  >{label}</button>
);

const Toggle = ({ checked, onChange, label, sub, s }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 0", borderBottom: `1px solid ${s.divider}` }}>
    <div>
      <p style={{ fontSize: 14, fontWeight: 500, color: s.text, marginBottom: 2,
        fontFamily: "'Inter', system-ui, sans-serif" }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: s.textMuted,
        fontFamily: "'Inter', system-ui, sans-serif" }}>{sub}</p>}
    </div>
    <div onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        position: "relative", background: checked ? s.toggleOn : s.toggleOff,
        transition: "background .25s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left .25s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  </div>
);

const ThemePill = ({ icon, label, value, current, onSelect, s }) => {
  const active = current === value;
  return (
    <button onClick={() => onSelect(value)} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
      borderRadius: 10,
      border: active ? `2px solid ${s.accent}` : `1px solid ${s.cardBorder}`,
      background: active ? s.accentBg : s.inputBg,
      cursor: "pointer", fontSize: 14,
      fontWeight: active ? 600 : 400,
      color: active ? s.accent : s.textMid,
      transition: "all .2s", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {icon} {label}
    </button>
  );
};

const FontCard = ({ name, sample, value, current, onSelect, s }) => {
  const active = current === value;
  return (
    <div onClick={() => onSelect(value)} style={{
      border: active ? `2px solid ${s.accent}` : `1px solid ${s.cardBorder}`,
      borderRadius: 12, padding: "14px 16px", cursor: "pointer",
      background: active ? s.accentBg : s.inputBg, transition: "all .2s" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: active ? s.accent : s.textMuted,
        marginBottom: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>{name}</p>
      <p style={{ fontFamily: value, fontSize: 18, color: s.text, lineHeight: 1.3 }}>{sample}</p>
    </div>
  );
};

// ── font list — value is the key sent to backend ──────────────────────────────
const FONTS = [
  { name: "Georgia",           value: "georgia",           cssFamily: "'Georgia', serif",           sample: "Aa — Classic Resume"   },
  { name: "Playfair",          value: "playfair",          cssFamily: "'Playfair Display', serif",  sample: "Aa — Elegant Resume"   },
  { name: "Lato",              value: "lato",              cssFamily: "'Lato', sans-serif",         sample: "Aa — Clean Resume"     },
  { name: "Merriweather",      value: "merriweather",      cssFamily: "'Merriweather', serif",      sample: "Aa — Editorial Resume" },
  { name: "Nunito",            value: "nunito",            cssFamily: "'Nunito', sans-serif",       sample: "Aa — Modern Resume"    },
  { name: "Libre Baskerville", value: "libre_baskerville", cssFamily: "'Libre Baskerville', serif", sample: "Aa — Professional"     },
];

// ── main component ────────────────────────────────────────────────────────────
export default function Settings() {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [s, setS] = useState(() => getPalette(theme));

  useEffect(() => { setS(getPalette(theme)); }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setS(getPalette("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const [email, setEmail]             = useState(localStorage.getItem("email") || "");
  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [notifs, setNotifs] = useState({
    resumeReady: true, versionSaved: true, tips: false, weeklyDigest: false,
  });

  // ── Font: load from localStorage on mount, default to georgia ────────────
  const [font, setFont] = useState(
    () => localStorage.getItem(FONT_KEY) || "georgia"
  );

  // ── Save font to localStorage whenever it changes ─────────────────────────
  const handleFontSelect = (value, name) => {
    setFont(value);
    localStorage.setItem(FONT_KEY, value);
    addToast(`Font set to ${name}. Your next export will use this font.`, "success");
  };

  const handleThemeChange = useCallback((t) => {
    setTheme(t);
    const labels = { warm: "Warm & Soft", dark: "Dark", system: "System default" };
    addToast(`Theme changed to ${labels[t]}.`, "success");
  }, [setTheme, addToast]);

  const handleSaveAccount = () => {
    if (!email.includes("@")) return addToast("Enter a valid email.", "error");
    addToast("Account details updated.", "success");
  };

  const handleSavePassword = () => {
    if (!currentPwd)           return addToast("Enter your current password.", "error");
    if (newPwd.length < 6)     return addToast("New password must be 6+ characters.", "error");
    if (newPwd !== confirmPwd) return addToast("Passwords don't match.", "error");
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    addToast("Password changed successfully.", "success");
  };

  const handleDeleteAccount = () => {
    if (deleteInput !== "DELETE") return addToast("Type DELETE to confirm.", "error");
    addToast("Account deletion requested.", "error");
  };

  // current font's cssFamily for preview
  const currentCssFamily = FONTS.find(f => f.value === font)?.cssFamily || "'Georgia', serif";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem",
      background: s.pageBg, minHeight: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "background 0.3s ease, color 0.3s ease" }}>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Lato:wght@400;700&family=Merriweather&family=Nunito&family=Libre+Baskerville&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: s.text, marginBottom: 4,
          fontFamily: "'Playfair Display', Georgia, serif" }}>Settings</h1>
        <p style={{ fontSize: 14, color: s.textMuted }}>
          Manage your account, preferences and resume defaults.
        </p>
      </div>

      {/* 1. Account */}
      <Section icon={<UserIcon />} title="Account" s={s}>
        <Field label="Email address" type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" s={s} />
        <SaveBtn onClick={handleSaveAccount} s={s} />
      </Section>

      {/* 2. Password */}
      <Section icon={<LockIcon />} title="Password" s={s}>
        <Field label="Current password" type="password" value={currentPwd}
          onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" s={s} />
        <Field label="New password" type="password" value={newPwd}
          onChange={e => setNewPwd(e.target.value)} placeholder="Min. 6 characters" s={s} />
        <Field label="Confirm new password" type="password" value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
          placeholder="Re-enter new password"
          helper="Your password must be at least 6 characters long." s={s} />
        <SaveBtn onClick={handleSavePassword} label="Update password" s={s} />
      </Section>

      {/* 3. Theme */}
      <Section icon={<PaletteIcon />} title="Theme" s={s}>
        <p style={{ fontSize: 13, color: s.textMuted, marginBottom: 14 }}>
          Choose how ResumeForge looks for you.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ThemePill icon={<SunIcon />}    label="Warm & Soft" value="warm"   current={theme} onSelect={handleThemeChange} s={s} />
          <ThemePill icon={<MoonIcon />}   label="Dark"        value="dark"   current={theme} onSelect={handleThemeChange} s={s} />
          <ThemePill icon={<SystemIcon />} label="System"      value="system" current={theme} onSelect={handleThemeChange} s={s} />
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: s.statusBg,
          borderRadius: 10, border: `1px solid ${s.statusBdr}` }}>
          <p style={{ fontSize: 13, color: s.statusTxt, fontWeight: 500 }}>
            {theme === "warm"   && "☀️ Warm & Soft theme is active — cream and beige tones applied."}
            {theme === "dark"   && "🌙 Dark theme is active."}
            {theme === "system" && "🖥️ Using your system's preferred color scheme."}
          </p>
        </div>
      </Section>

      {/* 4. Notifications */}
      <Section icon={<BellIcon />} title="Notification preferences" s={s}>
        <Toggle checked={notifs.resumeReady}  onChange={v => setNotifs(n => ({ ...n, resumeReady: v }))}
          label="Resume ready"       sub="Get notified when your resume is generated." s={s} />
        <Toggle checked={notifs.versionSaved} onChange={v => setNotifs(n => ({ ...n, versionSaved: v }))}
          label="Version saved"      sub="Alert when a new resume version is saved." s={s} />
        <Toggle checked={notifs.tips}         onChange={v => setNotifs(n => ({ ...n, tips: v }))}
          label="Tips & suggestions" sub="Receive AI-powered tips to improve your resume." s={s} />
        <Toggle checked={notifs.weeklyDigest} onChange={v => setNotifs(n => ({ ...n, weeklyDigest: v }))}
          label="Weekly digest"      sub="A summary of your resume activity each week." s={s} />
        <SaveBtn onClick={() => addToast("Notification preferences saved.", "success")}
          label="Save preferences" s={s} />
      </Section>

      {/* 5. Font */}
      <Section icon={<TypeIcon />} title="Resume font style" s={s}>
        <p style={{ fontSize: 13, color: s.textMuted, marginBottom: 14 }}>
          Choose the default font used when your resume is exported as PDF or DOCX.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
          {FONTS.map(f => (
            <FontCard
              key={f.value}
              name={f.name}
              sample={f.sample}
              value={f.cssFamily}
              current={currentCssFamily}
              onSelect={() => handleFontSelect(f.value, f.name)}
              s={s}
            />
          ))}
        </div>
        {/* Current font indicator */}
        <div style={{ marginTop: 12, padding: "10px 14px", background: s.statusBg,
          borderRadius: 10, border: `1px solid ${s.statusBdr}` }}>
          <p style={{ fontSize: 13, color: s.statusTxt, fontWeight: 500 }}>
            ✏️ Current font: <span style={{ fontFamily: currentCssFamily }}>{FONTS.find(f => f.value === font)?.name || "Georgia"}</span> — will be applied to your next PDF/DOCX export.
          </p>
        </div>
      </Section>

      {/* 6. Danger zone */}
      <div style={{ background: s.dangerBg, border: `1px solid ${s.dangerBdr}`,
        borderRadius: 16, padding: "1.75rem 2rem", marginBottom: "2rem",
        transition: "background 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <span style={{ color: s.dangerTxt }}><TrashIcon /></span>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: s.dangerTxt,
            fontFamily: "'Playfair Display', Georgia, serif" }}>Danger zone</h2>
        </div>
        <p style={{ fontSize: 14, color: s.dangerTxt, marginBottom: "1rem", lineHeight: 1.6,
          opacity: 0.85, fontFamily: "'Inter', system-ui, sans-serif" }}>
          Permanently delete your account and all associated data — resumes, versions,
          skills, experience, and projects.{" "}
          <strong>This action cannot be undone.</strong>
        </p>
        <Field label='Type "DELETE" to confirm' value={deleteInput}
          onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE" s={s} />
        <button onClick={handleDeleteAccount}
          style={{ marginTop: 4, padding: "10px 22px", background: s.dangerBtn,
            color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: "pointer", transition: "background .2s",
            fontFamily: "'Inter', system-ui, sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = s.dangerHov}
          onMouseLeave={e => e.currentTarget.style.background = s.dangerBtn}
        >Delete my account</button>
      </div>

    </div>
  );
}