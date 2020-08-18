const { validationResult } = require('express-validator');

// Validation Schema
const {
  registerSchema,
  signInSchema,
  emailSchema,
  resetPasswordSchema,
  updatePassSchema,
  updateProfileSchema,
} = require('../helpers/validationSchema');

//  turn it into object
const schemaOption = reqtype =>
  ({
    signup: registerSchema,
    signin: signInSchema,
    forgotpassword: emailSchema,
    resetpassword: resetPasswordSchema,
    updatepassword: updatePassSchema,
    updateprofile: updateProfileSchema,
  }[reqtype]);

//validate auth middleware based on req.url
const validateAuth = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(err => err.msg);
    return res.status(422).json({ success: false, message: firstError });
  }
  const reqType = req.url.match(/[^\/]+\w/gi).join('');

  const validationSchema = schemaOption(reqType);
  const { error, value } = validationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res.status(400).json({ success: false, error: error.message });
    throw new Error(error);
  }
  req.user_auth = value;
  next();
};

module.exports = validateAuth;
