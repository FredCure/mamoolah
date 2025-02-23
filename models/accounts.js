const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['asset', 'liability', 'equity', 'income', 'expense', 'cogs'], required: true },
    subType: {
        type: String,
        enum: [
            'checking', 'savings', 'cash',
            'ar',            // Accounts Receivable
            'inventory',     // Inventory related
            'fixed_asset',   // Fixed assets like property, vehicles, equipment
            'prepaid',       // Prepaid expenses
            'credit_card',   // Credit card related
            'tax',           // Tax liabilities
            'mortgage',      // Mortgage liabilities
            'loan',          // General loans
            'capital',       // Owner's Capital
            'drawings',      // Owner's Drawings
            'retained',      // Retained Earnings
            'sales',         // Sales Revenue
            'service',       // Service Revenue
            'interest',      // Interest Income
            'rental',        // Rental Income
            'refund',        // Refunds & Rebates
            'rent_expense',  // Rent Expense
            'utilities',     // Utilities Expense
            'office_supplies', // Office Supplies Expense
            'salaries',      // Salaries & Wages
            'payroll_tax',   // Payroll Taxes
            'employee_benefits', // Employee Benefits
            'advertising',   // Advertising Expense
            'seo',           // Website & SEO Expense
            'travel',        // Business Travel Expense
            'meals',         // Meals & Entertainment Expense
            'bank_fees',     // Bank Fees Expense
            'loan_interest', // Loan Interest Expense
            'cc_fees',       // Credit Card Fees Expense
            'cloud',         // Cloud Services Expense
            'software',      // Software Subscriptions Expense
            'maintenance',   // Equipment Maintenance Expense
            'repairs',       // Building Repairs Expense
            'raw_material',  // Raw Materials Cost (COGS)
            'labor',         // Manufacturing Labor Cost (COGS)
            'shipping',      // Shipping & Freight Cost (COGS)
            'factory',       // Factory Overheads (COGS)
            'packaging',      // Packaging Costs (COGS)
            'other'
        ],
        required: true
    },
    code: { type: Number },
    description: { type: String },
    // parentAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    balance: { type: Number, default: 0, required: true },
    currency: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);