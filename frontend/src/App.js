import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MainContent from './MainContent';
import AdminPanel from './Admin';
import CategoryPage from './CategoryPage';
import ProductPage from './ProductPage';
import ChangePassword from './ChangePassword';
import Login from './Login';
import { CartProvider } from './CartContext';
import ProtectedRoute from './ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Make Login the default route */}
        <Route path="/" element={<MainLayout><MainContent /></MainLayout>} /> {/* Use /home for main content */}
        <Route path="/:categoryName" element={<MainLayout><CategoryPage /></MainLayout>} />
        <Route path="/product/:productId" element={<MainLayout><ProductPage /></MainLayout>} />
        <Route path="/admin" element={ <ProtectedRoute> <AdminPanel /> </ProtectedRoute>} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

function MainLayout({ children }) {
  return (
    <div className="App">
      <CartProvider>
        <Header />
        <div className="main-layout">
          <Sidebar />
          {children}
        </div>
      </CartProvider>
      <Footer />
    </div>
  );
}

export default App;
