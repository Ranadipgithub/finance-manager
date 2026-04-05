const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserStatus } = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/status', updateUserStatus);

module.exports = router;
