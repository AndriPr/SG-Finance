import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Book, Package, ShoppingBag, HelpCircle, LogOut, Wallet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const { userProfile } = useAppContext();

  const menuItems = [
    { name: 'Kasir (POS)', icon: <ShoppingCart size={20} />, path: '/pos' },
    { name: 'Buku Besar', icon: <Book size={20} />, path: '/ledger' },
    { name: 'Inventaris', icon: <Package size={20} />, path: '/inventory' },
    { name: 'Pembelian', icon: <ShoppingBag size={20} />, path: '/purchases' },
    { name: 'Laporan', icon: <LayoutDashboard size={20} />, path: '/reports' }
  ];

  const handleLogout = () => {
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <div className="desktop-only" style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={logoIconStyle}>
          <Wallet size={24} color="white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{color: 'var(--color-primary)'}}>{userProfile?.businessName || 'SG-Finance'}</h2>
          <p style={{fontSize: '12px', color: 'var(--color-text-muted)'}}>Solusi ERP Premium</p>
        </div>
      </div>

      <div style={menuContainerStyle}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="sidebar-item"
            style={({ isActive }) => ({
              ...menuItemStyle,
              ...(isActive ? activeMenuItemStyle : {})
            })}
          >
            <span style={{opacity: 0.9}}>{item.icon}</span>
            <span style={{fontWeight: 500}}>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div style={footerStyle}>
        <NavLink to="/help" className="sidebar-item" style={menuItemStyle}>
          <span style={{opacity: 0.9}}><HelpCircle size={20} /></span>
          <span style={{fontWeight: 500}}>Bantuan</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-item" style={{...menuItemStyle, color: 'var(--color-accent-red)', width: '100%', border: 'none', background: 'none'}}>
          <span style={{opacity: 0.9}}><LogOut size={20} /></span>
          <span style={{fontWeight: 500}}>Keluar</span>
        </button>
      </div>
    </div>
  );
}

// Styles
const sidebarStyle = {
  width: '220px',
  backgroundColor: 'var(--color-bg-sidebar)',
  color: 'var(--color-text-main)',
  flexDirection: 'column',
  height: '100%',
  borderRight: '1px solid var(--border-color)',
};

const headerStyle = {
  padding: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const logoIconStyle = {
  backgroundColor: 'var(--color-primary)',
  padding: '8px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const menuContainerStyle = {
  padding: '1rem 0',
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 18px',
  color: 'var(--color-text-main)',
  textDecoration: 'none',
  fontWeight: '600',
  gap: '12px',
  transition: 'all 0.2s ease',
  borderRight: '4px solid transparent'
};

const activeMenuItemStyle = {
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  borderRight: '4px solid var(--color-primary)',
  borderRadius: '8px',
  fontWeight: '600'
};

const footerStyle = {
  padding: '1rem 0',
  borderTop: '1px solid var(--border-color)'
};
