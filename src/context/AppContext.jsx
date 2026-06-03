import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Initial Mock Data
  const [inventory, setInventory] = useState([
    { id: 'INV-001', name: 'Matcha Latte', category: 'Minuman', stock: 42, price: 35000, hpp: 12000, image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 'INV-002', name: 'Cappuccino', category: 'Minuman', stock: 32, price: 30000, hpp: 10000, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 'INV-003', name: 'Strawberry Smoothies', category: 'Minuman', stock: 25, price: 38000, hpp: 15000, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 'INV-004', name: 'Artisan Chronograph', category: 'Elektronik / Aksesoris', stock: 142, price: 4485000, hpp: 2000000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 'INV-005', name: 'Turbo Runner X', category: 'Alas Kaki / Olahraga', stock: 3, price: 1800000, hpp: 800000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150&h=150' },
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
