// lib/asyncHandler.js — forwards rejected promises from async route handlers
// to Express's error handler (Express 4 does not do this on its own, and an
// unhandled rejection would otherwise crash the process).
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Runs `work(client)` inside a transaction and always releases the client. */
export const withTransaction = async (pool, work) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

/** Error with an HTTP status + client-safe message. */
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
    this.expose = true;
  }
}
