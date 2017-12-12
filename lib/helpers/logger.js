module.exports = {
  log(...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.log.apply(null, args);
    }
  },
};
