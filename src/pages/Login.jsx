import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


const styles = {
  root: {
    fontFamily: "'Segoe UI Emoji', 'Segoe UI', sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#F5F5F5",
  },
  navbar: {
    background: "#0D2137",
    padding: "0 28px",
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
    borderBottom: "1px solid rgba(74,168,232,0.15)",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  navIconSvg: {
    display: "flex",
    alignItems: "center",
  },
  navBrandText: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  navBrandPezao: { color: "#fff" },
  navBrandSound: { color: "#4AA8E8" },
  navLinks: {
    display: "flex",
    gap: 0,
    listStyle: "none",
    margin: 0,
    padding: 0,
    height: "100%",
    alignItems: "stretch",
  },
  navLinkItem: { display: "flex", alignItems: "center" },
  navLink: {
    color: "rgba(255,255,255,0.72)",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 0.2,
    cursor: "pointer",
    padding: "0 18px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    borderBottom: "2px solid transparent",
    transition: "color .2s, border-color .2s",
    whiteSpace: "nowrap",
  },
  navLinkActive: {
    color: "#4AA8E8",
    borderBottom: "2px solid #4AA8E8",
  },
  body: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(13,33,55,0.10)",
    width: "100%",
    maxWidth: 380,
    padding: "40px 40px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 4px",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#888",
    margin: "0 0 28px",
    letterSpacing: 0.1,
  },
  formGroup: { width: "100%", marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #dde3ea",
    borderRadius: 7,
    fontSize: 14,
    color: "#333",
    background: "#fafbfc",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
  },
  inputFocus: {
    borderColor: "#2DBAE1",
    boxShadow: "0 0 0 3px rgba(45,186,225,0.15)",
    background: "#fff",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2DBAE1",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: 0.3,
    marginTop: 4,
    marginBottom: 18,
    transition: "background .2s, transform .1s, box-shadow .2s",
    fontFamily: "inherit",
    boxShadow: "0 3px 12px rgba(45,186,225,0.30)",
  },
  buttonHover: {
    background: "#1ea8cf",
    boxShadow: "0 5px 18px rgba(45,186,225,0.40)",
    transform: "translateY(-1px)",
  },
  forgotLink: {
    color: "#1C8BC0",
    fontSize: 13.5,
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 500,
    transition: "color .2s",
    marginBottom: 24,
    display: "block",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    background: "#eaecef",
    margin: "4px 0 16px",
  },
  footer: {
    fontSize: 11.5,
    color: "#737373",
    textAlign: "center",
    letterSpacing: 0.1,
  },
};

const CardLogo = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="logo_shadow" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.15"/>
      </filter>
    </defs>
    <circle cx="36" cy="36" r="36" fill="#2DBAE1" filter="url(#logo_shadow)"/>
    <g transform="translate(18, 18)">
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <path d="M15 30V8.33333L35 5V26.6667" stroke="white" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 35C12.7614 35 15 32.7614 15 30C15 27.2386 12.7614 25 10 25C7.23858 25 5 27.2386 5 30C5 32.7614 7.23858 35 10 35Z" stroke="white" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 31.6667C32.7614 31.6667 35 29.4281 35 26.6667C35 23.9052 32.7614 21.6667 30 21.6667C27.2386 21.6667 25 23.9052 25 26.6667C25 29.4281 27.2386 31.6667 30 31.6667Z" stroke="white" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </g>
  </svg>
);

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [forgotHover, setForgotHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, senha)
    navigate('/produtos')
  };

  return (
    <div style={styles.root}>
      <div style={styles.body}>
        <div style={styles.card}>
          <div style={{ marginBottom: 16 }}>
            <CardLogo />
          </div>

          <h1 style={styles.title}>Pezão Sound</h1>
          <p style={styles.subtitle}>Sistema de Gerenciamento de Estoque</p>

          <div style={{ width: "100%" }}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                style={{ ...styles.input, ...(emailFocus ? styles.inputFocus : {}) }}
                autoComplete="email"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                style={{ ...styles.input, ...(passFocus ? styles.inputFocus : {}) }}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p style={{ color: "#e05252", fontSize: 12.5, margin: "-6px 0 10px" }}>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              disabled={loading}
              style={{
                ...styles.button,
                ...(btnHover && !loading ? styles.buttonHover : {}),
                ...(loading ? { opacity: 0.75, cursor: "not-allowed" } : {}),
              }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>

          <a
            href="#"
            style={{ ...styles.forgotLink, color: forgotHover ? "#147aa8" : "#1C8BC0" }}
            onMouseEnter={() => setForgotHover(true)}
            onMouseLeave={() => setForgotHover(false)}
          >
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
}
