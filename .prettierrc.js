'use strict'

module.exports = {
  overrides: [
    {
      files: '*.{js,ts}',
      options: {
        printWidth: 100,
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
  ],
}