const Joi = require('joi');
const { create } = require('./models/users');
const companies = require('./models/companies');

module.exports.userCreateSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phone: Joi.string().allow("", null),
        cell: Joi.string().allow("", null),
        street: Joi.string().allow("", null),
        city: Joi.string().allow("", null),
        state: Joi.string().allow("", null),
        code: Joi.string().allow("", null),
        country: Joi.string().allow("", null),
        email: Joi.string().required(),
        password: Joi.string().required(),
    }).required()
});

module.exports.userUpdateSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phone: Joi.string().allow("", null),
        cell: Joi.string().allow("", null),
        street: Joi.string().allow("", null),
        city: Joi.string().allow("", null),
        state: Joi.string().allow("", null),
        code: Joi.string().allow("", null),
        country: Joi.string().allow("", null),
        email: Joi.string().required(),
    }).required()
});

module.exports.pwdUpdateSchema = Joi.object({
    user: Joi.object({
        password: Joi.string().required(),
    }).required()
});

module.exports.companyCreateSchema = Joi.object({
    company: Joi.object({
        name: Joi.string().required(),
        logo: Joi.string().allow("", null),
        compNumber: Joi.number().allow("", null),
        compType: Joi.string().allow("", null),
        compStreet: Joi.string().allow("", null),
        compCity: Joi.string().allow("", null),
        compState: Joi.string().allow("", null),
        compCode: Joi.string().allow("", null),
        compCountry: Joi.string().allow("", null),
        email: Joi.string().allow("", null),
        phone: Joi.string().allow("", null),
        website: Joi.string().allow("", null),
        gstNumber: Joi.string().allow("", null),
        pstNumber: Joi.string().allow("", null),
        hstNumber: Joi.string().allow("", null),
        gstRate: Joi.number().allow("", null),
        pstRate: Joi.number().allow("", null),
        hstRate: Joi.number().allow("", null),
        role: Joi.string().valid('Owner', 'Admin', 'Employee').required(),
        invoiceNumberPrefix: Joi.string().allow("", null),
        currentInvoiceNumber: Joi.number().allow("", null)
    }).required()
});

module.exports.companyUpdateSchema = Joi.object({
    company: Joi.object({
        name: Joi.string().required(),
        logo: Joi.string().allow("", null),
        compNumber: Joi.number().allow("", null),
        compType: Joi.string().allow("", null),
        compStreet: Joi.string().allow("", null),
        compCity: Joi.string().allow("", null),
        compState: Joi.string().allow("", null),
        compCode: Joi.string().allow("", null),
        compCountry: Joi.string().allow("", null),
        email: Joi.string().allow("", null),
        phone: Joi.string().allow("", null),
        website: Joi.string().allow("", null),
        gstNumber: Joi.string().allow("", null),
        pstNumber: Joi.string().allow("", null),
        hstNumber: Joi.string().allow("", null),
        gstRate: Joi.number().allow("", null),
        pstRate: Joi.number().allow("", null),
        hstRate: Joi.number().allow("", null),
        invoiceNumberPrefix: Joi.string().allow("", null),
        currentInvoiceNumber: Joi.number().allow("", null)
    }).required()
});

module.exports.accountSchema = Joi.object({
    account: Joi.object({
        accountName: Joi.string().required(),
        accountType: Joi.string().allow("", null),
        institution: Joi.string().allow("", null),
        accountNumber: Joi.string().allow("", null),
        currency: Joi.string().allow("", null),
        balance: Joi.number().default(0).required(),
        setMainAccount: Joi.boolean().optional()
    }).required()
});

module.exports.clientSchema = Joi.object({
    client: Joi.object({
        clientName: Joi.string().required(),
        firstName: Joi.string().allow("", null),
        lastName: Joi.string().allow("", null),
        phone: Joi.string().allow("", null),
        cell: Joi.string().allow("", null),
        fax: Joi.string().allow("", null),
        email: Joi.string().allow("", null),
        invoiceStreet: Joi.string().allow("", null),
        invoiceCity: Joi.string().allow("", null),
        invoiceState: Joi.string().allow("", null),
        invoiceCode: Joi.string().allow("", null),
        invoiceCountry: Joi.string().allow("", null),
        shipStreet: Joi.string().allow("", null),
        shipCity: Joi.string().allow("", null),
        shipState: Joi.string().allow("", null),
        shipCode: Joi.string().allow("", null),
        shipCountry: Joi.string().allow("", null),
    }).required()
});

module.exports.invoiceSchema = Joi.object({
    invoice: Joi.object({
        number: Joi.number().required(),
        client: Joi.string().required(),
        email: Joi.string().required(),
        date: Joi.date().required(),
        terms: Joi.number().required(),
        subtotal: Joi.number().required(),
        rebateType: Joi.string().valid('amount', 'percentage').required(),
        rebate: Joi.number().required(),
        gst: Joi.number().required(),
        pst: Joi.number().required(),
        hst: Joi.number().required(),
        total: Joi.number().required(),
        deposit: Joi.number().required(),
        elements: Joi.array().items(Joi.object({
            date: Joi.date().required(),
            description: Joi.string().required(),
            quantity: Joi.number().required(),
            rate: Joi.number().required(),
            fixed: Joi.number().required(),
            amount: Joi.number().required(),
            taxes: Joi.number().required(),
            workers: Joi.array().items(Joi.string()).allow(null)
        })).required()
    }).required()

});

module.exports.transactionSchema = Joi.object({
    transaction: Joi.object({
        bankTransactionId: Joi.string().required(),
        transactionDate: Joi.date().required(),
        type: Joi.string().valid('deposit', 'withdrawal').required(),
        accountId: Joi.string().required(),
        amount: Joi.number().min(0).required(),
        currency: Joi.string().required(),
        entityId: Joi.string().optional(),
        entityType: Joi.string().valid('Invoice', 'Expense', 'Revenue', 'Transfer').optional(),
        paymentMethod: Joi.string().valid('bank_transfer', 'credit_card', 'paypal', 'cash').required(),
        status: Joi.string().valid('pending', 'completed', 'failed').required(),
        processedBy: Joi.string().required(),
    }).required()
});