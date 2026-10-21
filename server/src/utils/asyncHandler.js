/**
 * Wrap async route handlers to catch errors and forward them to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
