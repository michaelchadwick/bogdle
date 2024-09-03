'use strict'

module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-prettier/recommended'],
  rules: {
    'property-disallowed-list': ['font-size', 'line-height'],
  },
}
