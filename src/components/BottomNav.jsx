import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Book, Package, ShoppingBag, FileText } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { name: 'Kasir', icon: <ShoppingCart size={24} />, path: '/pos' },
    { name: 'Buku', icon: <Book size={24} />, path: '/ledger' },
    { name: 'Stok', icon: <Package size={24} />, path: '/inventory' },
    { name: 'Beli', icon: <ShoppingBag size={24} />, path: '/purchases' },
    { name: 'Laporan', icon: <FileText size={24} />, path: '/reports' },
  ];

  return (
    <div className="mobile-only" style={bottomNavStyle}>
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          style={{ width: '100%', margin: '0 4px', padding: '8px 0' }}
        >
          {item.icon}
          <span style={{fontSize: '10px', marginTop: '4px', fontWeight: 500}}>{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
}

// Styles
const bottomNavStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'var(--color-bg-card)',
  borderTop: '1px solid var(--border-color)',
  justifyContent: 'space-around',
  padding: '8px 4px',
  zIndex: 50,
  boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
};
