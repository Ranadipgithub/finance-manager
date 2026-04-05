const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    if (!user.isActive) {
        return res.status(401).json({ status: 'error', message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (isMatch) {
      const refreshToken = generateRefreshToken(user._id);

      res.cookie('jwt', refreshToken, {
          httpOnly: true, 
          secure: process.env.NODE_ENV !== 'development', 
          sameSite: 'strict', 
          maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      res.json({
        status: 'success',
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateAccessToken(user._id),
        }
      });
    } else {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ status: 'error', message: 'Forbidden' });

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      res.json({
        status: 'success',
        data: { token: generateAccessToken(user._id) }
      });
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
    res.status(200).json({ status: 'success', message: 'Logged out' });
};

module.exports = {
  loginUser,
  refreshToken,
  logoutUser
};
