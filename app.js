if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

const createError = require('http-errors');
const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');

// routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const passportSetup = require('./config/passportSetup');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const { CLIENT_URL } = require('./constants');

// body parser
app.use(bodyParser.urlencoded({ extended: true }));

// cookie session
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.SESSION_SECRET],
  })
);

// initialize passport
app.use(passport.initialize());

// deserialize cookie from the browser
app.use(
  passport.session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

// connect to mongoDB
mongoose.set('useCreateIndex', true);
mongoose
  .connect(require('./config/keys').mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    mongoose.connection.readyState == 1
      ? console.log('connected to mongoDB server')
      : console.log('failed connection to mongoDB server');
  })
  .catch(error => console.error(error));

app.use(
  cors({
    origin: `${CLIENT_URL}`,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setup routes
app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.send(err);
  console.error(err.stack);
});

module.exports = app;
