const express = require('express');
const route = express.Router();

const validateAuth = require('../middlewares/validationMiddleware');
const {
  updatePasswordController,
  updateProfileController,
} = require('../controllers/user.controller');

route.put('/update/password', validateAuth, updatePasswordController);
route.put('/update/profile', validateAuth, updateProfileController);

module.exports = route;
