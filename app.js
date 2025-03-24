const express = require('express');
const morgan = require('morgan');


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorHandler');

const app = express();

//1) Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//2) Route handlers

//routes

app.use('/api/users', userRouter);
app.use('/api/tours/', tourRouter);

app.all('*', (req, res, next) => {
  /*res.status(404).json({
    status: 'fail',
    message: `Cant find ${req.originalUrl} on this server!`,
  }); */
  /*const err = new Error(`Cant find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404; */

  next(new AppError(`Cant find ${req.originalUrl} on this server!`), 404); // se a função next recebe algum argumento o express já reconhece como que ouve um erro, então ele ignora todos os outros middlewares e vai direto para o middleware global de tratamento de erros
});

app.use(globalErrorHandler); // ao passar esses quatro argumentos o express já reconhece que é um middlware de erro

module.exports = app;
