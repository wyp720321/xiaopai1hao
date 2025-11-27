const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '用户已存在' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVip: user.isVip,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isVip: user.isVip,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: '邮箱或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login by IP (Guest)
// @route   POST /api/auth/guest
exports.guestLogin = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // Find existing guest by IP or create new
    let user = await User.findOne({ guestIp: ip, role: 'guest' });

    if (!user) {
      user = await User.create({
        name: `游客_${Math.floor(Math.random() * 10000)}`,
        role: 'guest',
        guestIp: ip,
        isVip: false
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      isVip: user.isVip,
      role: 'guest',
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};