const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map((rule) => rule.run(req)));
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result
      .array({ onlyFirstError: true })
      .map((e) => ({ field: e.path || e.param, message: e.msg }));
    return next(new ApiError(400, 'Validation failed', details));
  }
  next();
};

module.exports = validate;
