const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;
const Order = require('../models/Order');
const User = require('../models/User');
const moment = require('moment');

// Initialize Alipay SDK
// Note: These env vars are loaded from docker-compose.yml / .env
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
});

const VIP_PLANS = {
  month: { price: 19.9, days: 30, name: 'VIP月卡' },
  quarter: { price: 49.9, days: 90, name: 'VIP季卡' },
  year: { price: 149.0, days: 365, name: 'VIP年卡' }
};

// @desc    Create Alipay Order
// @route   POST /api/vip/alipay/create
exports.createOrder = async (req, res) => {
  const { planType } = req.body; // 'month', 'quarter', 'year'
  const userId = req.user._id;

  if (!VIP_PLANS[planType]) {
    return res.status(400).json({ message: 'Invalid plan type' });
  }

  const plan = VIP_PLANS[planType];
  const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  try {
    // 1. Create local order record
    await Order.create({
      userId,
      orderId,
      amount: plan.price,
      vipType: planType
    });

    // 2. Create Alipay Form Data
    const formData = new AlipayFormData();
    formData.setMethod('get');
    
    // Set callback URL (Important for automatic status update)
    // Must be a public accessible URL
    formData.addField('notifyUrl', process.env.ALIPAY_NOTIFY_URL); 
    
    // Return URL (Where user goes after payment)
    formData.addField('returnUrl', 'http://' + req.headers.host + '/dashboard'); 

    formData.addField('bizContent', {
      outTradeNo: orderId,
      productCode: 'FAST_INSTANT_TRADE_PAY',
      totalAmount: plan.price.toString(),
      subject: `云盘效率大师 - ${plan.name}`,
      body: `给用户 ${userId} 充值 ${plan.name}`,
    });

    // 3. Generate Payment URL
    const result = await alipaySdk.exec(
      'alipay.trade.page.pay',
      {},
      { formData: formData }
    );

    // Result is a URL, frontend should redirect user to this URL
    res.json({ paymentUrl: result });

  } catch (error) {
    console.error('Alipay Create Error:', error);
    res.status(500).json({ message: 'Create order failed' });
  }
};

// @desc    Handle Alipay Notify (Webhook)
// @route   POST /api/vip/alipay/notify
exports.handleNotify = async (req, res) => {
  // Alipay sends form-urlencoded data
  const params = req.body;

  try {
    // 1. Verify Signature
    const isVerify = alipaySdk.checkNotifySign(params);
    if (!isVerify) {
      console.error('Alipay signature verification failed');
      return res.send('fail');
    }

    // 2. Check status
    if (params.trade_status === 'TRADE_SUCCESS') {
      const orderId = params.out_trade_no;
      
      // Find order
      const order = await Order.findOne({ orderId });
      if (order && order.status === 'pending') {
        
        // Update Order
        order.status = 'paid';
        order.paidAt = new Date();
        order.alipayTradeNo = params.trade_no;
        await order.save();

        // Update User VIP
        const plan = VIP_PLANS[order.vipType];
        const user = await User.findById(order.userId);
        
        // Calculate new expiry
        const currentExpiry = user.isVip && user.vipExpiry > new Date() ? moment(user.vipExpiry) : moment();
        user.isVip = true;
        user.vipExpiry = currentExpiry.add(plan.days, 'days').toDate();
        await user.save();
        
        console.log(`User ${user.name} upgraded to VIP via Alipay.`);
      }
    }

    res.send('success');
  } catch (error) {
    console.error('Notify Error:', error);
    res.send('fail');
  }
};