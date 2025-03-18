const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const User = require('../models/users');
const Client = require('../models/clients');
const Company = require('../models/companies');
const Invoice = require('../models/invoices');
const Transaction = require('../models/transactions');
const { invoiceSchema, transactionSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


const router = express.Router();


const validateInvoice = (req, res, next) => {
    const { error } = invoiceSchema.validate(req.body.invoice);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const invoices = await Invoice.find({});
    res.render('invoices/index', { invoices })
}))

router.get('/:id/new', isLoggedIn, catchAsync(async (req, res) => {
    const thisClient = await Client.findById(req.params.id);
    res.render('invoices/new', { thisClient });
}))

router.post('/:id', isLoggedIn, validateInvoice, catchAsync(async (req, res, next) => {
    const author = req.user._id;
    const thisClient = await Client.findById(req.params.id);
    const thisCompany = await Company.findById(res.locals.currentCompany._id);
    const { number, client, email, date, terms, subtotal, rebateType, rebate, gst, pst, hst, total, deposit } = req.body;
    const elements = req.body.elements;
    // Ensure elements is an array of objects
    const formattedElements = elements.date.map((date, index) => ({
        date,
        date: elements.date[index],
        description: elements.description[index],
        quantity: elements.quantity[index],
        rate: elements.rate[index],
        fixed: elements.fixed[index],
        amount: elements.amount[index],
        taxes: elements.taxes[index],
        workers: [] // Assuming workers are not included
    }));

    const invoice = new Invoice({
        author,
        number,
        client,
        clientId: thisClient._id,
        email,
        date,
        terms,
        subtotal,
        rebateType,
        rebate,
        gst,
        pst,
        hst,
        total,
        deposit,
        elements: formattedElements,
        companyId: res.locals.currentCompany._id
    });
    thisClient.invoices.push(invoice);
    thisCompany.currentInvoiceNumber += 1;

    await invoice.save();
    await thisClient.save();
    await thisCompany.save();

    await logAction(req.user.id, 'CREATE', 'Invoice', invoice._id, { invoiceNumber: invoice.number });

    req.flash('success', 'New invoice created successfully');
    res.redirect(`/invoices/${invoice._id}`);
}))

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const thisInvoice = await Invoice.findById(req.params.id).populate('author');
    const thisClient = await Client.findById(thisInvoice.clientId);
    const thisCompany = await Company.findById(thisInvoice.companyId);
    res.render('invoices/show', { thisInvoice, thisClient, thisCompany })
}))

router.get('/:id/edit', isLoggedIn, validateInvoice, catchAsync(async (req, res) => {
    const thisInvoice = await Invoice.findById(req.params.id);
    res.render('invoices/edit', { thisInvoice })
}))

router.put('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const originalInvoice = await Invoice.findById(id);
    const updatedInvoice = req.body.invoice;

    // Compare original and updated documents to find changed fields
    const changedFields = {};
    for (const key in updatedInvoice) {
        if (updatedInvoice[key] !== originalInvoice[key]) {
            changedFields[key] = {
                old: originalInvoice[key],
                new: updatedInvoice[key]
            };
        }
    }

    const invoice = await Invoice.findByIdAndUpdate(id, { ...req.body.invoice });

    await logAction(req.user.id, 'UPDATE', 'Invoice', invoice._id, { updatedFields: changedFields });

    req.flash('success', 'Invoice details updated successfully');
    res.redirect(`/invoices/${invoice._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Invoice.findByIdAndDelete(id);

    await logAction(req.user.id, 'DELETE', 'Invoice', id);

    req.flash('success', 'Invoice deleted successfully');
    res.redirect('/invoices')
}))


module.exports = router;