import React, { useState } from 'react';
import { ShoppingBag, Trash2, CheckCircle, X, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function POS() {
  const { inventory, processSale, globalSearch } = useAppContext();
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua Item');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert('Stok tidak mencukupi!');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      if (product.stock <= 0) {
        alert('Stok habis!');
        return prev;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const ppn = subtotal * 0.11;
  const total = subtotal + ppn;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Save details for modal
    setLastOrderDetails({
      items: cart.length,
      total: total
    });
    
    processSale(cart);
    setCart([]);
    setShowSuccessModal(true);
    setIsMobileCartOpen(false); // Close cart on mobile after checkout
  };

  const filteredProducts = inventory
    .filter(p => activeCategory === 'Semua Item' || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes((globalSearch || '').toLowerCase()) || p.id.toLowerCase().includes((globalSearch || '').toLowerCase()));

  return (
    <div style={posContainerStyle} className="pos-layout">
      {/* Products Section */}
      <div style={productsSectionStyle} className="pos-products">
        <div style={topBarStyle}>
          <div>
            <h2 className="text-2xl font-bold">Point of Sale</h2>
            <p className="text-muted text-sm">Kasir Pintar</p>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', maxWidth: '100%'}}>
            <div style={categoryFiltersStyle}>
              {['Semua Item', ...new Set(inventory.map(p => p.category))].map(cat => (
                <button 
                  key={cat}
                  style={activeCategory === cat ? activeFilterStyle : filterStyle}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={gridStyle} className="pos-grid">
          {filteredProducts.map(product => (
            <div key={product.id} style={productCardStyle} className="card" onClick={() => addToCart(product)}>
              <div style={imageContainerStyle} className="image-container">
                <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} style={imageStyle} />
                <span style={stockBadgeStyle}>Stok: {product.stock}</span>
              </div>
              <div style={{padding: '1rem'}}>
                <h3 style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', minHeight: '40px'}}>{product.name}</h3>
                <p style={{fontSize: '1.25rem', fontWeight: 'bold'}}>
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Mobile Cart */}
      <button 
        className="mobile-cart-fab"
        onClick={() => setIsMobileCartOpen(true)}
      >
        <ShoppingBag size={20} />
        <span>Pesanan {cart.length > 0 && `(${cart.length})`}</span>
      </button>

      {/* Cart Sidebar */}
      <div style={cartSidebarStyle} className={`pos-sidebar ${isMobileCartOpen ? 'mobile-open' : ''}`}>
        <div className="flex items-center justify-between" style={{marginBottom: '1rem', gap: '8px'}}>
          <h2 style={{fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap', lineHeight: 1}}>Pesanan Saat Ini</h2>
          <div className="flex items-center gap-2">
            <button onClick={clearCart} style={{color: 'var(--color-accent-red)', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', padding: '4px 8px', backgroundColor: '#fef2f2', borderRadius: '4px', border: 'none'}}>
              Hapus Semua
            </button>
            <button className="mobile-only" onClick={() => setIsMobileCartOpen(false)} style={{padding: '4px'}}>
              <X size={20} color="var(--color-text-muted)" />
            </button>
          </div>
        </div>
        
        <div style={cartItemsContainerStyle}>
          {cart.length === 0 ? (
            <div style={emptyCartStyle}>
              <ShoppingBag size={48} color="var(--border-color)" style={{marginBottom: '1rem'}} />
              <p style={{color: 'var(--color-text-muted)', fontWeight: '600'}}>Keranjang kosong.</p>
              <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem'}}>Pilih produk untuk memulai.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={cartItemStyle}>
                <div style={{flex: 1}}>
                  <p style={{fontWeight: '600', fontSize: '0.875rem'}}>{item.name}</p>
                  <p style={{color: 'var(--color-text-muted)', fontSize: '0.75rem'}}>Rp {item.price.toLocaleString('id-ID')} x {item.qty}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={summaryStyle}>
          <div className="flex justify-between" style={{marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '0.875rem'}}>
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between" style={{marginBottom: '1rem', color: 'var(--color-text-main)', fontSize: '0.875rem'}}>
            <span>Pajak (11%)</span>
            <span>Rp {ppn.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between" style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '1.25rem'}}>
            <span>Total</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>

          <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
            <button 
              className="mobile-only"
              style={{...outlineBtnStyle, flex: 1, padding: '1rem', borderRadius: '12px', textAlign: 'center'}}
              onClick={() => setIsMobileCartOpen(false)}
            >
              Kembali
            </button>
            <button 
              className="btn-primary flex items-center justify-center gap-2" 
              style={{flex: 2, padding: '1rem', borderRadius: '12px', opacity: cart.length === 0 ? 0.5 : 1}}
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              <ShoppingBag size={18} /> Bayar
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={modalOverlayStyle} onClick={() => setShowSuccessModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
              <div style={successIconWrapperStyle}>
                <CheckCircle size={48} color="var(--color-accent-green)" />
              </div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Pembayaran Berhasil!</h2>
              <p style={{color: 'var(--color-text-muted)'}}>Transaksi telah dicatat ke Buku Besar dan inventaris telah diperbarui.</p>
            </div>
            
            <div style={receiptBoxStyle}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                <span style={{color: 'var(--color-text-muted)'}}>Total Item</span>
                <span style={{fontWeight: '600'}}>{lastOrderDetails?.items} produk</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1rem'}}>
                <span style={{color: 'var(--color-text-muted)'}}>Total Dibayar</span>
                <span style={{fontWeight: 'bold', color: 'var(--color-primary)'}}>Rp {lastOrderDetails?.total?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button className="btn-primary" style={{width: '100%', padding: '0.75rem'}} onClick={() => setShowSuccessModal(false)}>
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Styles
const posContainerStyle = {
  display: 'flex',
  height: 'calc(100vh - 80px)',
  overflow: 'hidden',
  margin: '-1.5rem', 
};

const productsSectionStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '1.5rem',
  overflowY: 'auto',
};

const cartSidebarStyle = {
  width: '320px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '1.5rem',
  backgroundColor: 'var(--color-bg-card)',
  borderLeft: '1px solid var(--border-color)',
};

const topBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  maxWidth: '100%'
};

const categoryFiltersStyle = {
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  paddingBottom: '4px',
  maxWidth: '100%',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none' // Firefox
};

const filterStyle = {
  padding: '8px 16px',
  borderRadius: '20px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'white',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap'
};

const activeFilterStyle = {
  ...filterStyle,
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  border: '1px solid var(--color-primary)'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1.5rem',
  paddingBottom: '2rem'
};

const productCardStyle = {
  cursor: 'pointer',
  padding: '0',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const imageContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '200px'
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const stockBadgeStyle = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: 'var(--color-text-main)',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const cartItemsContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const cartItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 0',
  borderBottom: '1px solid var(--border-color)'
};

const emptyCartStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center'
};

const summaryStyle = {
  marginTop: 'auto',
  paddingTop: '1rem',
  borderTop: '1px solid var(--border-color)'
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
  maxWidth: '400px',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
};

const successIconWrapperStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-accent-green-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem auto'
};

const receiptBoxStyle = {
  backgroundColor: '#f9fafb',
  border: '1px dashed var(--border-color)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1.5rem'
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  width: '100%',
  maxWidth: '300px'
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  width: '100%',
  fontSize: '0.875rem'
};

const outlineBtnStyle = {
  border: '1px solid var(--border-color)',
  backgroundColor: 'white',
  fontWeight: '600',
  fontSize: '0.875rem',
  color: 'var(--color-text-main)',
  cursor: 'pointer'
};
