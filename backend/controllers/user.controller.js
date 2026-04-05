const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: role || 'VIEWER', 
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
       return res.status(400).json({ status: 'error', message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ status: 'error', message: 'isActive field is required' });
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    ).select('-passwordHash');

    if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
        status: 'success',
        data: user
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus
};
