const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../db/connection');

// Tüm kullanıcıları listele
const getAllUsers = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        user_id,
        username,
        full_name,
        is_active
      FROM users
      ORDER BY user_id DESC
    `);

    res.json({
      success: true,
      users: result.recordset
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar yüklenirken hata oluştu'
    });
  }
};

// Yeni kullanıcı oluştur
const createUser = async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre zorunludur'
      });
    }

    const pool = await getConnection();

    // Kullanıcı zaten var mı?
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT user_id FROM users WHERE username = @username');

    if (checkResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten mevcut'
      });
    }

    // Şifreyi hash'le
    const passwordHash = await bcrypt.hash(password, 10);

    // Yeni kullanıcı ekle
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password_hash', sql.NVarChar, passwordHash)
      .input('full_name', sql.NVarChar, fullName || null)
      .query(`
        INSERT INTO users (username, password_hash, full_name, is_active)
        VALUES (@username, @password_hash, @full_name, 1);
        SELECT SCOPE_IDENTITY() AS user_id;
      `);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      userId: result.recordset[0].user_id
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulurken hata oluştu'
    });
  }
};

// Kullanıcı güncelle
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password, fullName, isActive } = req.body;

    const pool = await getConnection();

    // Şifre değiştiriliyorsa hash'le
    let passwordHash = null;
    if (password && password.trim() !== '') {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Kullanıcıyı güncelle
    const request = pool.request()
      .input('user_id', sql.Int, userId)
      .input('username', sql.NVarChar, username)
      .input('full_name', sql.NVarChar, fullName || null)
      .input('is_active', sql.Bit, isActive ? 1 : 0);

    let query = `
      UPDATE users
      SET username = @username,
          full_name = @full_name,
          is_active = @is_active
    `;

    if (passwordHash) {
      request.input('password_hash', sql.NVarChar, passwordHash);
      query += `, password_hash = @password_hash`;
    }

    query += ` WHERE user_id = @user_id`;

    await request.query(query);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu'
    });
  }
};

// Kullanıcı sil
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Admin kullanıcısını silmeye izin verme
    if (parseInt(userId) === 1) {
      return res.status(403).json({
        success: false,
        message: 'Ana admin kullanıcısı silinemez'
      });
    }

    const pool = await getConnection();

    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM users WHERE user_id = @user_id');

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu'
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
