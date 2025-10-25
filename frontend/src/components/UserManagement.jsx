import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UserManagement.css';

const UserManagement = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2025/api';
      const response = await axios.get(`${API_URL}/users`, {
        withCredentials: true
      });
      setUsers(response.data.users);
    } catch (err) {
      setError('Kullanıcılar yüklenirken hata oluştu');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      fullName: user.full_name || '',
      isActive: user.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`"${username}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2025/api';
      await axios.delete(`${API_URL}/users/${userId}`, {
        withCredentials: true
      });
      fetchUsers();
      alert('Kullanıcı başarıyla silindi');
    } catch (err) {
      alert(err.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2025/api';
      if (editingUser) {
        // Update
        await axios.put(`${API_URL}/users/${editingUser.user_id}`, formData, {
          withCredentials: true
        });
        alert('Kullanıcı başarıyla güncellendi');
      } else {
        // Create
        if (!formData.password) {
          alert('Şifre zorunludur');
          return;
        }
        await axios.post(`${API_URL}/users`, formData, {
          withCredentials: true
        });
        alert('Kullanıcı başarıyla oluşturuldu');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'İşlem sırasında hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="user-management-overlay">
      <div className="user-management-container">
        <div className="user-management-header">
          <h2>👥 Kullanıcı Yönetimi</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="user-management-actions">
          <button onClick={handleAddNew} className="btn-primary">
            + Yeni Kullanıcı
          </button>
          <button onClick={fetchUsers} className="btn-secondary">
            🔄 Yenile
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kullanıcı Adı</th>
                  <th>Tam İsim</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.user_id} className={user.is_active ? '' : 'inactive'}>
                    <td>{user.user_id}</td>
                    <td>{user.username}</td>
                    <td>{user.full_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn-edit"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      {user.user_id !== 1 && (
                        <button
                          onClick={() => handleDelete(user.user_id, user.username)}
                          className="btn-delete"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="modal-close">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Kullanıcı Adı <span className="required">*</span></label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Şifre {editingUser && <small>(Değiştirmek için doldurun)</small>}
                      {!editingUser && <span className="required">*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      placeholder={editingUser ? 'Değiştirmek için şifre girin' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tam İsim</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      Aktif
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                    İptal
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingUser ? 'Güncelle' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
