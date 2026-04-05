const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  getTransactionById, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transaction.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(apiLimiter);

router.get('/', restrictTo('ADMIN', 'ANALYST'), getTransactions);
router.get('/:id', restrictTo('ADMIN', 'ANALYST'), getTransactionById);

router.post('/', restrictTo('ADMIN'), createTransaction);
router.put('/:id', restrictTo('ADMIN'), updateTransaction);
router.delete('/:id', restrictTo('ADMIN'), deleteTransaction);

module.exports = router;
