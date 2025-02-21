const express = require('express');
const { isLoggedIn, logAction } = require('../middleware');
const passport = require('passport');
const User = require('../models/users');
const Company = require('../models/companies');
const { userCreateSchema, userUpdateSchema, pwdUpdateSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { storeReturnTo } = require('../middleware');


const router = express.Router();


const validateUserCreate = (req, res, next) => {
    const { error } = userCreateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateUserUpdate = (req, res, next) => {
    const { error } = userUpdateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validatePwdUpdate = (req, res, next) => {
    const { error } = pwdUpdateSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/', catchAsync(async (req, res) => {
    const users = await User.find({});
    res.render('home', { users })
}))

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', validateUserCreate, catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body.user;
        const user = new User(req.body.user);
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            logAction(registeredUser._id, 'CREATE', 'User', registeredUser._id, { username: registeredUser.username });
            req.flash('success', "Welcome to Ma'Moolah : New user registered successfully");
            res.redirect(`/users/${registeredUser._id}/select`);
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/users/register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login' }), (req, res) => {
    const userID = req.user._id;
    req.flash('success', 'welcome back!');
    if (req.user.defaultCompanyId) {
        const redirectUrl = res.locals.returnTo || `/companies/${req.user.defaultCompanyId}`;
        delete res.locals.returnTo;
        res.redirect(redirectUrl);
    } else {
        const redirectUrl = res.locals.returnTo || `/users/${userID}/select`;
        delete res.locals.returnTo;
        res.redirect(redirectUrl);
    }

})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
});


router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const thisUser = await User.findById(req.params.id).populate('companies').populate('companies.users').populate('roles');
    res.render('users/show', { thisUser })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const thisUser = await User.findById(req.params.id);
    res.render('users/edit', { thisUser })
}))

router.put('/:id', isLoggedIn, validateUserUpdate, catchAsync(async (req, res) => {
    const { id } = req.params;

    const originalUser = await User.findById(id);
    const updatedUser = req.body.user;
    // Compare original and updated documents to find changed fields
    const changedFields = {};
    for (const key in updatedUser) {
        if (updatedUser[key] !== originalUser[key]) {
            changedFields[key] = {
                old: originalUser[key],
                new: updatedUser[key]
            };
        }
    }

    const user = await User.findByIdAndUpdate(id, { ...req.body.user }, { new: true });
    if (changedFields.username) {
        req.login(user, err => {
            if (err) return next(err);
            logAction(req.user.id, 'UPDATE', 'User', user._id, { updatedFields: changedFields });
            req.flash('success', 'User details updated successfully');
            res.redirect(`/users/${user._id}`);
        });
    } else {
        logAction(req.user.id, 'UPDATE', 'User', user._id, { updatedFields: changedFields });
        req.flash('success', 'User details updated successfully');
        res.redirect(`/users/${user._id}`);
    }
}))

router.get('/:id/changePwd', isLoggedIn, catchAsync(async (req, res) => {
    const thisUser = await User.findById(req.params.id);
    res.render('users/changePwd', { thisUser })
}))

router.put('/:id/changePwd', isLoggedIn, validatePwdUpdate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body.user;
    const user = await User.findById(id);

    const changedFields = {};

    await user.setPassword(updatedUser.password);
    await user.save();
    changedFields.password = { old: '********', new: '********' }; // Mask the password change in the log

    logAction(req.user.id, 'UPDATE', 'User', user._id, { updatedFields: changedFields.password });
    req.flash('success', 'User password updated successfully');
    res.redirect(`/users/${user._id}`)
}))

router.get('/:id/select', isLoggedIn, catchAsync(async (req, res) => {
    const thisUser = await User.findById(req.params.id).populate('companies').populate('companies.users').populate('roles');
    res.render('users/select', { thisUser })
}))

router.post('/:id/select', isLoggedIn, catchAsync(async (req, res) => {
    const { companyId, setDefault } = req.body;
    req.session.currentCompanyId = companyId;
    if (setDefault) {
        await User.findByIdAndUpdate(req.params.id, { defaultCompanyId: companyId });
    }
    req.flash('success', 'Company selected successfully');
    res.redirect(`/companies/${companyId}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    logAction(req.user.id, 'DELETE', 'User', user._id, { userName: user.username });
    req.flash('success', 'User deleted successfully');
    res.redirect('/')
}))


module.exports = router;