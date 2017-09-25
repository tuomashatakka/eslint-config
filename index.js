

module.exports = {
  "env": {
    "browser": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 7,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "parser": "babel-eslint",
  "plugins": [
    "react",
    "flowtype"
  ],
  "globals": {
    "Set":        true,
    "Map":        true,
    "Proxy":      true,
    "Promise":    true,
    "WeakSet":    true,
    "WeakMap":    true,
    "Uint8Array": true
  },
  "rules": {
    "eqeqeq":     [ "error",  "smart" ],
    "semi":       [ "warn",   "never" ],
    "max-len":    [ "warn",   120 ],
    "max-lines":  [ "warn",   320 ],
    "max-depth":  [ "warn",   3 ],
    "complexity": [ "error",  3 ],

    "strict":     0,

    "class-methods-use-this": 1,
    "no-tabs":        1,
    "no-console":     1,
    "dot-notation":   1,

    "no-array-constructor": 2,
    "no-obj-calls":   2,
    "use-isnan":      2,
    "no-undef":       2,
    "no-unused-vars": 2
  }
}
