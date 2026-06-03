import React, { useState } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, ArrowUpDown, Download, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Inventory() {
  const { inventory, globalSearch, setGlobalSearch, setInventory } = useAppContext();
  const search = globalSearch;
  const setSearch = setGlobalSearch;
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Minuman',
    stock: '',
    price: '',
    hpp: '',
    image: '',
    imagePreview: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini dari inventaris?')) {
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem({ ...item, imagePreview: item.image });
    setShowEditModal(true);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    const updatedInventory = inventory.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editingItem.name,
          category: editingItem.category,
          stock: parseInt(editingItem.stock) || 0,
          price: parseInt(editingItem.price) || 0,
          hpp: parseInt(editingItem.hpp) || 0,
          image: editingItem.image || item.image
        };
      }
      return item;
    });
    setInventory(updatedInventory);
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditingItem({...editingItem, imagePreview: reader.result, image: reader.result});
        } else {
          setNewItem({...newItem, imagePreview: reader.result, image: reader.result});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Nama Produk', 'Kategori', 'Stok', 'Harga (Rp)', 'HPP (Rp)'];
    const rows = inventory.map(item => [
      item.id,
      item.name,
      item.category,
      item.stock,
      item.price,
      item.hpp
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_inventaris.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const id = `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const newItemData = {
      id,
      name: newItem.name,
      category: newItem.category,
      stock: parseInt(newItem.stock) || 0,
      price: parseInt(newItem.price) || 0,
      hpp: parseInt(newItem.hpp) || 0,
      image: newItem.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=150&h=150'
    };

    setInventory([...inventory, newItemData]);
    setShowAddModal(false);
    setNewItem({ name: '', category: 'Minuman', stock: '', price: '', hpp: '', image: '', imagePreview: '' });
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative'}}>
      
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 className="text-2xl font-bold">Manajemen Inventaris</h2>
          <p className="text-muted text-sm" style={{marginTop: '4px'}}>Pantau ketersediaan stok barang dan harga pokok penjualan secara real-time.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button style={outlineBtnStyle} onClick={exportCSV}>
            <Download size={16} /> Ekspor CSV
          </button>
          <button className="btn-primary flex items-center gap-2" style={{backgroundColor: 'var(--color-primary)'}} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={summaryGridStyle} className="summary-grid">
        <div className="card" style={summaryCardStyle}>
          <p style={summaryLabelStyle}>Total Item Aktif</p>
          <h3 style={summaryValueStyle}>{inventory.length} <span style={{fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)'}}>Produk</span></h3>
        </div>
        <div className="card" style={summaryCardStyle}>
          <p style={summaryLabelStyle}>Peringatan Stok Habis</p>
          <h3 style={{...summaryValueStyle, color: 'var(--color-accent-red)'}}>{inventory.filter(i => i.stock < 10).length} <span style={{fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)'}}>Produk</span></h3>
        </div>
        <div className="card" style={summaryCardStyle}>
          <p style={summaryLabelStyle}>Estimasi Nilai Inventaris</p>
          <h3 style={{...summaryValueStyle, color: 'var(--color-primary)'}}>
            Rp {inventory.reduce((sum, item) => sum + (item.stock * item.hpp), 0).toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{padding: '0', overflow: 'hidden'}}>
        
        {/* Toolbar */}
        <div style={toolbarStyle}>
          <div style={searchContainerStyle}>
            <Search size={18} color="var(--color-text-muted)" />
            <input 
              type="text" 
              placeholder="Cari nama produk atau SKU..." 
              style={searchInputStyle} 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <button style={filterBtnStyle}>
            <Filter size={16} /> Filter Kategori
          </button>
        </div>

        {/* Desktop Table (Hidden on very small mobile) */}
        <div style={tableContainerStyle} className="desktop-table">
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#fafafa', borderBottom: '1px solid var(--border-color)', textAlign: 'left'}}>
                <th style={thStyle}>Info Produk</th>
                <th style={thStyle}>Kategori</th>
                <th style={thStyle}>Stok <ArrowUpDown size={12} style={{display: 'inline', marginLeft: '4px', color: 'var(--color-text-muted)'}}/></th>
                <th style={thStyle}>Harga Jual</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id} style={{borderBottom: '1px solid var(--border-color)', backgroundColor: 'white'}}>
                  <td style={tdStyle}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <img src={item.image || 'https://via.placeholder.com/40'} alt={item.name} style={{width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover'}} />
                      <div>
                        <p style={{fontWeight: '600'}}>{item.name}</p>
                        <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{item.category}</td>
                  <td style={{...tdStyle, fontWeight: '600'}}>{item.stock} Unit</td>
                  <td style={tdStyle}>Rp {item.price.toLocaleString('id-ID')}</td>
                  <td style={tdStyle}>
                    <span style={item.stock > 10 ? statusGreenStyle : statusRedStyle}>
                      {item.stock > 10 ? 'Tersedia' : 'Stok Rendah'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div className="flex gap-2">
                      <button style={actionBtnStyle} onClick={() => handleEditClick(item)} title="Edit"><Edit2 size={16} /></button>
                      <button style={{...actionBtnStyle, color: 'var(--color-accent-red)'}} onClick={() => handleDelete(item.id)} title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="mobile-list" style={{display: 'none'}}>
          {filteredInventory.map(item => (
            <div key={item.id} style={{padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center'}}>
               <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}} />
               <div style={{flex: 1}}>
                  <p style={{fontWeight: '600'}}>{item.name}</p>
                  <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px'}}>{item.id}</p>
                  <span style={item.stock > 10 ? statusGreenStyle : statusRedStyle}>
                    Stok: {item.stock}
                  </span>
               </div>
               <div style={{textAlign: 'right'}}>
                 <p style={{fontWeight: '600', fontSize: '0.875rem'}}>Rp {item.price.toLocaleString('id-ID')}</p>
                 <div className="flex gap-2 justify-end" style={{marginTop: '8px'}}>
                    <button style={actionBtnStyle} onClick={() => handleEditClick(item)}><Edit2 size={14} /></button>
                    <button style={{...actionBtnStyle, color: 'var(--color-accent-red)'}} onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            
            <div style={modalHeaderStyle}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>Tambah Barang Baru</h3>
              <button onClick={() => setShowAddModal(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddItem} style={modalBodyStyle}>
              
              <div style={{display: 'flex', gap: '1.5rem'}}>
                {/* Left Column: Image Upload */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px'}}>
                  <label style={labelStyle}>Gambar</label>
                  <div style={{width: '120px', height: '120px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative'}}>
                    {newItem.imagePreview ? (
                      <img src={newItem.imagePreview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '8px'}}>Klik Upload</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Atau URL Gambar" 
                    style={{...inputStyle, padding: '0.5rem', fontSize: '0.75rem'}}
                    value={newItem.image}
                    onChange={e => setNewItem({...newItem, image: e.target.value, imagePreview: e.target.value})}
                  />
                </div>

                {/* Right Column: Details */}
                <div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div style={{gridColumn: '1 / -1'}}>
                    <label style={labelStyle}>Nama Produk</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Misal: Kopi Arabica" 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Kategori</label>
                    <select 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    >
                      <option value="Minuman">Minuman</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Camilan">Camilan</option>
                      <option value="Elektronik / Aksesoris">Elektronik</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Stok</label>
                    <input 
                      type="number" 
                      onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      required 
                      placeholder="0" 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={newItem.stock}
                      onChange={e => setNewItem({...newItem, stock: e.target.value})}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Harga Jual</label>
                    <input 
                      type="number" 
                      onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      required 
                      placeholder="0" 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>HPP</label>
                    <input 
                      type="number" 
                      onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      required 
                      placeholder="0" 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={newItem.hpp}
                      onChange={e => setNewItem({...newItem, hpp: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                <button type="button" style={{...outlineBtnStyle, flex: 1, justifyContent: 'center', padding: '0.5rem'}} onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{flex: 1, padding: '0.5rem'}}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div style={modalOverlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            
            <div style={modalHeaderStyle}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>Edit Produk: {editingItem.id}</h3>
              <button onClick={() => setShowEditModal(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={submitEdit} style={modalBodyStyle}>
              
              <div style={{display: 'flex', gap: '1.5rem'}}>
                {/* Left Column: Image Upload */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px'}}>
                  <label style={labelStyle}>Gambar</label>
                  <div style={{width: '120px', height: '120px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative'}}>
                    {editingItem.imagePreview ? (
                      <img src={editingItem.imagePreview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <span style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '8px'}}>Ubah Gambar</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Atau URL Gambar" 
                    style={{...inputStyle, padding: '0.5rem', fontSize: '0.75rem'}}
                    value={editingItem.image}
                    onChange={e => setEditingItem({...editingItem, image: e.target.value, imagePreview: e.target.value})}
                  />
                </div>

                {/* Right Column: Details */}
                <div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div style={{gridColumn: '1 / -1'}}>
                    <label style={labelStyle}>Nama Produk</label>
                    <input 
                      type="text" 
                      required 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={editingItem.name}
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Kategori</label>
                    <select 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={editingItem.category}
                      onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                    >
                      <option value="Minuman">Minuman</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Camilan">Camilan</option>
                      <option value="Elektronik / Aksesoris">Elektronik / Aksesoris</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Stok</label>
                    <input 
                      type="number" 
                      onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      required 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={editingItem.stock}
                      onChange={e => setEditingItem({...editingItem, stock: e.target.value})}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Harga Jual</label>
                    <input 
                      type="number" 
                      onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      required 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={editingItem.price}
                      onChange={e => setEditingItem({...editingItem, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>HPP</label>
                    <input 
                      type="number" 
                      onKeyDown={e => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      required 
                      style={{...inputStyle, padding: '0.5rem 0.75rem'}}
                      value={editingItem.hpp}
                      onChange={e => setEditingItem({...editingItem, hpp: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                <button type="button" style={{...outlineBtnStyle, flex: 1, justifyContent: 'center', padding: '0.5rem'}} onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{flex: 1, padding: '0.5rem'}}>
                  Simpan Perubahan
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
  backgroundColor: 'white',
  color: 'var(--color-text-main)',
  cursor: 'pointer'
};

const summaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem'
};

const summaryCardStyle = {
  padding: '1.5rem',
};

const summaryLabelStyle = {
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  fontWeight: '600',
  marginBottom: '0.5rem'
};

const summaryValueStyle = {
  fontSize: '1.75rem',
  fontWeight: '700'
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

const statusGreenStyle = {
  backgroundColor: 'var(--color-accent-green-light)',
  color: 'var(--color-accent-green)',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600'
};

const statusRedStyle = {
  backgroundColor: 'var(--color-accent-red-light)',
  color: 'var(--color-accent-red)',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '600'
};

const actionBtnStyle = {
  padding: '6px',
  borderRadius: '6px',
  color: 'var(--color-text-muted)',
  backgroundColor: '#f1f5f9',
  border: 'none',
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
  maxWidth: '550px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
};

const modalHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const modalBodyStyle = {
  padding: '1.5rem',
  overflowY: 'auto'
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
