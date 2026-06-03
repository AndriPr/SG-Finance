import React, { useState } from 'react';
import { Search, Bell, HelpCircle, X, User, Briefcase, Image as ImageIcon } from 'lucide-react';

import { useAppContext } from '../context/AppContext';

export default function Header() {
  const { 
    globalSearch, setGlobalSearch, 
    userProfile, setUserProfile,
    notifications, markNotificationRead, clearAllNotifications 
  } = useAppContext();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editProfile, setEditProfile] = useState(userProfile);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserProfile(editProfile);
    setShowProfile(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfile({...editProfile, avatar: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    if(window.confirm("Apakah Anda yakin ingin menghapus akun ini? Semua data sesi akan hilang.")) {
      // For this mock app, reloading resets the state completely and acts as logout/delete
      window.location.reload();
    }
  };

  return (
    <header style={headerStyle}>
      <div className="flex items-center" style={{flex: 1}}>
        <div className="desktop-only" style={searchContainerStyle}>
          <Search size={18} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Cari produk atau SKU..." 
            style={searchInputStyle}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
        <div className="mobile-only text-xl font-bold" style={{color: 'var(--color-primary)'}}>
          {userProfile.businessName || 'SG-Finance'}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <div style={{position: 'relative'}}>
          <button style={iconBtnStyle} onClick={() => setShowNotif(!showNotif)}>
            <Bell size={20} />
            {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
          </button>

          {showNotif && (
            <div style={notifDropdownStyle} className="card">
              <div style={notifHeaderStyle}>
                <h4 style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Notifikasi</h4>
                <button onClick={clearAllNotifications} style={{fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer'}}>Tandai Semua Dibaca</button>
              </div>
              <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                {notifications.length === 0 ? (
                  <p style={{padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Belum ada notifikasi.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={n.isRead ? notifItemReadStyle : notifItemUnreadStyle} onClick={() => markNotificationRead(n.id)}>
                      <p style={{fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.4}}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <button className="desktop-only" style={iconBtnStyle}>
          <HelpCircle size={20} />
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-2" style={userInfoStyle} onClick={() => { setEditProfile(userProfile); setShowProfile(true); }}>
          <div style={avatarStyle}>
            <img 
              src={userProfile.avatar} 
              alt="Profile" 
              style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
              onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile.businessName || 'Admin'); }}
            />
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showProfile && (
        <div style={modalOverlayStyle} onClick={() => setShowProfile(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>Personalisasi Akun</h3>
              <button onClick={() => setShowProfile(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={modalBodyStyle}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label style={labelStyle}><Briefcase size={14} style={{display: 'inline', marginRight: '4px'}}/> Nama Usaha</label>
                  <input type="text" style={inputStyle} value={editProfile.businessName || ''} onChange={e => setEditProfile({...editProfile, businessName: e.target.value})} required />
                </div>
                <div>
                  <label style={labelStyle}><ImageIcon size={14} style={{display: 'inline', marginRight: '4px'}}/> Foto Profil (URL atau Upload)</label>
                  <input type="url" placeholder="Masukkan URL Gambar..." style={{...inputStyle, marginBottom: '8px'}} value={editProfile.avatar || ''} onChange={e => setEditProfile({...editProfile, avatar: e.target.value})} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize: '0.875rem', width: '100%'}} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '8px', marginTop: '2rem', flexWrap: 'wrap'}}>
                <button type="button" style={{...outlineBtnStyle, color: 'var(--color-accent-red)', borderColor: '#fca5a5', padding: '0.75rem 1rem'}} onClick={handleDeleteAccount} title="Hapus Akun">
                  Hapus
                </button>
                <button type="button" style={{...outlineBtnStyle, flex: 1, padding: '0.75rem 1rem', textAlign: 'center'}} onClick={() => setShowProfile(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{flex: 2, padding: '0.75rem'}}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}

// Styles
const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.5rem',
  backgroundColor: 'var(--color-bg-card)',
  borderBottom: '1px solid var(--border-color)',
  position: 'sticky',
  top: 0,
  zIndex: 10
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'var(--color-bg-main)',
  padding: '0.5rem 1rem',
  borderRadius: '2rem',
  border: '1px solid var(--border-color)',
  width: '100%',
  maxWidth: '400px'
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  width: '100%',
  backgroundColor: 'transparent',
  fontSize: '0.875rem'
};

const iconBtnStyle = {
  position: 'relative',
  color: 'var(--color-text-main)',
  transition: 'color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const badgeStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  backgroundColor: 'var(--color-accent-red)',
  color: 'white',
  minWidth: '18px',
  height: '18px',
  padding: '0 4px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: 'bold',
};

const userInfoStyle = {
  cursor: 'pointer',
  paddingLeft: '0.5rem',
  borderLeft: '1px solid var(--border-color)',
  marginLeft: '0.5rem'
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-border)',
};

// Notification Styles
const notifDropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: '-60px',
  width: '320px',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  zIndex: 100,
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
  animation: 'popIn 0.2s ease-out forwards'
};

const notifHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: '#fafafa'
};

const notifItemUnreadStyle = {
  padding: '1rem',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: '#fef2f2',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const notifItemReadStyle = {
  padding: '1rem',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

// Modal Styles (Copied for Profile Settings)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem'
};

const modalContentStyle = {
  backgroundColor: 'white',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};

const modalHeaderStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const modalBodyStyle = {
  padding: '1.5rem',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  marginBottom: '0.5rem',
  fontWeight: '600'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: '#fafafa',
  fontSize: '0.875rem',
  outline: 'none'
};

const outlineBtnStyle = {
  padding: '0.75rem 1.5rem',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  backgroundColor: 'white',
  fontWeight: '600',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)',
  cursor: 'pointer'
};
