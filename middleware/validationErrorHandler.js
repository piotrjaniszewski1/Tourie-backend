const validationErrorHandler = (error, req, res, next) => {
  if (error.name !== 'ValidationError') {
    next(error);
    return;
  }

  const errors = {};
  Object.entries(error.errors).forEach(([field, { message }]) => {
    errors[field] = message;
  });

  res.status(422).json({ message: 'there were some errors in your input', errors });
};

module.exports = validationErrorHandler;
