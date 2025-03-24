const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNHANDKER REJECTION! Shutting down...');
  console.log(err.name, err.message);
    process.exit(1); 
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then((con) => {
  console.log('DB connection is successful!');
});

console.log('NODE_ENV:', process.env.NODE_ENV);

// start server
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App is runing on port http://localhost:${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDKER REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(()=> {
    process.exit(1); 
  });
}); //tratamento de erro para qualquer rejeição de promise. ou seja qualquer código assíncrono que não foi tratado

