import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Info, Wallet } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy login logic
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle} className="card">
        {/* Logo/Icon Area */}
        <div style={logoContainerStyle}>
          <div style={iconBoxStyle}>
            <Wallet size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center" style={{color: 'var(--color-primary-dark)', marginBottom: '0.5rem'}}>
          SG-Finance
        </h1>
        <p className="text-center text-muted" style={{fontSize: '0.875rem', marginBottom: '2rem'}}>
          Solusi ERP Premium
        </p>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
          <div className="input-group">
            <label style={labelStyle}><Mail size={16} /> Email</label>
            <input 
              type="email" 
              placeholder="admin@sgfinance.com" 
              style={inputStyle}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label style={labelStyle}><Lock size={16} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={inputStyle}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary flex items-center justify-center gap-2" style={{width: '100%', marginTop: '0.5rem'}}>
            <LogIn size={18} /> Masuk
          </button>
        </form>

        <div style={dividerStyle}>
          <span style={dividerTextStyle}>atau</span>
        </div>

        <button className="flex items-center justify-center gap-2" style={outlineBtnStyle}>
          <UserPlus size={18} /> Buat Akun Baru
        </button>

        <div style={infoContainerStyle}>
          <Info size={14} />
          <span>Default: admin@sgfinance.com / admin123</span>
        </div>

        <p className="text-center text-muted" style={{fontSize: '0.75rem', marginTop: '1.5rem'}}>
          © 2024 SG-Finance v2.0
        </p>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-bg-main)',
  // Decorative background pattern based on PPT
  backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  padding: '1rem'
};

const loginCardStyle = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: 'white',
  padding: '2.5rem 2rem',
  borderRadius: '1.5rem',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

const logoContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '1.5rem'
};

const iconBoxStyle = {
  width: '64px',
  height: '64px',
  backgroundColor: 'var(--color-primary)',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  boxShadow: '0 4px 14px rgba(74, 53, 47, 0.3)'
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--color-primary-dark)',
  marginBottom: '0.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border-color)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#f8fafc'
};

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  margin: '1.5rem 0',
  position: 'relative'
};

const dividerTextStyle = {
  padding: '0 10px',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  backgroundColor: 'white',
  position: 'relative',
  zIndex: 1,
  margin: '0 auto',
};

const outlineBtnStyle = {
  width: '100%',
  padding: '0.75rem 1.5rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  fontWeight: '600',
  backgroundColor: 'transparent',
  transition: 'all 0.2s ease',
  cursor: 'pointer'
};

const infoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  marginTop: '1.5rem',
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)'
};
