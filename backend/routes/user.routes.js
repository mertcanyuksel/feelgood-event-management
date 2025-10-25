const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Sadece admin erişebilir middleware
const requireAdmin = (req, res, next) => {
  if (req.session?.user?.username !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir'
    });
  }
  next();
};

// Tüm rotalar admin gerektirir
router.use(requireAuth);
router.use(requireAdmin);

// User CRUD routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router;
