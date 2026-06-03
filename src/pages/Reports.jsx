import React, { useState } from 'react';
import { Download, Calendar, FileText, TrendingUp, Briefcase, Activity, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const { journal } = useAppContext();
  const [activeReport, setActiveReport] = useState(null); // 'Neraca' | 'Laba_Rugi' | 'Arus_Kas' | null

  // Chart Data (Mocked for visual)
  const chartData = [
    { name: 'Minggu 1', pendapatan: 15000000, pengeluaran: 18000000 },
    { name: 'Minggu 2', pendapatan: 22000000, pengeluaran: 12000000 },
    { name: 'Minggu 3', pendapatan: 18000000, pengeluaran: 16000000 },
    { name: 'Minggu 4', pendapatan: 28000000, pengeluaran: 10000000 },
  ];

  // ==========================================
  // Report Calculations based on Journal Context
  // ==========================================
  
  // Helper to get total balance of an account category
  const getAccountBalance = (prefix, normalBalance) => {
    return journal
      .filter(j => j.account.startsWith(prefix))
      .reduce((sum, j) => {
        if (normalBalance === 'debit') return sum + (j.debit - j.credit);
        return sum + (j.credit - j.debit);
      }, 0);
  };

  // 1. Laba Rugi Data
  const totalPendapatan = getAccountBalance('4', 'credit');
  const totalBeban = getAccountBalance('5', 'debit');
  const labaBersih = totalPendapatan - totalBeban;

  // 2. Neraca Data
  const kasBalance = getAccountBalance('1100', 'debit');
  const persediaanBalance = getAccountBalance('1130', 'debit');
  const totalAset = kasBalance + persediaanBalance;
  
  const kewajibanBalance = getAccountBalance('2', 'credit');
  // Simple equity plug to balance the sheet (Modal Awal + Laba Bersih)
  const modalAwal = 50000000; // From AppContext initial mock
  const totalEkuitas = modalAwal + labaBersih;
  const totalPasiva = kewajibanBalance + totalEkuitas;

  // 3. Arus Kas Data
  const cashInflows = journal.filter(j => j.account.startsWith('1100') && j.debit > 0 && j.description !== 'Modal Awal')
                             .reduce((sum, j) => sum + j.debit, 0);
  const cashOutflows = journal.filter(j => j.account.startsWith('1100') && j.credit > 0)
                              .reduce((sum, j) => sum + j.credit, 0);
  const netCashFlow = cashInflows - cashOutflows;


  const exportPDF = (type) => {
    const doc = new jsPDF();
    doc.text(`Laporan: ${type}`, 14, 20);
    
    const tableData = journal.map(j => [j.date, j.account, j.description, j.debit, j.credit]);
    
    doc.autoTable({
      startY: 30,
      head: [['Tanggal', 'Akun', 'Deskripsi', 'Debet', 'Kredit']],
      body: tableData,
    });

    doc.save(`Laporan_${type}_SGFinance.pdf`);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem', position: 'relative'}}>
      
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 className="text-2xl font-bold">Laporan Keuangan</h2>
          <p className="text-muted text-sm" style={{marginTop: '4px'}}>Tinjau kesehatan bisnis Anda dengan pelaporan yang presisi.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div style={dateFilterStyle}>
            <Calendar size={16} color="var(--color-text-muted)" />
            <span style={{fontSize: '0.875rem', fontWeight: '500'}}>1 Okt 2023 - 31 Okt 2023</span>
          </div>
          <button className="btn-primary flex items-center gap-2" style={{backgroundColor: 'var(--color-primary)'}}>
            <Download size={16} /> Ekspor Semua
          </button>
        </div>
      </div>

      {/* Top Section: Chart & Margin */}
      <div style={topSectionStyle}>
        
        {/* Chart Card */}
        <div className="card" style={{flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
            <div>
              <h3 style={{fontWeight: 'bold', fontSize: '1.125rem'}}>Pendapatan vs Pengeluaran</h3>
              <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Analisis komparatif untuk periode saat ini</p>
            </div>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)'}}></span>
                Pendapatan
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <span style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d1d5db'}}></span>
                Pengeluaran
              </div>
            </div>
          </div>
          
          <div style={{flex: 1, minHeight: '250px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="pendapatan" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="pengeluaran" fill="#d1d5db" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margin Card */}
        <div className="card" style={{flex: 1, padding: '1.5rem', backgroundColor: 'var(--color-primary)', color: 'white'}}>
          <p style={{fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem'}}>Margin Laba Bersih</p>
          <h2 style={{fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1', color: 'white'}}>24.8%</h2>
          <p style={{fontSize: '0.875rem', opacity: 0.9, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px'}}>
            <TrendingUp size={16} /> +3.2% dari bulan lalu
          </p>
          
          <div style={{marginTop: 'auto', paddingTop: '2rem'}}>
            <p style={{fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem'}}>Tindakan Disarankan:</p>
            <p style={{fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.5'}}>
              Investasikan kembali 15% surplus ke pengadaan Inventaris untuk musim liburan.
            </p>
          </div>
        </div>

      </div>

      {/* Available Reports Section */}
      <div>
        <h3 style={{fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem'}}>Laporan Tersedia</h3>
        <div style={reportCardsGridStyle}>
          
          {/* Neraca */}
          <div className="card" style={reportCardStyle}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <div style={iconBoxStyle}>
                <Briefcase size={20} color="var(--color-primary)" />
              </div>
              <span style={badgeStyle}>KRUSIAL</span>
            </div>
            <h4 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Neraca Keuangan</h4>
            <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '2rem', flex: 1}}>
              Ikhtisar aset, liabilitas, dan ekuitas pada titik waktu tertentu.
            </p>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button style={reportActionBtnStyle} onClick={() => setActiveReport('Neraca')}>Lihat</button>
              <button style={reportIconBtnStyle} onClick={() => exportPDF('Neraca')}><Download size={16}/></button>
            </div>
          </div>

          {/* Laba & Rugi */}
          <div className="card" style={reportCardStyle}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <div style={{...iconBoxStyle, backgroundColor: '#fae8e8'}}>
                <Activity size={20} color="#b91c1c" />
              </div>
              <span style={badgeStyle}>DINAMIS</span>
            </div>
            <h4 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Laba & Rugi</h4>
            <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '2rem', flex: 1}}>
              Merangkum pendapatan, biaya, dan pengeluaran yang terjadi selama periode tertentu.
            </p>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button style={reportActionBtnStyle} onClick={() => setActiveReport('Laba_Rugi')}>Lihat</button>
              <button style={reportIconBtnStyle} onClick={() => exportPDF('Laba_Rugi')}><Download size={16}/></button>
            </div>
          </div>

          {/* Arus Kas */}
          <div className="card" style={reportCardStyle}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <div style={iconBoxStyle}>
                <FileText size={20} color="var(--color-primary)" />
              </div>
              <span style={badgeStyle}>LIKUIDITAS</span>
            </div>
            <h4 style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Arus Kas</h4>
            <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '2rem', flex: 1}}>
              Melacak pergerakan uang masuk dan keluar dari bisnis Anda dari waktu ke waktu.
            </p>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button style={reportActionBtnStyle} onClick={() => setActiveReport('Arus_Kas')}>Lihat</button>
              <button style={reportIconBtnStyle} onClick={() => exportPDF('Arus_Kas')}><Download size={16}/></button>
            </div>
          </div>

        </div>
      </div>

      {/* Generation Log */}
      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <div style={{padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)'}}>
          <h3 style={{fontWeight: 'bold', fontSize: '1.125rem'}}>Log Pembuatan Terakhir</h3>
          <button style={{background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer'}}>Lihat Semua Riwayat &rarr;</button>
        </div>
        
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
            <thead>
              <tr style={{backgroundColor: '#fafafa', borderBottom: '1px solid var(--border-color)'}}>
                <th style={thStyle}>NAMA LAPORAN</th>
                <th style={thStyle}>DIBUAT OLEH</th>
                <th style={thStyle}>PERIODE</th>
                <th style={thStyle}>FORMAT</th>
                <th style={thStyle}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={trStyle}>
                <td style={{...tdStyle, fontWeight: '600'}}>Laporan Laba & Rugi</td>
                <td style={tdStyle}>Ahmad Fauzi</td>
                <td style={tdStyle}>1 Okt 2023 - 31 Okt 2023</td>
                <td style={tdStyle}>PDF</td>
                <td style={tdStyle}><span style={statusSuccessStyle}>Berhasil</span></td>
              </tr>
              <tr style={trStyle}>
                <td style={{...tdStyle, fontWeight: '600'}}>Neraca Keuangan (Konsolidasi)</td>
                <td style={tdStyle}>Sistem (Otomatis)</td>
                <td style={tdStyle}>Sept 2023</td>
                <td style={tdStyle}>XLSX</td>
                <td style={tdStyle}><span style={statusSuccessStyle}>Berhasil</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= */}
      {/* MODAL VIEW FOR REPORTS  */}
      {/* ======================= */}
      {activeReport && (
        <div style={modalOverlayStyle} onClick={() => setActiveReport(null)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            
            <div style={modalHeaderStyle}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>
                {activeReport === 'Neraca' && 'Neraca Keuangan'}
                {activeReport === 'Laba_Rugi' && 'Laporan Laba & Rugi'}
                {activeReport === 'Arus_Kas' && 'Laporan Arus Kas'}
              </h2>
              <button onClick={() => setActiveReport(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                <X size={24} />
              </button>
            </div>

            <div style={modalBodyStyle}>
              {/* Laba Rugi Template */}
              {activeReport === 'Laba_Rugi' && (
                <table style={reportTableStyle}>
                  <tbody>
                    <tr><td colSpan="2" style={reportSectionTitleStyle}>PENDAPATAN</td></tr>
                    <tr><td style={reportTdStyle}>Pendapatan Penjualan</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {totalPendapatan.toLocaleString('id-ID')}</td></tr>
                    <tr style={reportSubtotalStyle}><td style={reportTdStyle}>Total Pendapatan</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {totalPendapatan.toLocaleString('id-ID')}</td></tr>
                    
                    <tr><td colSpan="2" style={reportSectionTitleStyle}>BEBAN OPERASIONAL</td></tr>
                    <tr><td style={reportTdStyle}>Beban Operasional & Lainnya</td><td style={{...reportTdStyle, textAlign: 'right'}}>(Rp {totalBeban.toLocaleString('id-ID')})</td></tr>
                    <tr style={reportSubtotalStyle}><td style={reportTdStyle}>Total Beban</td><td style={{...reportTdStyle, textAlign: 'right'}}>(Rp {totalBeban.toLocaleString('id-ID')})</td></tr>
                    
                    <tr style={reportGrandTotalStyle}><td style={reportTdStyle}>LABA BERSIH</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {labaBersih.toLocaleString('id-ID')}</td></tr>
                  </tbody>
                </table>
              )}

              {/* Neraca Template */}
              {activeReport === 'Neraca' && (
                <table style={reportTableStyle}>
                  <tbody>
                    <tr><td colSpan="2" style={reportSectionTitleStyle}>ASET</td></tr>
                    <tr><td style={reportTdStyle}>Kas</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {kasBalance.toLocaleString('id-ID')}</td></tr>
                    <tr><td style={reportTdStyle}>Persediaan Barang</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {persediaanBalance.toLocaleString('id-ID')}</td></tr>
                    <tr style={reportSubtotalStyle}><td style={reportTdStyle}>Total Aset</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {totalAset.toLocaleString('id-ID')}</td></tr>
                    
                    <tr><td colSpan="2" style={reportSectionTitleStyle}>LIABILITAS & EKUITAS</td></tr>
                    <tr><td style={reportTdStyle}>Kewajiban (Hutang Pajak/Lainnya)</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {kewajibanBalance.toLocaleString('id-ID')}</td></tr>
                    <tr><td style={reportTdStyle}>Modal Awal & Ditahan</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {totalEkuitas.toLocaleString('id-ID')}</td></tr>
                    <tr style={reportSubtotalStyle}><td style={reportTdStyle}>Total Liabilitas & Ekuitas</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {totalPasiva.toLocaleString('id-ID')}</td></tr>
                  </tbody>
                </table>
              )}

              {/* Arus Kas Template */}
              {activeReport === 'Arus_Kas' && (
                <table style={reportTableStyle}>
                  <tbody>
                    <tr><td colSpan="2" style={reportSectionTitleStyle}>ARUS KAS DARI AKTIVITAS OPERASI</td></tr>
                    <tr><td style={reportTdStyle}>Penerimaan dari Pelanggan</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {cashInflows.toLocaleString('id-ID')}</td></tr>
                    <tr><td style={reportTdStyle}>Pembayaran ke Pemasok & Beban</td><td style={{...reportTdStyle, textAlign: 'right'}}>(Rp {cashOutflows.toLocaleString('id-ID')})</td></tr>
                    
                    <tr style={reportGrandTotalStyle}>
                      <td style={reportTdStyle}>KENAIKAN (PENURUNAN) BERSIH KAS</td>
                      <td style={{...reportTdStyle, textAlign: 'right'}}>Rp {netCashFlow.toLocaleString('id-ID')}</td>
                    </tr>
                    
                    <tr><td style={reportTdStyle}>Saldo Kas Awal (Simulasi)</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp 50.000.000</td></tr>
                    <tr style={reportSubtotalStyle}><td style={reportTdStyle}>Saldo Kas Akhir</td><td style={{...reportTdStyle, textAlign: 'right'}}>Rp {kasBalance.toLocaleString('id-ID')}</td></tr>
                  </tbody>
                </table>
              )}
            </div>

            <div style={modalFooterStyle}>
              <button style={outlineBtnStyle} onClick={() => setActiveReport(null)}>Tutup</button>
              <button className="btn-primary" onClick={() => exportPDF(activeReport)}>Unduh PDF</button>
            </div>
            
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

const dateFilterStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'white',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

const topSectionStyle = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap'
};

const reportCardsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem'
};

const reportCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem'
};

const iconBoxStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const badgeStyle = {
  padding: '4px 8px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  borderRadius: '4px',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  letterSpacing: '0.5px'
};

const reportActionBtnStyle = {
  flex: 1,
  padding: '0.75rem',
  backgroundColor: '#f1f5f9',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  color: 'var(--color-primary)',
  cursor: 'pointer'
};

const reportIconBtnStyle = {
  padding: '0.75rem',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const thStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)'
};

const trStyle = {
  borderBottom: '1px solid var(--border-color)'
};

const statusSuccessStyle = {
  backgroundColor: 'var(--color-accent-green-light)',
  color: 'var(--color-accent-green)',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600'
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
  maxWidth: '600px',
  maxHeight: '90vh',
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
  padding: '2rem 1.5rem',
  overflowY: 'auto',
  flex: 1
};

const modalFooterStyle = {
  padding: '1.5rem',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem'
};

const reportTableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const reportSectionTitleStyle = {
  padding: '1rem 0 0.5rem 0',
  fontWeight: 'bold',
  color: 'var(--color-primary)',
  fontSize: '0.875rem'
};

const reportTdStyle = {
  padding: '0.75rem 0',
  borderBottom: '1px dashed var(--border-color)',
  fontSize: '0.875rem'
};

const reportSubtotalStyle = {
  fontWeight: 'bold',
  backgroundColor: '#f9fafb'
};

const reportGrandTotalStyle = {
  fontWeight: 'bold',
  backgroundColor: 'var(--color-primary)',
  color: 'white'
};
