
module.exports = {

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion:  7,
    sourceType:   'module',
    ecmaFeatures: {
      jsx: true,
    }
  },

  settings: {

    react: {
      pragma:  'React',
      version: '16.3.0'
    },

    'import/ignore': [
      /\.(sc|le|c)ss$/
    ],

  }

}
