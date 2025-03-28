const User = require('../models/userModel');
const AppError = require('../utils/appError');
//const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

//ver usuário por id
exports.getUser = (req, res) => {
  console.log('ID recebido:', req.params.id); // Adicione esse log
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
//ver todos os usuários
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  //const tours = await Tour.find().where('duration').equals(5);
  res.status(200).json({
    result: users.length,
    status: 'success',
    message: users,
  });
});

//criar usuário
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
exports.delUser = catchAsync(async (req, res, next) => {
  const selectedUser = await User.findByIdAndDelete(req.params.id);
  if (!selectedUser) {
    next(new AppError('User does not exist'), 400);
  }
  res.status(204).json({
    status: 'success',
  });
});
