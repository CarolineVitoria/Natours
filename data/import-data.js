const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then((con) => {
  console.log('DB connection is successful!');
});

console.log('NODE_ENV:', process.env.NODE_ENV);

//read json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'),
);

//import Data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data was successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
//delete all data drom db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully delectd!');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};
console.log(process.argv[2]);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
