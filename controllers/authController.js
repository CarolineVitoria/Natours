const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: 'sucess',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1-check if email and password exist
  if (!email || !password) {
    console.log(password, email);
    return next(new AppError('Email and Password need be filled in', 400));
  }
  //2-check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password'); //como a senha está como select false no model é necessário usar o +

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3- if everything ok, send to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 getting toker and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  // 2 verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //3 check if user exists, this is important in case the user delete his acount
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  //4 check if user changed password after the token was issued
  if (freshUser.changedPassWordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in Again.', 401),
    );
  }

  //Grant access to protected route
  req.user = freshUser;
  next();
});
