const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const MONGO_URI = "mongodb://localhost:27017/finance-dashboard";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const adminUser = await User.findOne({ email: 'admin@finance.com' });

    if (!adminUser) {
      console.log('Error: Run seedAdmin.js first to create the admin user.');
      process.exit(1);
    }

    await Transaction.deleteMany({ createdBy: adminUser._id });
    console.log("Cleared old admin transactions");

    const categories = {
      EXPENSE: ['Groceries', 'Rent', 'Dining Out', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare'],
      INCOME: ['Salary', 'Freelance Projects', 'Investments', 'Side Hustle', 'Refunds']
    };

    const descriptions = [
      'Monthly bill', 'Client payment', 'Weekend trip', 'Supermarket', 'AWS Servers', 'Dinner with team', 'Consulting fee'
    ];

    const generateRandomAmount = (min, max) => Math.floor(Math.random() * (max - min) + min);

    const generateRandomDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date;
    };

    const transactionsToInsert = [];

    for (let i = 0; i < 40; i++) {

        const type = Math.random() > 0.75 ? 'INCOME' : 'EXPENSE'; 

        let amount = type === 'INCOME' ? generateRandomAmount(5000, 30000) : generateRandomAmount(200, 4000);

        const categoryList = categories[type];
        let category = categoryList[Math.floor(Math.random() * categoryList.length)];

        if (category === 'Rent') amount = generateRandomAmount(15000, 25000);
        if (category === 'Salary') amount = generateRandomAmount(50000, 80000);

        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        transactionsToInsert.push({
            amount,
            type,
            category,
            description,
            date: generateRandomDate(30),
            createdBy: adminUser._id,
        });
    }

    await Transaction.insertMany(transactionsToInsert);
    console.log(`Successfully seeded ${transactionsToInsert.length} realistic transactions!`);

    process.exit();
  } catch (error) {
    console.error('Error seeding realistic data:', error);
    process.exit(1);
  }
};

seedData();
