const Transaction = require('../models/Transaction');

const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, type, category, export: isExport } = req.query;

    const query = { isDeleted: false };

    if (type) query.type = type;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    let transactionsQuery = Transaction.find(query).sort({ date: -1 }).populate('createdBy', 'name email');

    if (isExport !== 'true') {
        transactionsQuery = transactionsQuery.limit(limit * 1).skip((page - 1) * limit);
    }

    const transactions = await transactionsQuery;

    const count = await Transaction.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalEntries: count
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    res.status(200).json({ status: 'success', data: transaction });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category) {
       return res.status(400).json({ status: 'error', message: 'Please add required fields: amount, type, category' });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      category,
      description,
      date: date || Date.now(),
      createdBy: req.user.id
    });

    res.status(201).json({ status: 'success', data: transaction });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({ _id: req.params.id, isDeleted: false });

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    const updatedData = { ...req.body };
    delete updatedData.createdBy; 
    delete updatedData.isDeleted; 

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: transaction });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, isDeleted: false });

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found or already deleted' });
    }

    transaction.isDeleted = true;
    await transaction.save();

    res.status(200).json({ status: 'success', message: 'Transaction successfully removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
