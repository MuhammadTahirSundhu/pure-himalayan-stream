// middleware/validate.js — OneWater Pakistan
// express-validator helper — runs validation and returns 422 on failure

import { validationResult } from 'express-validator';

/**
 * Should be placed AFTER express-validator chains in route handlers.
 * Returns 422 with a structured error array if validation fails.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'ValidationError',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};
