const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { setCurrentCompany } = require('./middleware');


const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');


const User = require('./models/users');
const Client = require('./models/clients');
const Invoice = require('./models/invoices');
const Company = require('./models/companies');

const usersRoutes = require('./routes/users');
const companiesRoutes = require('./routes/companies');
const accountsRoutes = require('./routes/accounts');
const clientsRoutes = require('./routes/clients');
const invoicesRoutes = require('./routes/invoices');
const transactionRoutes = require('./routes/transactions');


mongoose.connect('mongodb://localhost:27017/mamoolah');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/mamoolah',
        secret: 'badSecret!',
        touchAfter: 24 * 60 * 60
    }),
    name: 'session',
    secret: 'badSecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(setCurrentCompany);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'joe@john.com', username: 'Joe' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
});



app.use('/users', usersRoutes);
app.use('/companies', companiesRoutes);
app.use('/accounts', accountsRoutes);
app.use('/clients', clientsRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/transactions', transactionRoutes);



app.get('/', (req, res) => {
    res.render('home')
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



app.listen(3000, () => {
    console.log("Ma'Moolah served on PORT 3000")
})


