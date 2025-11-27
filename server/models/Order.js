const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  vipType: {
    type: String,
    enum: ['month', 'quarter', 'year'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  alipayTradeNo: String, // Alipay's transaction ID
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date
});

module.exports = mongoose.model('Order', OrderSchema);