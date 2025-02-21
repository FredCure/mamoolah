const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const passport = require('passport');
const Transaction = require('../models/transactions');
const User = require('../models/users');
const Company = require('../models/companies');
const { transactionSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { storeReturnTo } = require('../middleware');


const router = express.Router();


const validateTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const transactions = await Transaction.find({});
    res.render('transactions/index', { transactions });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('transactions/new');
});

router.post('/', isLoggedIn, validateTransaction, catchAsync(async (req, res) => {
    const transaction = new Transaction(req.body.transaction);
    await transaction.save();
    req.flash('success', 'Transaction created successfully');
    res.redirect(`/transactions/${transaction._id}`);
}));

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id).populate('accountId').populate('processedBy');
    if (!transaction) {
        req.flash('error', 'Transaction not found');
        return res.redirect('/transactions');
    }
    res.render('transactions/show', { transaction });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        req.flash('error', 'Transaction not found');
        return res.redirect('/transactions');
    }
    res.render('transactions/edit', { transaction });
}));

router.put('/:id', isLoggedIn, validateTransaction, catchAsync(async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndUpdate(id, { ...req.body.transaction }, { new: true });
    req.flash('success', 'Transaction updated successfully');
    res.redirect(`/transactions/${transaction._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    req.flash('success', 'Transaction deleted successfully');
    res.redirect('/transactions');
}));


module.exports = router;