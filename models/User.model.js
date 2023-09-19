const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const EMAIL_PATTERN =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const PASSWORD_PATTERN = /^.{8,}$/i;
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es requerido'],
        match: [EMAIL_PATTERN, "Por favor, introduce un correo electrónico válido"]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        match: [PASSWORD_PATTERN, 'La contraseña debe contener mínimo 8 dígitos']
    }
}, 
{
    timestamps: true
}
)

userSchema.pre("save", function (next) {

    if (this.isModified("password")) {
      bcrypt
        .hash(this.password, SALT_ROUNDS)
        .then((hash) => {
          this.password = hash;
          next();
        })
        .catch((err) => next(err));
    } else {
      next();
    }
  });
  
  userSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
  };

  const User = mongoose.model('User', userSchema)

  module.exports = User