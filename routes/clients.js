const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const Client = require('../models/clients');
const Invoice = require('../models/invoices');
const Company = require('../models/companies');
const { clientSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


const router = express.Router();


const validateClient = (req, res, next) => {
    const { error } = clientSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const clients = await Client.find({});
    res.render('clients/index', { clients })
}))

router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    const companyId = res.locals.currentCompany._id; // Assuming the company ID is stored in the user's session
    const company = await Company.findById(companyId).populate('users');
    res.render('clients/new', { users: company.users });
}))

router.post('/', isLoggedIn, validateClient, catchAsync(async (req, res, next) => {
    const client = new Client(req.body.client);
    client.companyId = res.locals.currentCompany._id;
    await client.save();
    await logAction(req.user.id, 'CREATE', 'Client', client._id, { clientName: client.clientName });
    req.flash('success', 'New client added successfully');
    res.redirect(`/clients/${client.id}`);
}))

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const thisClient = await Client.findById(req.params.id).populate('salesRep').populate('invoices');
    if (!thisClient) {
        req.flash('error', 'Client not found');
        return res.redirect('/clients');
    }
    res.render('clients/show', { thisClient })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const thisClient = await Client.findById(req.params.id);
    console.log(thisClient);
    const companyId = res.locals.currentCompany._id; // Assuming the company ID is stored in the user's session
    const company = await Company.findById(companyId).populate('users');
    res.render('clients/edit', { thisClient, users: company.users });
}))

router.put('/:id', isLoggedIn, validateClient, catchAsync(async (req, res) => {
    const { id } = req.params;

    const originalClient = await Client.findById(id);
    const updatedClient = req.body.client;

    // Compare original and updated documents to find changed fields
    const changedFields = {};
    for (const key in updatedClient) {
        if (updatedClient[key] !== originalClient[key]) {
            changedFields[key] = {
                old: originalClient[key],
                new: updatedClient[key]
            };
        }
    }

    const client = await Client.findByIdAndUpdate(id, { ...req.body.client });
    if (Object.keys(changedFields).length > 0) {
        await logAction(req.user.id, 'UPDATE', 'Client', client._id, { updatedFields: changedFields });
    }
    req.flash('success', 'Client details updated successfully');
    res.redirect(`/clients/${client._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    await logAction(req.user.id, 'DELETE', 'Client', client._id, { clientName: client.clientName });
    req.flash('success', 'Client deleted successfully');
    res.redirect('/clients')
}))


module.exports = router;