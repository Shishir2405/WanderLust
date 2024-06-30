// Wrap an asynchronous route handler function to catch errors and pass them to Express's error handling middleware
module.exports = (fn) => {
  return function (req, res, next) {
    // Call the asynchronous function `fn` with `req`, `res`, and `next`
    fn(req, res, next)
      // If `fn` returns a promise that rejects, catch the error and pass it to `next`
      .catch(next); // `next` here refers to Express's error handling middleware
  };
};
