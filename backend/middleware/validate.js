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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Router.param handler: malformed ids are a 404, not a Postgres 500. */
export const uuidParam = (req, res, next, id) => {
  if (!UUID_RE.test(id)) return res.status(404).json({ error: 'NotFound', message: 'Not found.' });
  next();
};
