const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlenght: [3, 'tha name needs be complete'],
  },
  email: {
    type: String,
    validate: [validator.isEmail],
    required: true,
    unique: true,
    lowecase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlenght: 8,
    maxlenght: 12,
    select: false, //não mostra esse campo quando se usa algum select
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    minlenght: 8,
    maxlenght: 12,
    //this only works on create and save!
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  photo: {
    //seria armazenado o caminho da foto, o caminho do sistema q armazena esses arquivos
    type: String,
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  //Only runs this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete the passwordconfirm field
  this.passwordConfirm = undefined;
  next();
});
//instece method está disponível a todos os documentos desse tipo
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//verify if the user has not changed his password after the token was issued
userSchema.methods.changedPassWordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //if the user changed his password
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  //False means not change
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
