require('dotenv').config()

const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes')

// Database config
require('./config/db.config')

// Config express middlewares

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.use(logger('dev'));
app.use(express.json());

/* Routes */
const routes = require('./routes/routes.routes');
app.use('/', routes);

/* Handle errors */

// Middleware para cuando no encuentra ruta
app.use((req, res, next) => {
  next(createError(StatusCodes.NOT_FOUND, 'Route not found'))
})

// Middleware genérico de errores
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof mongoose.Error.ValidationError) {
    error = createError(StatusCodes.BAD_REQUEST, error)
  } else if (error instanceof mongoose.Error.CastError) {
    error = createError(StatusCodes.BAD_REQUEST, 'Resource not found')
  } else if (error.message.includes('E11000')) {
    error = createError(StatusCodes.BAD_REQUEST, 'Resource already exists')
  } else if (error instanceof jwt.JsonWebTokenError) {
    error = createError(StatusCodes.UNAUTHORIZED, error)
  } else if (!error.status) {
    error = createError(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const data = {};

  data.message = error.message;
  data.errors = error.errors
    ? Object.keys(error.errors).reduce(
      (errors, key) => {
        return {
          ...errors,
          [key]: error.errors[key].message || error.errors[key]
        }
      },
      {}
    ) : undefined

  res.status(error.status).json(data)
})


// Server listening

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Ready! Listening on port ${port}`);
});

  