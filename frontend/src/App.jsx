import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import DataTable from './components/DataTable';
import UserManagement from './components/UserManagement';
import { authAPI } from './services/api';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await authAPI.checkAuth();
        if (response.data.authenticated) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="main-container">
        <div className="app-header">
          <div className="header-left">
            <img src="/hillsidelogo.jpg" alt="Hillside" className="header-logo" />
            <div className="header-title">
              <h1>
                <span className="title-brand">FEELGOOD</span>
                <span className="title-main">Obje Listesi</span>
              </h1>
            </div>
          </div>
          <div className="user-info">
            <span className="user-name">
              Hoş geldiniz, <strong>{user.fullName || user.username}</strong>
            </span>
            {user.username === 'admin' && (
              <button className="btn-secondary" onClick={() => setShowUserManagement(true)}>
                👥 Kullanıcılar
              </button>
            )}
            <button className="btn-secondary" onClick={handleLogout}>
              Çıkış Yap
            </button>
          </div>
        </div>

        <DataTable />

        {/* Footer - Powered by */}
        <div className="app-footer">
          <span>Powered by</span>
          <strong>Hillside BTS</strong>
        </div>
      </div>

      {/* User Management Modal - Sadece admin görebilir */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
    </div>
  );
}

export default App;
