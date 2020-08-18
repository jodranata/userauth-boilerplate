const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/user.model');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  host: config.MAIL_HOST,
  port: config.MAIL_PORT,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const signUpController = (req, res) => {
  const {
    user_auth: { email },
  } = req;
  User.findOne({ email }).exec((err, user) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (user) return res.status(400).json({ success: false, message: 'Email is taken' });
    jwt.sign(
      req.user_auth,
      config.JWT_ACTIVATION_SECRET,
      { expiresIn: '3d' },
      (signErr, encoded) => {
        if (signErr)
          return res
            .status(400)
            .json({ success: false, message: 'Failed to encode data' });
        const emailData = {
          from: 'jackofall@trades.com',
          to: email,
          subject: 'Account activation link',
          html: `
                <h1>Please use the following to activate your account</h1>
                <a href="${config.CLIENT_URL}/users/activate/${encoded}">Activate your account</a>
                <hr />
                <p>This email may containe sensitive information</p>
                <p>${config.CLIENT_URL}</p>
    `,
        };
        transporter.sendMail(emailData, err => {
          if (err)
            return res.status(400).json({
              success: false,
              message: 'Cannot sent verification link to email',
            });
          return res.json({
            success: true,
            message: 'Activation link has been sent to your email',
          });
        });
      },
    );
  });
};
const activationController = (req, res) => {
  const {
    body: { token },
  } = req;

  if (!token)
    return res
      .status(400)
      .json({ success: false, message: 'Missing token, please try again' });

  jwt.verify(token, config.JWT_ACTIVATION_SECRET, (err, userData) => {
    if (err)
      return res
        .status(400)
        .json({ success: false, message: 'Link has expired, register again' });
    const newUser = new User(userData);
    newUser
      .save()
      .then(savedData =>
        res.json({
          success: true,
          message: 'Sign up success',
          user: {
            email: savedData.email,
            firstName: savedData.firstName,
            lastName: savedData.lastName,
            fullName: savedData.fullName,
            userName: savedData.userName,
            _id: savedData._id,
          },
        }),
      )
      .catch(err =>
        res.status(500).json({
          success: false,
          message: 'Internal Server Error',
          error: err,
        }),
      );
  });
};
const signInController = (req, res) => {
  const {
    body: { email, userName, password },
  } = req;
  const query = {};
  if (email) {
    query.email = email;
  } else {
    query.userName = userName;
  }

  User.findOne(query).exec((err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    if (!user)
      return res.status(400).json({
        success: false,
        message: `Account with that username/email doesn't exist`,
      });
    user.authenticate(password, (authErr, isMatch) => {
      if (authErr)
        return res
          .status(400)
          .json({ success: false, message: 'Failed to authenticate' });
      if (!isMatch)
        return res.status(403).json({
          success: false,
          message: 'Wrong Password, please try again',
        });

      const { email, userName, firstName, lastName, fullName, _id } = user;

      jwt.sign(
        { _id: user._id },
        config.JWT_SIGN_SECRET,
        { expiresIn: '3h' },
        (err, token) => {
          if (err)
            return res
              .status(400)
              .json({ success: false, message: 'Cannot create token' });
          return res.json({
            success: true,
            message: `Welcome back ${firstName}`,
            user: {
              email,
              userName,
              firstName,
              lastName,
              fullName,
              _id,
            },
            token,
          });
        },
      );
    });
  });
};
const forgotPasswordController = (req, res) => {
  const {
    user_auth: { email },
  } = req;
  User.findOne({ email }).exec((err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: 'Internal server Error' });
    if (!user)
      return res.status(400).json({
        success: false,
        message: 'There is no account with that email',
      });
    jwt.sign(
      { _id: user._id, email: user.email },
      config.JWT_FORGOT_SECRET,
      { expiresIn: '30d' },
      (signErr, token) => {
        if (signErr)
          return res
            .status(422)
            .json({ success: false, message: 'Failed to create token' });
        const emailData = {
          from: 'jackofall@trades.com',
          to: email,
          subject: 'Reset password',
          html: `
                <h1>Please use the following to reset your password</h1>
                <a href="${config.CLIENT_URL}/reset/password/${token}">Activate your account</a>
                <hr />
                <p>This email may containe sensitive information</p>
                <p>${config.CLIENT_URL}</p>
    `,
        };
        transporter.sendMail(emailData, err => {
          if (err)
            return res.status(400).json({
              success: false,
              message: 'Cannot sent reset password link to email',
            });
          return res.json({
            success: true,
            message: 'reset password link has been sent to your email',
          });
        });
      },
    );
  });
};

