const mongoose = require('mongoose');
const validator = require('validator');
//name, email, password e passwordconfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require:true,
        minleght: [3, 'tha name needs be complete'],
    },
    email: {
        type: String,
        validator: [validator.isEmail],
        require: true,
        unique: true,
        lowecase: true,
    },
    password: {
        type: String,
        require: true,
        minleght: 8,
        maxlenght: 12
    },
    passwordConfirm: {
        type: String,
        require: true,
        minleght: 8,
        maxlenght: 12,
        validator: {function(val){
            return val === this.password;
        }}
    },
    photo: { //seria armazenado o caminho da foto, o caminho do sistema q armazena esses arquivos
        type: String,
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;