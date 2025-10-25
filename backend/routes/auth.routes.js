const express = require('express');
const router = express.Router();
const { login, logout, checkAuth } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/logout', logout);
router.get('/check', checkAuth);

module.exports = router;
