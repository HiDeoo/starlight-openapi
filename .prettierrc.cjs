const baseConfig = require('@hideoo/prettier-config')

/**
 * @type {import('prettier').Config}
 */
const prettierConfig = {
  ...baseConfig,
  overrides: [
    {
      files: '*.astro',
      options: {
        astroCompressHTML: 'none',
        parser: 'astro',
      },
    },
  ],
  plugins: [require.resolve('prettier-plugin-astro')],
}

module.exports = prettierConfig
