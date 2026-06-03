import React, { useState } from 'react';
import { Search, Plus, Filter, FileText, CheckCircle, Clock, ShoppingBasket, Receipt, TrendingUp, ShoppingCart, ExternalLink, MoreVertical, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Purchases() {
  const { purchases, addPurchase, globalSearch, setGlobalSearch } = useAppContext();
  const search = globalSearch;
  const setSearch = setGlobalSearch;
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ supplier: '', amount: '' });

  const submitNewPurchase = (e) => {
    e.preventDefault();
    const amount = parseInt(newPurchase.amount, 10);
    if (isNaN(amount) || amount <= 0 || !newPurchase.supplier) return alert("Data tidak valid");

    addPurchase({ supplier: newPurchase.supplier, subtotal: amount });
    setShowAddModal(false);
    setNewPurchase({ supplier: '', amount: '' });
  };

  const filteredPurchases = purchases.filter(p => 
    p.supplier.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = purchases.length;
  const totalExpense = purchases.reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem'}}>
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Pembelian</h2>
        <p className="text-muted text-sm" style={{marginTop: '4px'}}>Kelola rantai pasokan dan pengeluaran pengadaan Anda.</p>
      </div>

      {/* Summary Cards */}
      <div style={summaryGridStyle} className="summary-grid">
        
        {/* Total Pembelian */}
        <div className="card" style={summaryCardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <p style={summaryLabelStyle}>TOTAL PEMBELIAN</p>
              <h3 style={summaryValueStyle}>{totalPurchases}</h3>
            </div>
            <div style={{...iconBoxStyle, backgroundColor: '#fae8e8', color: '#7f1d1d'}}>
              <ShoppingBasket size={24} />
            </div>
          </div>
          <p style={trendStyle}>
            <TrendingUp size={14} /> 
            {totalPurchases === 0 ? "Tidak ada aktivitas bulan ini" : "Berdasarkan catatan sistem"}
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="card" style={summaryCardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div>
              <p style={summaryLabelStyle}>TOTAL PENGELUARAN</p>
              <h3 style={summaryValueStyle}>Rp {totalExpense.toLocaleString('id-ID')}</h3>
            </div>
            <div style={{...iconBoxStyle, backgroundColor: '#ecfccb', color: '#3f6212'}}>
              <Receipt size={24} />
            </div>
          </div>
          <p style={trendStyle}>
            <Clock size={14} /> 
            {totalExpense === 0 ? "Menunggu entri pertama" : "Total pengeluaran valid"}
          </p>
        </div>

      </div>

      {/* Main Content Card */}
      <div className="card" style={{padding: '0', overflow: 'hidden'}}>
        
        {/* Card Header */}
        <div style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)'}}>
          <h3 style={{fontWeight: 'bold', fontSize: '1.125rem'}}>Riwayat Pembelian</h3>
          <button className="btn-primary flex items-center gap-2" style={{backgroundColor: 'var(--color-primary)'}} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Buat Pembelian Baru
          </button>
        </div>

        {/* Conditional Rendering: Empty State vs Table */}
        {purchases.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={emptyIconWrapperStyle}>
              <div style={emptyIconInnerStyle}>
                <ShoppingCart size={40} color="#fca5a5" />
                {/* A cross line to simulate "empty/no cart" */}
                <div style={strikeThroughStyle}></div>
              </div>
            </div>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Belum ada riwayat pembelian</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: '1.5'}}>
              Mulai catat transaksi pengadaan Anda untuk melacak inventaris dan mengelola biaya bisnis dengan akurat.
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center'}}>
              <button style={outlineBtnStyle}>Impor Data</button>
              <button style={linkBtnStyle}>
                Pelajari lebih lanjut tentang pembelian <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar (Only show if there are purchases) */}
            <div style={toolbarStyle}>
              <div style={searchContainerStyle}>
                <Search size={18} color="var(--color-text-muted)" />
                <input 
                  type="text" 
                  placeholder="Cari No. PO atau Supplier..." 
                  style={searchInputStyle} 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button style={filterBtnStyle}>
                <Filter size={16} /> Filter
              </button>
            </div>

            {/* Table */}
            <div style={tableContainerStyle}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#fafafa', borderBottom: '1px solid var(--border-color)', textAlign: 'left'}}>
                    <th style={thStyle}>ID Pesanan</th>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Supplier</th>
                    <th style={thStyle} className="text-right">Total</th>
                    <th style={thStyle} className="text-center">Status</th>
                    <th style={thStyle} className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((item, idx) => (
                    <tr key={idx} style={{borderBottom: '1px solid var(--border-color)', backgroundColor: 'white'}}>
                      <td style={{...tdStyle, fontWeight: '600'}}>{item.id}</td>
                      <td style={tdStyle}>{item.date}</td>
                      <td style={tdStyle}>{item.supplier}</td>
                      <td style={{...tdStyle, textAlign: 'right', fontWeight: '600'}}>Rp {item.total.toLocaleString('id-ID')}</td>
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        <span style={item.status === 'Selesai' ? statusSuccessStyle : statusPendingStyle}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>Buat Pembelian Baru</h3>
              <button onClick={() => setShowAddModal(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={submitNewPurchase} style={modalBodyStyle}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label style={labelStyle}>Nama Supplier</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Misal: PT. Distribusi Kopi" 
                    style={inputStyle}
                    value={newPurchase.supplier}
                    onChange={e => setNewPurchase({...newPurchase, supplier: e.target.value})}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Total Pembelian (Rp)</label>
                  <input 
                    type="number" 
                    onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    required 
                    placeholder="Misal: 2500000" 
                    style={inputStyle}
                    value={newPurchase.amount}
                    onChange={e => setNewPurchase({...newPurchase, amount: e.target.value})}
                  />
                  <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px'}}>
                    *Belum termasuk PPN 11%
                  </p>
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button type="button" style={{...outlineBtnStyle, flex: 1, justifyContent: 'center'}} onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{flex: 1, padding: '0.75rem'}}>
                  Simpan Pembelian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Styles
const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem'
};

const summaryCardStyle = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
};

const summaryLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  marginBottom: '0.5rem'
};

