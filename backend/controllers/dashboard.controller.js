const Transaction = require('../models/Transaction');

// @desc    Get dashboard summary totals (Income, Expense, Net)
// @route   GET /api/dashboard/summary
// @access  Private (All Roles: Admin, Analyst, Viewer)
const getDashboardSummary = async (req, res, next) => {
  try {
    const matchStage = { isDeleted: false };
    
    // Optional timeframe filter (e.g. ?startDate=2024-01-01&endDate=2024-12-31)
    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      { 
        $group: { 
          _id: '$type', 
          total: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    summary.forEach(item => {
      if (item._id === 'INCOME') totalIncome = item.total;
      if (item._id === 'EXPENSE') totalExpenses = item.total;
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending by category
// @route   GET /api/dashboard/categories
// @access  Private (All Roles: Admin, Analyst, Viewer)
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const matchStage = { isDeleted: false, type: 'EXPENSE' }; // Typically just breakdown expenses

    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const categories = await Transaction.aggregate([
      { $match: matchStage },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } } // Sort by highest spending
    ]);

    // Format for frontend (e.g., { "Marketing": 5000, "Servers": 1200 })
    const formattedCategories = categories.reduce((acc, curr) => {
      acc[curr._id] = curr.total;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: formattedCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total income and expense grouped by day or month for trends
// @route   GET /api/dashboard/trends
// @access  Private (All Roles: Admin, Analyst, Viewer)
const getTransactionTrends = async (req, res, next) => {
  try {
    const matchStage = { isDeleted: false };
    
    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    } else {
        // Default to last 30 days if no date given
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchStage.date = { $gte: thirtyDaysAgo };
    }

    const trends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Format for frontend grouping
    const formattedTrends = {};
    
    trends.forEach(item => {
      const date = item._id.date;
      if (!formattedTrends[date]) {
        formattedTrends[date] = { date, INCOME: 0, EXPENSE: 0 };
      }
      formattedTrends[date][item._id.type] = item.total;
    });

    res.status(200).json({
      status: 'success',
      data: Object.values(formattedTrends)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getCategoryBreakdown,
  getTransactionTrends
};
