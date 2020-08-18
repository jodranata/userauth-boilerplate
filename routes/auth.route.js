const express = require('express');
const router = express.Router();

const {
  signUpController,
  signInController,
  activationController,
  decodeResetTokenController,
  forgotPasswordController,
  resetPasswordController,
  googleAuthController,
} = require('../controllers/auth.controller');

// used for object validation in req body
const validateAuth = require('../middlewares/validationMiddleware');

router.post('/signup', validateAuth, signUpController);
router.post('/signin', validateAuth, signInController);
router.post('/forgot/password', validateAuth, forgotPasswordController);
router.post('/activate', activationController);
router.post('/reset/password', validateAuth, resetPasswordController);

router.get('/forgot/:token', decodeResetTokenController);
router.post('/register/oauth/google', googleAuthController);

module.exports = router;
