require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { errors: celebrateErrorHandler } = require('celebrate');
const validationErrorHandler = require('./middleware/validationErrorHandler');
const enableCORS = require('./middleware/enableCORS');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const placesRouter = require('./routes/places');
const categoriesRouter = require('./routes/categories');
const tourRoutesRouter = require('./routes/tourRoutes');
const witRouter = require('./routes/wit');

const apiDocsRouter = require('./routes/apiDocs');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(enableCORS);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/places', placesRouter);
app.use('/categories', categoriesRouter);
app.use('/routes', tourRoutesRouter);
app.use('/wit', witRouter);

app.use('/api-docs', apiDocsRouter);

app.use(celebrateErrorHandler());
app.use(validationErrorHandler);

module.exports = app;
