const joi = require('joi');

const userDetailSchema = joi.object({
  firstName: joi
    .string()
    .lowercase()
    .trim()
    .required()
    .ruleset.min(3)
    .message('name must have at least 3 chars'),
  lastName: joi.string().allow('').optional().trim().default(''),
});

const idSchema = joi.object({
  userName: joi
    .string()
    .trim()
    .alphanum()
    .alter({
      register: schema => schema.required(),
    })
    .ruleset.min(5)
    .max(30)
    .rule({
      message: 'username must have at least 5 chars and less than 30 chars',
    }),
  email: joi
    .string()
    .alter({
      register: schema => schema.required(),
    })
    .lowercase()
    .ruleset.email({ minDomainSegments: 2, tlds: { allow: true } })
    .rule({ message: 'Invalid email address' }),
});

const passwordSchema = joi.object({
  password: joi
    .string()
    .required()
    .ruleset.pattern(new RegExp('^(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{6,}$'))
    .rule({
      message: 'password must have at least 6 chars, an uppercase and lowercase letters',
    }),
  confirmedPassword: joi.ref('password'),
});

const emailSchema = joi.object({
  email: joi
    .string()
    .required()
    .lowercase()
    .ruleset.email({ minDomainSegments: 2, tlds: { allow: true } })
    .rule({ message: 'Invalid email address' }),
});

const uniqueIdSchema = joi.object({
  _id: joi.string().required(),
});

const registerSchema = idSchema
  .tailor('register')
  .concat(passwordSchema)
  .concat(userDetailSchema)
  .with('password', 'confirmedPassword');

const signInSchema = idSchema
  .concat(passwordSchema)
  .or('email', 'userName')
  .without('password', 'confirmedPassword');

const updateProfileSchema = idSchema.concat(userDetailSchema).concat(uniqueIdSchema);

const updatePassSchema = passwordSchema
  .concat(uniqueIdSchema)
  .with('password', 'confirmedPassword')
  .append({
    prevPassword: joi
      .string()
      .pattern(new RegExp('^(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{6,}$'))
      .invalid(joi.ref('password'))
      .required(),
  });

const resetPasswordSchema = emailSchema
  .concat(passwordSchema)
  .with('password', 'confirmedPassword');

module.exports = {
  registerSchema,
  signInSchema,
  updateProfileSchema,
  emailSchema,
  resetPasswordSchema,
  updatePassSchema,
  updateProfileSchema,
};
