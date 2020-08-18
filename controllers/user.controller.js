const User = require('../models/user.model');

const updatePasswordController = (req, res) => {
  const {
    user_auth: {
      _id,
      password: newPassword,
      prevPassword,
      confirmedPassword: confirmedNewPassword,
    },
  } = req;

  User.findById(_id).exec((err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    if (!user) return res.status(400).json({ success: false, message: 'User Not Found' });
    user.authenticate(prevPassword, (err, isMatch) => {
      if (err)
        return res
          .status(400)
          .json({ success: false, message: 'Failed to authenticate' });
      if (!isMatch)
        return res
          .status(403)
          .json({ success: false, message: 'Wrong password, please try again' });
      if (newPassword !== confirmedNewPassword)
        return res
          .status(403)
          .json({ success: false, message: 'Match the new password' });
      user.password = newPassword;
      user.save((err, updatedUser) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' });
        return res.json({
          success: true,
          message: 'Password has been changed',
          user: {
            email: updatedUser.email,
            userName: updatedUser.userName,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            fullName: updatedUser.fullName,
            _id: updatedUser._id,
          },
        });
      });
    });
  });
};

const updateProfileController = (req, res) => {
  const {
    user_auth: { _id, email, userName, firstName, lastName },
  } = req;

  User.findById(_id).exec((err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    if (!user) return res.status(400).json({ success: false, message: 'User Not Found' });
    if (email) {
      user.email = email;
    }
    if (userName) {
      user.userName = userName;
    }
    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    user.save((err, updatedUser) => {
      if (err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      return res.json({
        success: true,
        message: 'Profile has been updated',
        user: {
          email: updatedUser.email,
          userName: updatedUser.userName,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: updatedUser.fullName,
          _id: updatedUser._id,
        },
      });
    });
  });
};

module.exports = { updatePasswordController, updateProfileController };
