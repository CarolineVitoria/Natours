class AppError extends Error {
  //constructor é chamado cada vez que criamos um novo objeto dessa classe
  constructor(message, statuscode) {
    super(message);

    this.statusCode = statuscode;
    this.status = `${statuscode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
