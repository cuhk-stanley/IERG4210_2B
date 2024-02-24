import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MainContent from './MainContent';
import AdminPanel from './Admin';
import CategoryPage from './CategoryPage';
import ProductPage from './ProductPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><MainContent /></MainLayout>} />
        <Route path="/:categoryName" element={<MainLayout><CategoryPage /></MainLayout>} />
        <Route path="/product/:productId" element={<MainLayout><ProductPage /></MainLayout>} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

// Define the layout component here or in a separate file
function MainLayout({ children }) {
  return (
    <div className="App">
      <Header />
      <div className="main-layout">
        <Sidebar />
        {children} {/* This will render the child component */}
      </div>
      <Footer />
    </div>
  );
}

export default App;
