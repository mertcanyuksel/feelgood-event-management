import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(username, password);

      if (response.data.success) {
        onLoginSuccess(response.data.user);
      } else {
        setError(response.data.message || 'Giriş başarısız');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/hillsidelogo.jpg" alt="Hillside Feeling Good" />
        </div>
        <h1>FEELGOOD OBJE LİSTESİ</h1>
        <p className="login-subtitle">Giriş yapın</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="powered-by">
          <span>Powered by</span>
          <strong>Hillside BTS</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;
