const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // search in keyValue to get the field
  const value = err.keyValue[Object.keys(err.keyValue)[0]];
  const message = `Duplicate field value: "${value}". Please use an other value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErroDev = (err, res) => {
  console.log('No manipulador de erro dev');
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      errror: err,
    });
  }
  //Programing or the other unknow error: don't leak error details
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log error
    console.error('ERROR', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleJWTError = () =>
  new AppError('Invalid Token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again!', 401);

module.exports = (err, req, res, next) => {
  //console.log(err.stack); //cada erro obtém esse rastreamento de erro, essa pilha basicamente mostra onde esso erro aconteceu
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'; //500 é erro 400 é falha
  if (process.env.NODE_ENV === 'development') {
    sendErroDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //let error = err; //You can't clone the err-object without loosing some properties. So either you copy the name property manually to the clone, or don't clone the err-object (we've modified it yet by adding statusCode and status).

    // Mongoose bad ObjectID
    if (err.name === 'CastError') {
      err = handleCastErrorDB(err);
      console.log(err);
    }

    // Mongoose duplicate key/fields
    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      err = handleValidationErrorDB(err);
    }

    // JWT token error
    if (err.name === 'JsonWebTokenError') {
      err = handleJWTError();
    }

    //JWT expired token
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorProd(err, res);
  } else {
    console.log('provável erro no node_env');
    res.status(500).json({
      message: 'internal Error',
    });
  }
};
