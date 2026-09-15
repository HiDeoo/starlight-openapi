import hideoo from '@hideoo/eslint-config'

export default hideoo([
  {
    rules: {
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      'unicorn/prefer-https': [
        'error',
        { ignore: ['http://petstore.swagger.io/api/pets', /^http:\/\/swagger\.io(?:\/|$)/v] },
      ],
    },
  },
])
