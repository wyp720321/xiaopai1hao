const express = require('express');
const router = express.Router();
const { createOrder, handleNotify } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/alipay/create', protect, createOrder);
router.post('/alipay/notify', handleNotify); // Note: No 'protect' here, Alipay calls this directly

module.exports = router;