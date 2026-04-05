const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://duttarana189:wWBbmR3TAG36HZrj@cluster0.u2z6t.mongodb.net/finance-dashboard";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@finance.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'System Admin',
      email: 'admin@finance.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true
    });

    console.log('Admin user created successfully! Email: admin@finance.com, Password: admin123');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
