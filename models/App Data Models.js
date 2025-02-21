// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CompanyRole' }], // Roles in companies
  createdAt: { type: Date, default: Date.now }
});

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  taxRate: { type: Number, required: true }, // Default tax rate for the company
  createdAt: { type: Date, default: Date.now }
});

// Company Role Schema
const companyRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  role: { type: String, enum: ['Owner', 'Admin', 'Employee'], required: true }
});

// Client Schema
const clientSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Supplier Schema
const supplierSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true } // quantity * unitPrice
    }
  ],
  subtotal: { type: Number, required: true }, // Sum of item totals
  taxAmount: { type: Number, required: true }, // Calculated based on subtotal and taxRate
  totalAmount: { type: Number, required: true }, // subtotal + taxAmount
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      method: { type: String, required: true }
    }
  ],
  balance: { type: Number, required: true }, // totalAmount - sum of payments
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  transactionType: { type: String, enum: ['Payment', 'Refund', 'Adjustment'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Credit Card', 'Bank Transfer', 'Cash'], required: true },
  transactionDate: { type: Date, required: true },
  referenceNumber: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  category: { type: String, required: true }, // e.g., "Office Supplies", "Travel"
  description: { type: String },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Credit Card', 'Bank Transfer', 'Cash'], required: true },
  expenseDate: { type: Date, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiptUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Company: mongoose.model('Company', companySchema),
  CompanyRole: mongoose.model('CompanyRole', companyRoleSchema),
  Client: mongoose.model('Client', clientSchema),
  Supplier: mongoose.model('Supplier', supplierSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Expense: mongoose.model('Expense', expenseSchema)
};
