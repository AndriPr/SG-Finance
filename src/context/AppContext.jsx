import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Initial Mock Data
  const [inventory, setInventory] = useState([
    { id: 'INV-001', name: 'Wedang Uwuh', category: 'Minuman Tradisional', stock: 50, price: 38000, hpp: 15000, image: 'https://via.placeholder.com/150?text=Wedang+Uwuh' },
    { id: 'INV-002', name: 'Jahe Merah', category: 'Minuman Tradisional', stock: 50, price: 28000, hpp: 10000, image: 'https://via.placeholder.com/150?text=Jahe+Merah' },
    { id: 'INV-003', name: 'Beras Kencur', category: 'Minuman Tradisional', stock: 50, price: 28000, hpp: 10000, image: 'https://via.placeholder.com/150?text=Beras+Kencur' },
    { id: 'INV-004', name: 'Kunyit Asam', category: 'Minuman Tradisional', stock: 50, price: 28000, hpp: 10000, image: 'https://via.placeholder.com/150?text=Kunyit+Asam' },
    { id: 'INV-005', name: 'Temulawak', category: 'Minuman Tradisional', stock: 50, price: 28000, hpp: 10000, image: 'https://via.placeholder.com/150?text=Temulawak' },
  ]);

  const [journal, setJournal] = useState([
    { id: 'JRN-001', date: '24 Okt 2023', description: 'Modal Awal', account: '1100 - Kas', debit: 50000000, credit: 0 },
  ]);

  const [purchases, setPurchases] = useState([
    { id: 'PO-2023-001', date: '20 Okt 2023', supplier: 'PT. Distribusi Kopi', subtotal: 2500000, ppn: 275000, total: 2775000, status: 'Selesai' },
  ]);

  // Global Search
  const [globalSearch, setGlobalSearch] = useState('');

  // User Profile
  const [userProfile, setUserProfile] = useState({
    businessName: 'SG-Finance',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Stok Turbo Runner X menipis (Sisa: 3)', isRead: false },
    { id: 2, message: 'Selamat datang kembali di SG-Finance!', isRead: false }
  ]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Actions
  const processSale = (cartItems) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = total * 0.11;
    const grandTotal = total + tax;

    // Update inventory
    setInventory(prev => prev.map(product => {
      const cartItem = cartItems.find(c => c.id === product.id);
      if (cartItem) {
        // Trigger low stock notification
        if (product.stock - cartItem.qty <= 5) {
          setNotifications(n => [{ id: Date.now(), message: `Stok ${product.name} menipis!`, isRead: false }, ...n]);
        }
        return { ...product, stock: product.stock - cartItem.qty };
      }
      return product;
    }));

    // Add income journal entry
    const newJournal = {
      id: `TRX-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      description: 'Penjualan POS',
      account: '4100 Pendapatan Penjualan',
      debit: 0,
      credit: grandTotal
    };
    
    // Add tax payable journal entry
    const taxJournal = {
      id: `TAX-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      description: 'Pajak Keluaran (PPN 11%)',
      account: '2110 Hutang Pajak',
      debit: 0,
      credit: tax
    };

    setJournal(prev => [newJournal, taxJournal, ...prev]);
    setNotifications(n => [{ id: Date.now()+1, message: `Penjualan berhasil dicatat (Rp ${grandTotal.toLocaleString('id-ID')})`, isRead: false }, ...n]);
  };

  const addExpense = (expenseData) => {
    const dateStr = new Date().toLocaleDateString('id-ID');
    const jrnId = `JRN-${Math.floor(Math.random() * 10000)}`;

    setJournal([...journal, 
      { id: jrnId, date: dateStr, description: expenseData.description, account: expenseData.account, debit: expenseData.amount, credit: 0 },
      { id: jrnId, date: dateStr, description: `Pembayaran Beban`, account: '1100 - Kas', debit: 0, credit: expenseData.amount },
    ]);
  };

  const addPurchase = (purchase) => {
    const newPO = {
      id: `PO-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID'),
      supplier: purchase.supplier,
      subtotal: purchase.subtotal,
      ppn: purchase.subtotal * 0.11,
      total: purchase.subtotal * 1.11,
      status: 'Selesai'
    };
    
    setPurchases(prev => [newPO, ...prev]);
    
    // Auto expense for purchases
    addExpense({
      description: `Pembelian ke ${purchase.supplier}`,
      account: '1130 - Persediaan Barang',
      amount: purchase.subtotal
    });
    
    setNotifications(n => [{ id: Date.now(), message: `Pembelian ke ${purchase.supplier} berhasil dicatat`, isRead: false }, ...n]);
  };

  return (
    <AppContext.Provider value={{
      inventory, setInventory,
      journal, setJournal,
      purchases, setPurchases,
      processSale, addPurchase, addExpense,
      globalSearch, setGlobalSearch,
      userProfile, setUserProfile,
      notifications, markNotificationRead, clearAllNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
