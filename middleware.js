const Company = require('./models/companies');
const AuditLog = require('./models/auditLog');



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/users/login');
    }
    next();
}


module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.setCurrentCompany = async (req, res, next) => {
    if (req.session.currentCompanyId) {
        const currentCompany = await Company.findById(req.session.currentCompanyId);
        res.locals.currentCompany = currentCompany;
    } else if (req.user && req.user.defaultCompanyId) {
        const currentCompany = await Company.findById(req.user.defaultCompanyId);
        res.locals.currentCompany = currentCompany;
    } else {
        res.locals.currentCompany = null;
    }
    next();
}



module.exports.logAction = async (userId, action, entity, entityId, details = {}) => {
    const auditLog = new AuditLog({
        userId,
        action,
        entity,
        entityId,
        details
    });
    await auditLog.save();
};

