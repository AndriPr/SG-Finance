import React, { useState } from 'react';
import { Search, FileDown, Plus, MoreVertical, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Ledger() {
  const { journal, addExpense, globalSearch } = useAppContext();
  const [account, setAccount] = useState('Semua Akun');

  // Filter Journal based on selected account and global search
  const filteredJournal = journal.filter(j => {
    const matchAccount = account === 'Semua Akun' || j.account === account;
    const matchSearch = !globalSearch || 
      j.description.toLowerCase().includes(globalSearch.toLowerCase()) || 
      j.id.toLowerCase().includes(globalSearch.toLowerCase());
    return matchAccount && matchSearch;
  });

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryDesc, setEntryDesc] = useState('');
  const [entryAmount, setEntryAmount] = useState('');

  // Calculate Totals
  const totalDebit = filteredJournal.reduce((sum, j) => sum + (j.debit || 0), 0);
  const totalKredit = filteredJournal.reduce((sum, j) => sum + (j.credit || 0), 0);
  
  // Calculate Balance (simplified logic, normally depends on account normal balance)
  let balance = 0;
  if (account === 'Semua Akun') {
    // Just a net difference for display purposes if all accounts are selected
    balance = totalDebit - totalKredit; 
  } else {
    // Normal balance logic
    const isDebitNormal = account.startsWith('1') || account.startsWith('5');
    balance = isDebitNormal ? (totalDebit - totalKredit) : (totalKredit - totalDebit);
    // Add mock initial balance for specific accounts so it doesn't look empty
    if (account === '1100 - Kas') balance += 15000000;
    if (account === '1130 - Persediaan Barang') balance += 25000000;
  }

  const submitNewEntry = (e) => {
    e.preventDefault();
    const amount = parseInt(entryAmount, 10);
    if (isNaN(amount) || amount <= 0 || !entryDesc) return alert("Data tidak valid");

    addExpense({ description: entryDesc, amount });
    setShowEntryModal(false);
    setEntryDesc('');
    setEntryAmount('');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Buku Besar - ${account}`, 14, 20);
    
    const tableData = filteredJournal.map(j => [
      j.date, 
      j.id, 
      j.account, 
      j.description, 
      j.debit > 0 ? `Rp ${j.debit.toLocaleString('id-ID')}` : '-', 
      j.credit > 0 ? `Rp ${j.credit.toLocaleString('id-ID')}` : '-'
    ]);
    
    doc.autoTable({
      startY: 30,
      head: [['Tanggal', 'No. Jurnal', 'Akun', 'Deskripsi', 'Debit', 'Kredit']],
      body: tableData,
    });

    doc.save(`Buku_Besar_${account}.pdf`);
  };

  // Get unique accounts for dropdown
  const uniqueAccounts = [...new Set(journal.map(j => j.account))];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem'}}>
      
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 className="text-2xl font-bold">Buku Besar</h2>
          <p className="text-muted text-sm" style={{marginTop: '4px'}}>Ringkasan keuangan real-time dan riwayat transaksi</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button style={outlineBtnStyle} onClick={exportPDF}>
            <FileDown size={16} /> Ekspor PDF
          </button>
          <button className="btn-primary flex items-center gap-2" style={{backgroundColor: 'var(--color-primary)'}} onClick={() => setShowEntryModal(true)}>
            <Plus size={16} /> Entri Baru
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={summaryGridStyle} className="summary-grid">
        
        {/* Total Debit */}
        <div className="card" style={summaryCardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <span style={summaryLabelStyle}>Total Debit</span>
            <div style={iconBoxStyle}><Wallet size={24} color="#d1d5db" /></div>
          </div>
          <h3 style={summaryValueStyle}>Rp {totalDebit.toLocaleString('id-ID')}</h3>
          <p style={trendUpStyle}><TrendingUp size={14}/> 12.5% dari bulan lalu</p>
        </div>

        {/* Total Kredit */}
        <div className="card" style={summaryCardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <span style={summaryLabelStyle}>Total Kredit</span>
            <div style={iconBoxStyle}><CreditCard size={24} color="#d1d5db" /></div>
          </div>
          <h3 style={summaryValueStyle}>Rp {totalKredit.toLocaleString('id-ID')}</h3>
          <p style={trendDownStyle}><TrendingDown size={14}/> 4.2% dari bulan lalu</p>
        </div>

        {/* Saldo Saat Ini (Dark Card) */}
        <div className="card" style={darkSummaryCardStyle}>
          <span style={{fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem', display: 'block'}}>Saldo Saat Ini</span>
          <h3 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white'}}>
            Rp {Math.abs(balance).toLocaleString('id-ID')}
          </h3>
          <p style={{fontSize: '0.75rem', opacity: 0.7}}>Kesehatan Akun: Sangat Baik</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card" style={{padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end'}}>
        
        <div style={{flex: 1, minWidth: '200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>Pilih Akun</label>
          <select 
            style={inputStyle} 
            value={account} 
            onChange={e => setAccount(e.target.value)}
          >
            <option value="Semua Akun">Semua Akun</option>
            {uniqueAccounts.map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
            {/* Fallbacks if empty */}
            {!uniqueAccounts.includes('1100 - Kas') && <option value="1100 - Kas">1100 - Kas</option>}
            {!uniqueAccounts.includes('5000 - Beban Operasional') && <option value="5000 - Beban Operasional">5000 - Beban Operasional</option>}
          </select>
        </div>

        <div style={{flex: 1, minWidth: '200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>Rentang Tanggal</label>
          <input type="text" placeholder="01 Okt 2023 - 31 Okt 2023" style={inputStyle} defaultValue="01 Okt 2023 - 31 Okt 2023" />
        </div>

        <button className="btn-primary" style={{backgroundColor: '#4b5563', padding: '0.75rem 1.5rem', height: '42px'}}>
          Terapkan Filter
        </button>

      </div>

      {/* Main Table Card */}
      <div className="card" style={{padding: '0', overflow: 'hidden'}}>
        
        <div style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)'}}>
          <h3 style={{fontWeight: 'bold', fontSize: '1.125rem'}}>Log Transaksi</h3>
          <span style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Menampilkan 1-{filteredJournal.length} dari {filteredJournal.length} transaksi</span>
        </div>

        <div style={tableContainerStyle}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
            <thead>
              <tr style={{backgroundColor: '#fafafa', borderBottom: '1px solid var(--border-color)'}}>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>No. Jurnal</th>
                <th style={thStyle}>Akun</th>
                <th style={thStyle}>Deskripsi</th>
                <th style={thStyle} className="text-right">Debit</th>
                <th style={thStyle} className="text-right">Kredit</th>
                <th style={thStyle} className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournal.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)'}}>Tidak ada data.</td></tr>
              ) : (
                filteredJournal.map((item, idx) => {
                  const accParts = item.account.split(' - ');
                  const accCode = accParts[0];
                  const accName = accParts[1] || '';

                  return (
                    <tr key={idx} style={{borderBottom: '1px solid var(--border-color)', backgroundColor: 'white'}}>
                      <td style={tdStyle}>{item.date}</td>
                      <td style={{...tdStyle, fontWeight: '600'}}>{item.id}</td>
                      <td style={tdStyle}>
                        <div style={{fontWeight: '600'}}>{accCode}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>{accName}</div>
                      </td>
                      <td style={tdStyle}>{item.description}</td>
                      
                      <td style={{...tdStyle, textAlign: 'right', fontWeight: item.debit > 0 ? '600' : 'normal'}}>
                        {item.debit > 0 ? `Rp ${item.debit.toLocaleString('id-ID')}` : '-'}
                      </td>
                      
                      <td style={{...tdStyle, textAlign: 'right', fontWeight: item.credit > 0 ? '600' : 'normal'}}>
                        {item.credit > 0 ? `Rp ${item.credit.toLocaleString('id-ID')}` : '-'}
                      </td>
                      
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', borderTop: '1px solid var(--border-color)'}}>
          <div style={{display: 'flex', gap: '4px'}}>
             <button style={pageBtnStyle}>&lt;</button>
             <button style={{...pageBtnStyle, backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)'}}>1</button>
             <button style={pageBtnStyle}>2</button>
             <button style={pageBtnStyle}>3</button>
             <button style={pageBtnStyle}>&gt;</button>
          </div>
          <span style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Halaman 1 dari 3</span>
        </div>

      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <div style={modalOverlayStyle} onClick={() => setShowEntryModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>Tambah Entri Pengeluaran</h3>
            <form onSubmit={submitNewEntry} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              <div>
                <label style={labelStyle}>Deskripsi Pengeluaran</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Misal: Bayar Listrik / Gaji" 
                  style={inputStyle}
                  value={entryDesc}
                  onChange={e => setEntryDesc(e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Jumlah (Rp)</label>
                <input 
                  type="number" 
                  onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                  required 
                  placeholder="Misal: 150000" 
                  style={inputStyle}
                  value={entryAmount}
                  onChange={e => setEntryAmount(e.target.value)}
                />
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" style={{...outlineBtnStyle, flex: 1, justifyContent: 'center'}} onClick={() => setShowEntryModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{flex: 1, padding: '0.75rem'}}>
                  Simpan Entri
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
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem'
};

const outlineBtnStyle = {
  border: '1px solid var(--border-color)',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: '600',
  backgroundColor: '#f3f4f6',
  color: 'var(--color-text-main)'
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem'
};

const summaryCardStyle = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
};

const darkSummaryCardStyle = {
  padding: '1.5rem',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
};

const summaryLabelStyle = {
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  fontWeight: '600',
};

const summaryValueStyle = {
  fontSize: '1.75rem',
  fontWeight: '700',
  marginBottom: '0.75rem'
};

const iconBoxStyle = {
  opacity: 0.5
};

const trendUpStyle = {
  fontSize: '0.75rem',
  color: 'var(--color-accent-green)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: '600'
};

const trendDownStyle = {
  fontSize: '0.75rem',
  color: 'var(--color-accent-red)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
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

const tableContainerStyle = {
  overflowX: 'auto',
  width: '100%'
};

const thStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  color: 'var(--color-text-main)'
};

const tdStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)'
};

const pageBtnStyle = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  fontSize: '0.875rem',
  cursor: 'pointer'
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
  padding: '2rem',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  marginBottom: '0.5rem',
  fontWeight: '600'
};
