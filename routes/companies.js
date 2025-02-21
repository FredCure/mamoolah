const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const User = require('../models/users');
const Company = require('../models/companies');
const Role = require('../models/companyRoles');
const { companyCreateSchema, companyUpdateSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


const router = express.Router();


const validateCompanyCreate = (req, res, next) => {
    const { error } = companyCreateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateCompanyUpdate = (req, res, next) => {
    const { error } = companyUpdateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/new', isLoggedIn, (req, res) => {
    res.render('companies/new');
})

router.post('/', isLoggedIn, validateCompanyCreate, catchAsync(async (req, res, next) => {
    const company = new Company(req.body.company);
    company.createdAt = Date.now();
    const thisUser = await User.findById(req.user.id);
    const role = new Role({ userId: thisUser.id, companyId: company.id, role: req.body.company.role });
    company.owners.push(thisUser);
    company.users.push(thisUser);
    thisUser.companies.push(company);
    thisUser.roles.push(role);
    await company.save();
    await thisUser.save();
    await role.save();
    await logAction(req.user.id, 'CREATE', 'Company', company._id, { companyName: company.name });
    req.session.currentCompanyId = company._id;
    req.flash('success', 'New company added successfully');
    res.redirect(`/companies/${company.id}`);
}))

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const thisCompany = await Company.findById(req.params.id)
        .populate('owners')
        .populate({
            path: 'users',
            populate: {
                path: 'roles',
                model: 'Role',
                match: { companyId: req.params.id }
            }
        });
    if (!thisCompany) {
        req.flash('error', 'Company not found');
        return res.redirect('/companies');
    }
    res.render('companies/show', { thisCompany })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const thisCompany = await Company.findById(req.params.id);
    res.render('companies/edit', { thisCompany })
}))

router.put('/:id', isLoggedIn, validateCompanyUpdate, catchAsync(async (req, res) => {
    const { id } = req.params;

    const originalCompany = await Company.findById(id);
    const updatedCompany = req.body.company;

    // Convert number fields back to numbers
    if (updatedCompany.compNumber) updatedCompany.compNumber = Number(updatedCompany.compNumber);
    if (updatedCompany.gstRate) updatedCompany.gstRate = Number(updatedCompany.gstRate);
    if (updatedCompany.pstRate) updatedCompany.pstRate = Number(updatedCompany.pstRate);
    if (updatedCompany.hstRate) updatedCompany.hstRate = Number(updatedCompany.hstRate);
    if (updatedCompany.currentInvoiceNumber) updatedCompany.currentInvoiceNumber = Number(updatedCompany.currentInvoiceNumber);

    // Compare original and updated documents to find changed fields
    const changedFields = {};
    for (const key in updatedCompany) {
        if (updatedCompany[key] !== originalCompany[key]) {
            changedFields[key] = {
                old: originalCompany[key],
                new: updatedCompany[key]
            };
        }
    }
    const company = await Company.findByIdAndUpdate(id, { ...req.body.company });
    await logAction(req.user.id, 'UPDATE', 'Company', company._id, { updatedFields: changedFields });
    req.flash('success', 'Company details updated successfully');
    res.redirect(`/companies/${company._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const company = await Company.findByIdAndDelete(id);
    await logAction(req.user.id, 'DELETE', 'Company', company._id, { companyName: company.name });
    req.flash('success', 'Company deleted successfully');
    res.redirect('/')
}))




module.exports = router;