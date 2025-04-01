// populateAccounts.js

const mongoose = require('mongoose');
const { Schema } = mongoose;
const Company = require('./models/companies');


// Define the Account schema using an expanded subType enum
const AccountSchema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['asset', 'liability', 'equity', 'income', 'expense', 'cogs'],
        required: true
    },
    // Expanded subType enum for more granular classification
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
    parentAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    balance: { type: Number, default: 0, required: true },
    currency: { type: String },
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

// Replace with your MongoDB connection string
const mongoURI = 'mongodb://localhost:27017,localhost:27018,localhost:27019/mamoolah?replicaSet=rs0';

// Dummy Company ID (replace with an actual Company ID if available)
const companyId = new mongoose.Types.ObjectId('67e17ee12b6154ac2250aff2');

// List of accounts for the full Chart of Accounts (COA)
const accounts = [
    // 1. Assets (What the Business Owns)
    // 💰 Cash Accounts
    {
        companyId,
        code: 1010,
        name: "Bank Account (Checking)",
        type: "asset",
        subType: "checking",
        description: "$2635.28 when splitted activities on August 5th, 2024",
        balance: 2635.28,
        currency: "CAD"
    },
    {
        companyId,
        code: 1020,
        name: "Bank Account (Savings)",
        type: "asset",
        subType: "savings",
        description: "Primary savings account",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 1030,
        name: "Petite Caisse",
        type: "asset",
        subType: "cash",
        description: "Small cash on hand",
        balance: 0.00,
        currency: "CAD"
    },
    // 💳 Accounts Receivable (A/R)
    {
        companyId,
        code: 1100,
        name: "Accounts Receivable",
        type: "asset",
        subType: "ar",
        description: "Money owed by customers",
        balance: 0.00,
        currency: "CAD"
    },
    // 📦 Inventory
    {
        companyId,
        code: 1200,
        name: "Finished Goods Inventory",
        type: "asset",
        subType: "inventory",
        description: "Inventory of finished goods",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 1210,
        name: "Raw Materials Inventory",
        type: "asset",
        subType: "inventory",
        description: "Inventory of raw materials",
        balance: 0.00,
        currency: "CAD"
    },
    // 🚗 Fixed Assets
    {
        companyId,
        code: 1300,
        name: "Property & Equipment",
        type: "asset",
        subType: "fixed_asset",
        description: "Buildings, land, and equipment",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 1310,
        name: "Vehicles",
        type: "asset",
        subType: "fixed_asset",
        description: "Company vehicles",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 1320,
        name: "Computers & Office Equipment",
        type: "asset",
        subType: "fixed_asset",
        description: "Computers, printers, and office equipment",
        balance: 0.00,
        currency: "CAD"
    },
    // 📝 Prepaid Expenses
    {
        companyId,
        code: 1400,
        name: "Prepaid Rent",
        type: "asset",
        subType: "prepaid",
        description: "Rent paid in advance",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 1410,
        name: "Prepaid Insurance",
        type: "asset",
        subType: "prepaid",
        description: "Insurance premiums paid in advance",
        balance: 0.00,
        currency: "CAD"
    },

    // 2. Liabilities (What the Business Owes)
    // 📜 Accounts Payable (A/P)
    {
        companyId,
        code: 2000,
        name: "Accounts Payable",
        type: "liability",
        subType: "other",
        description: "Unpaid supplier bills",
        balance: 0.00,
        currency: "CAD"
    },
    // 💳 Short-Term Liabilities
    {
        companyId,
        code: 2100,
        name: "Credit Cards Payable",
        type: "liability",
        subType: "credit_card",
        description: "Outstanding credit card balances",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 2110,
        name: "Taxes Payable",
        type: "liability",
        subType: "tax",
        description: "Sales tax, payroll tax, etc.",
        balance: 0.00,
        currency: "CAD"
    },
    // 🏦 Long-Term Liabilities
    {
        companyId,
        code: 2200,
        name: "Mortgage Payable",
        type: "liability",
        subType: "mortgage",
        description: "Long-term mortgage liabilities",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 2210,
        name: "Business Loans Payable",
        type: "liability",
        subType: "loan",
        description: "Long-term business loans",
        balance: 0.00,
        currency: "CAD"
    },

    // 3. Equity (Owner’s Interest in the Business)
    {
        companyId,
        code: 3000,
        name: "Owner’s Capital",
        type: "equity",
        subType: "capital",
        description: "Owner’s initial investment",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 3010,
        name: "Owner’s Drawings",
        type: "equity",
        subType: "drawings",
        description: "Withdrawals by the owner",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 3020,
        name: "Retained Earnings",
        type: "equity",
        subType: "retained",
        description: "Profits reinvested in the business",
        balance: 0.00,
        currency: "CAD"
    },

    // 4. Income (Revenue Accounts)
    // 💰 Sales Revenue
    {
        companyId,
        code: 4000,
        name: "Product Sales",
        type: "income",
        subType: "sales",
        description: "Revenue from product sales",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 4010,
        name: "Service Revenue",
        type: "income",
        subType: "service",
        description: "Revenue from services provided",
        balance: 0.00,
        currency: "CAD"
    },
    // 🎁 Other Income
    {
        companyId,
        code: 4100,
        name: "Interest Income",
        type: "income",
        subType: "interest",
        description: "Income from interest earned",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 4110,
        name: "Rental Income",
        type: "income",
        subType: "rental",
        description: "Income from property rentals",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 4120,
        name: "Refunds & Rebates",
        type: "income",
        subType: "refund",
        description: "Revenue adjustments from refunds or rebates",
        balance: 0.00,
        currency: "CAD"
    },

    // 5. Expenses (What the Business Spends)
    // 🏠 Operating Expenses
    {
        companyId,
        code: 5000,
        name: "Rent Expense",
        type: "expense",
        subType: "rent_expense",
        description: "Expense for office or facility rent",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5010,
        name: "Utilities Expense",
        type: "expense",
        subType: "utilities",
        description: "Expense for electricity, water, internet, etc.",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5020,
        name: "Office Supplies Expense",
        type: "expense",
        subType: "office_supplies",
        description: "Expense for office supplies",
        balance: 0.00,
        currency: "CAD"
    },
    // 💼 Payroll Expenses
    {
        companyId,
        code: 5100,
        name: "Salaries & Wages Expense",
        type: "expense",
        subType: "salaries",
        description: "Employee compensation costs",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5110,
        name: "Payroll Taxes Expense",
        type: "expense",
        subType: "payroll_tax",
        description: "Payroll related taxes",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5120,
        name: "Employee Benefits Expense",
        type: "expense",
        subType: "employee_benefits",
        description: "Costs for employee benefits",
        balance: 0.00,
        currency: "CAD"
    },
    // 📢 Marketing & Advertising
    {
        companyId,
        code: 5200,
        name: "Advertising Expense",
        type: "expense",
        subType: "advertising",
        description: "Expense for ad campaigns",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5210,
        name: "Website & SEO Expense",
        type: "expense",
        subType: "seo",
        description: "Expense for website hosting and SEO services",
        balance: 0.00,
        currency: "CAD"
    },
    // 🚗 Travel & Entertainment
    {
        companyId,
        code: 5300,
        name: "Business Travel Expense",
        type: "expense",
        subType: "travel",
        description: "Expense for business travel",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5310,
        name: "Meals & Entertainment Expense",
        type: "expense",
        subType: "meals",
        description: "Expense for meals and entertainment",
        balance: 0.00,
        currency: "CAD"
    },
    // 💰 Financial Expenses
    {
        companyId,
        code: 5400,
        name: "Bank Fees Expense",
        type: "expense",
        subType: "bank_fees",
        description: "Expense for bank fees",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5410,
        name: "Loan Interest Expense",
        type: "expense",
        subType: "loan_interest",
        description: "Expense for interest on loans",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5420,
        name: "Credit Card Fees Expense",
        type: "expense",
        subType: "cc_fees",
        description: "Expense for credit card fees",
        balance: 0.00,
        currency: "CAD"
    },
    // 💻 Software & Technology
    {
        companyId,
        code: 5500,
        name: "Cloud Services Expense",
        type: "expense",
        subType: "cloud",
        description: "Expense for cloud services (AWS, Google Workspace, etc.)",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5510,
        name: "Software Subscriptions Expense",
        type: "expense",
        subType: "software",
        description: "Expense for software subscriptions",
        balance: 0.00,
        currency: "CAD"
    },
    // 🛠 Maintenance & Repairs
    {
        companyId,
        code: 5600,
        name: "Equipment Maintenance Expense",
        type: "expense",
        subType: "maintenance",
        description: "Expense for maintaining equipment",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 5610,
        name: "Building Repairs Expense",
        type: "expense",
        subType: "repairs",
        description: "Expense for building repairs",
        balance: 0.00,
        currency: "CAD"
    },

    // 6. Cost of Goods Sold (COGS)
    // 📦 Inventory-Related Costs
    {
        companyId,
        code: 6000,
        name: "Raw Materials Cost",
        type: "cogs",
        subType: "raw_material",
        description: "Direct cost of raw materials",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 6010,
        name: "Manufacturing Labor Cost",
        type: "cogs",
        subType: "labor",
        description: "Direct labor costs in production",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 6020,
        name: "Shipping & Freight Cost",
        type: "cogs",
        subType: "shipping",
        description: "Direct shipping and freight costs",
        balance: 0.00,
        currency: "CAD"
    },
    // 🛠 Production Costs
    {
        companyId,
        code: 6100,
        name: "Factory Overheads",
        type: "cogs",
        subType: "factory",
        description: "Factory overhead expenses",
        balance: 0.00,
        currency: "CAD"
    },
    {
        companyId,
        code: 6110,
        name: "Packaging Costs",
        type: "cogs",
        subType: "packaging",
        description: "Cost for packaging goods",
        balance: 0.00,
        currency: "CAD"
    }
];

async function populateAccounts() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Optionally, remove existing accounts for this company
        await Account.deleteMany({ companyId });

        // Insert the accounts into the collection
        const result = await Account.insertMany(accounts);
        console.log(`Inserted ${result.length} accounts.`);
    } catch (error) {
        console.error('Error populating accounts:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

populateAccounts();
