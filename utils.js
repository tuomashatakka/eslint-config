
const reduce = (arr) =>
  arr.reduce((obj, key) => Object.assign(obj, { [key]: true }), {})

module.exports = {
  reduce
}
