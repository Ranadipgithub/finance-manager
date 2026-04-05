const express = require('express');
const router = express.Router();
const { loginUser, refreshToken, logoutUser } = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

module.exports = router;
