
module.exports.reduce = arr =>
  arr.env.reduce((obj, key) => Object.assign(obj, { [key]: true }), {})
