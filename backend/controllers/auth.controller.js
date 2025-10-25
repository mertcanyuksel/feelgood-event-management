const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../db/connection');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username AND is_active = 1');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const user = result.recordset[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Create session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      fullName: user.full_name
    };

    console.log(`✅ User logged in: ${username}`);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.username,
        fullName: user.full_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const logout = (req, res) => {
  const username = req.session.user?.username;

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }

    console.log(`✅ User logged out: ${username}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
};

const checkAuth = (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
};

module.exports = {
  login,
  logout,
  checkAuth
};