const decodeResetTokenController = (req, res) => {
  const {
    params: { token },
  } = req;
  if (!token) return res.status(400).json({ success: false, message: 'Token required' });

  jwt.verify(token, config.JWT_FORGOT_SECRET, (err, decoded) => {
    if (err) return res.status(422).json({ success: false, message: 'Expired Link' });
    return res.json({ success: true, email: decoded.email });
  });
};

const resetPasswordController = (req, res) => {
  const {
    user_auth: { email, password, confirmedPassword },
  } = req;

  User.findOne({ email }).exec((err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    if (password && confirmedPassword.trim()) {
      user.password = password;
    }
    user.save(err => {
      if (err)
        return res
          .status(400)
          .json({ success: false, message: 'Failed to reset password' });
      return res.json({
        success: true,
        message: 'Successfully reset password',
      });
    });
  });
};

const requireSignIn = expressJwt({
  secret: config.JWT_SIGN_SECRET,
  algorithms: ['Hs256'],
});

const googleClient = new OAuth2Client(config.GOOGLE_APP); // -> GCP account for authentication

const googleAuthController = (req, res) => {
  const {
    body: { idToken },
  } = req;

  googleClient
    .verifyIdToken({ idToken, audience: config.GOOGLE_APP })
    .then(ticket => {
      const payload = ticket.getPayload();
      const {
        email_verified,
        email,
        given_name: gFirstName,
        family_name: gLastName,
      } = payload;
      if (!email_verified)
        return res
          .status(403)
          .json({ success: false, message: 'Google account is not verified' });
      User.findOne({ email }).exec((err, user) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' });
        if (user) {
          const { email, _id, userName, firstName, lastName, fullName } = user;
          jwt.sign(
            { _id },
            config.JWT_SIGN_SECRET,
            { expiresIn: '3h' },
            (signErr, signToken) => {
              if (signErr)
                return res
                  .status(400)
                  .json({ success: false, message: 'Failed to authenticate' });
              return res.json({
                success: true,
                message: `Welcome back ${firstName}`,
                token: signToken,
                user: {
                  email,
                  _id,
                  userName,
                  firstName,
                  lastName,
                  fullName,
                },
              });
            },
          );
        }
        const gPassword = email + config.JWT_ACTIVATION_SECRET;
        const gUser = {
          email,
          userName: email,
          password: gPassword,
          firstName: gFirstName,
          lastName: gLastName,
        };
        const newUser = new User(gUser);
        newUser.save((saveErr, newUserData) => {
          if (saveErr)
            return res
              .status(500)
              .json({ success: false, message: 'Internal Server Error' });
          const { email, _id, userName, firstName, lastName, fullName } = newUserData;
          jwt.sign(
            { _id: newUserData._id },
            config.JWT_SIGN_SECRET,
            { expiresIn: '3h' },
            (signErr, signToken) => {
              if (signErr)
                return res
                  .status(400)
                  .json({ success: false, message: 'Failed to authenticate' });

              return res.json({
                success: true,
                message: `Welcome back ${firstName}`,
                token: signToken,
                user: {
                  email,
                  _id,
                  userName,
                  firstName,
                  lastName,
                  fullName,
                },
              });
            },
          );
        });
      });
    })
    .catch(gErr =>
      res.status(422).json({
        success: false,
        message: 'Failed to authenticate with this google account',
        error: gErr,
      }),
    );
};

module.exports = {
  signUpController,
  signInController,
  activationController,
  decodeResetTokenController,
  forgotPasswordController,
  resetPasswordController,
  googleAuthController,
  requireSignIn,
};
