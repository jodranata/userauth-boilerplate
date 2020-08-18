const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'User',
      enum: ['User', 'Admin'],
    },
  },
  { timestamps: true },
);

UserSchema.virtual('password').set(function (password) {
  this._password = password;
});

UserSchema.methods = {
  authenticate: function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.hashed_password, (err, isMatch) => {
      if (err) return cb(err);
      return cb(null, isMatch);
    });
  },
  encryptPassword: function (password, cb) {
    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) return cb(err);
      return cb(null, hashed);
    });
  },
  generateFullname: function (firstName, lastName) {
    this.fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`;
  },
};

UserSchema.pre('validate', function (next) {
  if (!this._password) return next();
  this.encryptPassword(this._password, (err, encrypted) => {
    if (err) return next(err);
    this.hashed_password = encrypted;
    this.generateFullname(this.firstName, this.lastName); //
    return next();
  });
});

module.exports = mongoose.model('User', UserSchema);
