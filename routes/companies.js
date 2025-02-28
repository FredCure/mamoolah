const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Invite = require('../models/invites');
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
};

const validateCompanyUpdate = (req, res, next) => {
    const { error } = companyUpdateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};


router.get('/new', isLoggedIn, (req, res) => {
    res.render('companies/new');
});

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
}));

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
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const thisCompany = await Company.findById(req.params.id);
    res.render('companies/edit', { thisCompany })
}));

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
}));

router.get('/:id/compUsers', isLoggedIn, catchAsync(async (req, res) => {
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
    res.render('companies/compUsers', { thisCompany })
}));

router.put('/:companyId/compUsers/:userId/update-role', isLoggedIn, catchAsync(async (req, res) => {
    const { companyId, userId } = req.params;
    const { role } = req.body;
    const thisCompany = await Company.findById(companyId);
    const existingRole = await Role.findOne({ userId, companyId });

    if (!existingRole) {
        req.flash('error', 'Role not found');
        return res.redirect(`/companies/${companyId}/compUsers`);
    }

    // Check if the role is being changed from "Owner"
    if (existingRole.role === 'Owner' && role !== 'Owner') {
        if (thisCompany.owners.length === 1) {
            req.flash('error', 'Cannot change role. This user is the only owner left. Assign another owner before changing this role.');
            return res.redirect(`/companies/${companyId}/compUsers`);
        }
        thisCompany.owners = thisCompany.owners.filter(ownerId => ownerId.toString() !== userId);
    }

    // Check if the role is being changed to "Owner"
    if (existingRole.role !== 'Owner' && role === 'Owner') {
        thisCompany.owners.push(userId);
    }

    existingRole.role = role;
    await existingRole.save();
    await thisCompany.save();

    await logAction(req.user.id, 'UPDATE', 'Role', existingRole._id, { companyName: thisCompany.name, user: userId, role: role });
    req.flash('success', 'Role updated successfully');
    res.redirect(`/companies/${companyId}/compUsers`);
}));

router.put('/:companyId/compUsers/:userId/remove', isLoggedIn, catchAsync(async (req, res) => {
    const { companyId, userId } = req.params;

    // Find the company
    const thisCompany = await Company.findById(companyId);
    if (!thisCompany) {
        req.flash('error', 'Company not found');
        return res.redirect(`/companies/${companyId}/compUsers`);
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect(`/companies/${companyId}/compUsers`);
    }

    // Check if the user is the only owner
    if (thisCompany.owners.length === 1 && thisCompany.owners[0].toString() === userId) {
        req.flash('error', 'Cannot remove user. This user is the only owner left. Assign another owner before removing this user.');
        return res.redirect(`/companies/${companyId}/compUsers`);
    }

    // Find the role associated with the company and the user
    const role = await Role.findOne({ userId, companyId });
    if (!role) {
        req.flash('error', 'Role not found');
        return res.redirect(`/companies/${companyId}/compUsers`);
    }

    // Remove the user ID from the company users
    thisCompany.users = thisCompany.users.filter(u => u.toString() !== userId);

    // Remove the user ID from the company owners
    thisCompany.owners = thisCompany.owners.filter(o => o.toString() !== userId);

    // Remove the company ID from the user companies
    user.companies = user.companies.filter(c => c.toString() !== companyId);

    // Remove the role ID from the user
    user.roles = user.roles.filter(r => r.toString() !== role._id.toString());

    // Delete the role
    await Role.findByIdAndDelete(role._id);

    // Save the changes
    await thisCompany.save();
    await user.save();

    await logAction(req.user.id, 'REMOVE', 'User', user._id, { companyName: thisCompany.name, user: userId });
    req.flash('success', 'User removed from company successfully');
    res.redirect(`/companies/${companyId}/compUsers`);
}));

router.get('/:companyId/invite', isLoggedIn, catchAsync(async (req, res) => {
    const thisCompany = await Company.findById(req.params.companyId);
    if (!thisCompany) {
        req.flash('error', 'Company not found');
        return res.redirect('/companies');
    }
    res.render('companies/invite', { thisCompany });
}));

router.post('/:companyId/invite', isLoggedIn, catchAsync(async (req, res) => {
    const { name, email, role } = req.body;
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    // Check if a user with the same email is already one of the company's users
    const existingUser = company.users.find(user => user.email === email);
    if (existingUser) {
        req.flash('error', 'A user with this email is already a member of the company.');
        return res.redirect(`/companies/${companyId}/compUsers`);
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // Create a new invite
    const invite = new Invite({ email, companyId, role, token });
    await invite.save();

    // Send the invite email
    const transporter = nodemailer.createTransport({
        host: 'fredcure.ca',
        port: 465,
        secure: true,
        auth: {
            user: 'fred@fredcure.ca',
            pass: 'xxxxxx'
        }
    });

    const mailOptions = {
        from: 'fred@fredcure.ca',
        to: email,
        subject: `You have been invited to join ${company.name}`,
        text: `You have been invited to join ${company.name}. Please click the following link to accept the invitation: localhost:3000/companies/invite/${token}`
    };

    await transporter.sendMail(mailOptions);

    req.flash('success', 'Invite sent successfully');
    res.redirect(`/companies/${companyId}/compUsers`);
}));

router.get('/invite/:token', catchAsync(async (req, res) => {
    const { token } = req.params;
    const invite = await Invite.findOne({ token });

    if (!invite) {
        req.flash('error', 'Invalid or expired token');
        return res.redirect('/');
    }

    let currentUser = null;
    if (req.isAuthenticated()) {
        currentUser = req.user;
    }

    res.render('companies/accept', { invite });
}));

router.post('/:token/accept', catchAsync(async (req, res) => {
    const { token } = req.params;
    const { username, email, password, firstName, lastName } = req.body;
    const invite = await Invite.findOne({ token });

    if (!invite) {
        req.flash('error', 'Invalid or expired token');
        return res.redirect('/');
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({ username, email, firstName, lastName });
        await User.register(user, password);
    }

    const company = await Company.findById(invite.companyId);

    // Check if the user is already a member of the company
    const existingUser = company.users.find(u => u.email === email);
    if (existingUser) {
        req.flash('error', 'You are already a member of this company.');
        return res.redirect('/users/login');
    }

    const role = new Role({ userId: user._id, companyId: company._id, role: invite.role });

    company.users.push(user);
    user.companies.push(company);
    user.roles.push(role);

    await company.save();
    await user.save();
    await role.save();

    await Invite.findByIdAndDelete(invite._id);

    req.flash('success', 'You have successfully joined the company');
    res.redirect('/users/login');
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const company = await Company.findByIdAndDelete(id);
    await logAction(req.user.id, 'DELETE', 'Company', company._id, { companyName: company.name });
    req.flash('success', 'Company deleted successfully');
    res.redirect('/')
}));




module.exports = router;