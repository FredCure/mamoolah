const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const Supplier = require('../models/suppliers');
const Account = require('../models/accounts');
const { supplierSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


const router = express.Router();


const validateSupplier = (req, res, next) => {
    const { error } = supplierSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const suppliers = await Supplier.find({});
    res.render('suppliers/index', { suppliers })
}))

router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    const accounts = await Account.find({ companyId: res.locals.currentCompany._id, code: { $gte: 5000 } }).sort({ code: 1 });
    res.render('suppliers/new', { accounts });
}));

router.post('/', isLoggedIn, validateSupplier, catchAsync(async (req, res, next) => {
    const supplier = new Supplier(req.body.supplier);
    supplier.companyId = res.locals.currentCompany._id;
    await supplier.save();
    await logAction(req.user.id, 'CREATE', 'Supplier', supplier._id, { supplierName: supplier.name });
    req.flash('success', 'New supplier added successfully');
    res.redirect(`/suppliers/${supplier.id}`);
}))

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const thisSupplier = await Supplier.findById(req.params.id).populate('accountType');
    if (!thisSupplier) {
        req.flash('error', 'supplier not found');
        return res.redirect('/suppliers');
    }
    res.render('suppliers/show', { thisSupplier })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const thisSupplier = await Supplier.findById(req.params.id);
    const accounts = await Account.find({ companyId: res.locals.currentCompany._id, code: { $gte: 5000 } }).sort({ code: 1 });
    res.render('suppliers/edit', { thisSupplier, accounts })
}))

router.put('/:id', isLoggedIn, validateSupplier, catchAsync(async (req, res) => {
    const { id } = req.params;

    const originalSupplier = await Supplier.findById(id);
    const updatedSupplier = req.body.supplier;

    // Compare original and updated documents to find changed fields
    const changedFields = {};
    for (const key in updatedSupplier) {
        if (updatedSupplier[key] !== originalSupplier[key]) {
            changedFields[key] = {
                old: originalSupplier[key],
                new: updatedSupplier[key]
            };
        }
    }
    console.log(req.body.supplier);
    const supplier = await Supplier.findByIdAndUpdate(id, { ...req.body.supplier }, { new: true });
    if (Object.keys(changedFields).length > 0) {
        await logAction(req.user.id, 'UPDATE', 'Supplier', supplier._id, { updatedFields: changedFields });
    }
    req.flash('success', 'Supplier details updated successfully');
    res.redirect(`/suppliers/${supplier._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    await logAction(req.user.id, 'DELETE', 'Supplier', supplier._id, { supplierName: supplier.name });
    req.flash('success', 'Supplier deleted successfully');
    res.redirect('/suppliers');
}))


module.exports = router;