const summaryValueStyle = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: 'var(--color-text-main)',
  lineHeight: '1'
};

const iconBoxStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const trendStyle = {
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '1.5rem',
  fontWeight: '500'
};

const emptyStateStyle = {
  padding: '5rem 2rem',
  textAlign: 'center',
  backgroundColor: 'white'
};

const emptyIconWrapperStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '2px dashed #d1d5db',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.5rem auto'
};

const emptyIconInnerStyle = {
  width: '80px',
  height: '80px',
  backgroundColor: '#fef2f2',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
};

const strikeThroughStyle = {
  position: 'absolute',
  width: '4px',
  height: '50px',
  backgroundColor: '#f87171',
  transform: 'rotate(45deg)',
  borderRadius: '2px'
};

const outlineBtnStyle = {
  padding: '0.5rem 1.25rem',
  border: '1px solid var(--border-color)',
  borderRadius: '24px',
  backgroundColor: 'white',
  fontWeight: '600',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)',
  cursor: 'pointer'
};

const linkBtnStyle = {
  padding: '0.5rem 1rem',
  background: 'none',
  border: 'none',
  fontWeight: '600',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const toolbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.5rem',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: '#fafafa',
  flexWrap: 'wrap',
  gap: '1rem'
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  flex: 1,
  maxWidth: '400px'
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  width: '100%',
  fontSize: '0.875rem'
};

const filterBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'white',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--color-text-main)'
};

const tableContainerStyle = {
  overflowX: 'auto',
  width: '100%'
};

const thStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  fontWeight: '600',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)',
  whiteSpace: 'nowrap'
};

const statusSuccessStyle = {
  display: 'inline-block',
  backgroundColor: '#ecfccb',
  color: '#3f6212',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600'
};

const statusPendingStyle = {
  display: 'inline-block',
  backgroundColor: '#fef3c7',
  color: '#b45309',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600'
};

// Modal Styles
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
  maxWidth: '450px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
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
  backgroundColor: 'white',
  fontSize: '0.875rem',
  outline: 'none'
};
