const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const Account = require('../models/accounts');
const Client = require('../models/clients');
const Invoice = require('../models/invoices');
const Company = require('../models/companies');
const { accountSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


const router = express.Router();


const validateAccount = (req, res, next) => {
    const { error } = accountSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const accounts = await Account.find({});
    res.render('accounts/index', { accounts })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('accounts/new');
})

router.post('/', isLoggedIn, (req, res, next) => {
    // Convert checkbox value to boolean
    if (req.body.account.setMainAccount) {
        req.body.account.setMainAccount = true;
    } else {
        req.body.account.setMainAccount = false;
    }
    next();
}, validateAccount, catchAsync(async (req, res, next) => {
    const account = new Account(req.body.account);
    account.createdAt = Date.now();
    account.companyId = res.locals.currentCompany._id;
    if (req.body.account.setMainAccount) {
        await Company.findByIdAndUpdate(res.locals.currentCompany._id, { mainAccountId: account._id });
    }
    await account.save();
    await logAction(req.user.id, 'CREATE', 'Account', account._id, { accountName: account.accountName, setMainAccount: req.body.account.setMainAccount });
    req.flash('success', 'New account added successfully');
    res.redirect(`/accounts/${account.id}`);
}))

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const thisAccount = await Account.findById(req.params.id).populate('companyId');
    console.log(thisAccount);
    if (!thisAccount) {
        req.flash('error', 'Account not found');
        return res.redirect('/accounts');
    }
    res.render('accounts/show', { thisAccount })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const thisAccount = await Account.findById(req.params.id);
    res.render('accounts/edit', { thisAccount })
}))

router.put('/:id', isLoggedIn, (req, res, next) => {
    // Convert checkbox value to boolean
    if (req.body.account.setMainAccount) {
        req.body.account.setMainAccount = true;
    } else {
        req.body.account.setMainAccount = false;
    }
    next();
}, validateAccount, catchAsync(async (req, res) => {
    const { id } = req.params;
    req.body.account.updatedAt = Date.now();

    const originalAccount = await Account.findById(id);
    const updatedAccount = req.body.account;

    // Convert number fields back to numbers
    if (updatedAccount.balance) updatedAccount.balance = Number(updatedAccount.balance);

    // Compare original and updated documents to find changed fields
    const changedFields = {};
    for (const key in updatedAccount) {
        if (key !== 'updatedAt' && updatedAccount[key] !== originalAccount[key]) {
            changedFields[key] = {
                old: originalAccount[key],
                new: updatedAccount[key]
            };
        }
    }

    // Check if setMainAccount has changed
    const company = await Company.findById(res.locals.currentCompany._id);
    if (updatedAccount.setMainAccount) {
        await Company.findByIdAndUpdate(res.locals.currentCompany._id, { mainAccountId: updatedAccount._id });
    } else if (!updatedAccount.setMainAccount) {
        delete changedFields.setMainAccount;
    }

    const account = await Account.findByIdAndUpdate(id, { ...req.body.account });
    if (Object.keys(changedFields).length > 0) {
        await logAction(req.user.id, 'UPDATE', 'Account', account._id, { updatedFields: changedFields });
    }
    req.flash('success', 'Account details updated successfully');
    res.redirect(`/accounts/${account._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Account.findByIdAndDelete(id);
    req.flash('success', 'Account deleted successfully');
    res.redirect('/accounts');
}))


module.exports = router;