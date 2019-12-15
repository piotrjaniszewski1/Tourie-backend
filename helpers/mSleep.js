module.exports = numMilliseconds => (
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, numMilliseconds);
  })
);
