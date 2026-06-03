import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Ledger from './pages/Ledger';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';

function MainLayout({ children }) {
  const location = useLocation();
  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        <div key={location.pathname} className="page-container">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple mock auth for now
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/pos" />} 
        />
        
        <Route path="/" element={
          isAuthenticated ? <MainLayout><POS /></MainLayout> : <Navigate to="/login" />
        } />
        
        <Route path="/pos" element={
          isAuthenticated ? <MainLayout><POS /></MainLayout> : <Navigate to="/login" />
        } />
        
        <Route path="/inventory" element={
          isAuthenticated ? <MainLayout><Inventory /></MainLayout> : <Navigate to="/login" />
        } />

        <Route path="/ledger" element={
          isAuthenticated ? <MainLayout><Ledger /></MainLayout> : <Navigate to="/login" />
        } />

        <Route path="/purchases" element={
          isAuthenticated ? <MainLayout><Purchases /></MainLayout> : <Navigate to="/login" />
        } />

        <Route path="/reports" element={
          isAuthenticated ? <MainLayout><Reports /></MainLayout> : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/pos" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
