const express = require('express');
const mongoose = require('mongoose');
const { isLoggedIn, logAction } = require('../middleware');
const passport = require('passport');
const Transaction = require('../models/transactions');
const User = require('../models/users');
const Company = require('../models/companies');
const Account = require('../models/accounts');
const Supplier = require('../models/suppliers');
const { transactionSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { storeReturnTo } = require('../middleware');


const router = express.Router();


const validateTransaction = (req, res, next) => {
    console.log('Transaction data:', req.body);
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const transactions = await Transaction.find({}).populate('supplierId');
    res.render('transactions/index', { transactions });
}));

router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    const accounts = await Account.find({ companyId: res.locals.currentCompany._id }).sort({ isPrimary: -1, code: 1, name: 1 });
    const suppliers = await Supplier.find({ companyId: res.locals.currentCompany._id }).sort({ name: 1 }).populate('accountType').populate('taxes');
    res.render('transactions/new', { accounts, suppliers });
}));

router.post('/', isLoggedIn, validateTransaction, catchAsync(async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = new Transaction(req.body.transaction);
        transaction.companyId = res.locals.currentCompany._id;
        transaction.processedBy = req.user._id;

        if (transaction.transactionType === 'purchase') {
            // Get company tax rates
            const { gstRate, pstRate, hstRate } = res.locals.currentCompany;

            console.log('GST Rate:', gstRate);
            console.log('PST Rate:', pstRate);
            console.log('HST Rate:', hstRate);

            // Calculate tax amounts based on tax type (tax-inclusive)
            const totalAmount = parseFloat(req.body.transaction.amount);
            let effectiveGstRate = 0;
            let effectivePstRate = 0;
            let effectiveHstRate = 0;

            // Set tax rates based on tax type
            switch (req.body.transaction.taxes) {
                case 'gst':
                    effectiveGstRate = gstRate;
                    break;
                case 'pst':
                    effectivePstRate = pstRate;
                    break;
                case 'gstpst':
                    effectiveGstRate = gstRate;
                    effectivePstRate = pstRate;
                    break;
                case 'hst':
                    effectiveHstRate = hstRate;
                    break;
            }

            // Calculate amounts (tax-inclusive)
            const totalTaxRate = effectiveGstRate + effectivePstRate + effectiveHstRate;
            const netAmount = totalAmount / (1 + (totalTaxRate / 100));
            const totalTax = totalAmount - netAmount;

            let gstAmount = 0;
            let pstAmount = 0;
            let hstAmount = 0;

            switch (req.body.transaction.taxes) {
                case 'gst':
                    gstAmount = totalTax;
                    break;
                case 'pst':
                    pstAmount = totalTax;
                    break;
                case 'gstpst':
                    gstAmount = netAmount * (gstRate / 100);
                    pstAmount = netAmount * (pstRate / 100);
                    break;
                case 'hst':
                    hstAmount = totalTax;
                    break;
            }

            // Get required accounts
            const [expenseAccount, gstInputTaxAccount, pstInputTaxAccount, hstInputTaxAccount, cashAccount] = await Promise.all([
                Account.findById(req.body.transaction.account),
                Account.findOne({
                    companyId: res.locals.currentCompany._id,
                    code: 1151 // GST Input Tax account
                }),
                Account.findOne({
                    companyId: res.locals.currentCompany._id,
                    code: 1152 // PST Input Tax account
                }),
                Account.findOne({
                    companyId: res.locals.currentCompany._id,
                    code: 1153 // HST Input Tax account
                }),
                Account.findById(req.body.transaction.origin)
            ]);

            if (!expenseAccount || !cashAccount || (!gstInputTaxAccount && !pstInputTaxAccount && !hstInputTaxAccount)) {
                throw new ExpressError('One or more required accounts not found', 400);
            }

            // Create journal entries and update account balances
            transaction.entries = [];

            // Expense account (Debit)
            transaction.entries.push({
                accountId: expenseAccount._id,
                debit: Number(netAmount.toFixed(2)),
                credit: 0
            });
            expenseAccount.balance += Number(netAmount.toFixed(2));
            await expenseAccount.save({ session });

            // GST Input Tax Account (Debit)
            if (gstAmount > 0 && gstInputTaxAccount) {
                transaction.entries.push({
                    accountId: gstInputTaxAccount._id,
                    debit: Number(gstAmount.toFixed(2)),
                    credit: 0
                });
                gstInputTaxAccount.balance += Number(gstAmount.toFixed(2));
                await gstInputTaxAccount.save({ session });
            }

            // PST Input Tax Account (Debit)
            if (pstAmount > 0 && pstInputTaxAccount) {
                transaction.entries.push({
                    accountId: pstInputTaxAccount._id,
                    debit: Number(pstAmount.toFixed(2)),
                    credit: 0
                });
                pstInputTaxAccount.balance += Number(pstAmount.toFixed(2));
                await pstInputTaxAccount.save({ session });
            }

            // HST Input Tax Account (Debit)
            if (hstAmount > 0 && hstInputTaxAccount) {
                transaction.entries.push({
                    accountId: hstInputTaxAccount._id,
                    debit: Number(hstAmount.toFixed(2)),
                    credit: 0
                });
                hstInputTaxAccount.balance += Number(hstAmount.toFixed(2));
                await hstInputTaxAccount.save({ session });
            }

            // Cash/Bank account (Credit)
            transaction.entries.push({
                accountId: cashAccount._id,
                debit: 0,
                credit: Number(totalAmount.toFixed(2))
            });
            cashAccount.balance -= Number(totalAmount.toFixed(2));
            await cashAccount.save({ session });

            transaction.supplierId = req.body.transaction.supplierId;
        }

        await transaction.save({ session });
        await session.commitTransaction();

        console.log('Transaction date:', transaction.transactionDate);

        req.flash('success', 'Transaction created successfully');
        res.redirect(`/transactions/new`);

    } catch (error) {
        await session.abortTransaction();
        req.flash('error', error.message);
        res.redirect('/transactions/new');
    } finally {
        session.endSession();
    }
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