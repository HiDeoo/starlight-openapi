# starlight-openapi

## 0.14.3

### Patch Changes

- [#88](https://github.com/HiDeoo/starlight-openapi/pull/88) [`d2cdf30`](https://github.com/HiDeoo/starlight-openapi/commit/d2cdf3008aa7693b73d306f7d2fe2e0cc2f9e05a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a compatibility issue with some other Starlight plugins due to how the sidebar entries for the generated pages were being created.

## 0.14.2

### Patch Changes

- [#86](https://github.com/HiDeoo/starlight-openapi/pull/86) [`ecc5bb3`](https://github.com/HiDeoo/starlight-openapi/commit/ecc5bb3c710a0f0f426198c5af980ec95c964cba) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes syntax highlighting issues for many examples where the code block language was not properly inferred.

## 0.14.1

### Patch Changes

- [#83](https://github.com/HiDeoo/starlight-openapi/pull/83) [`dc88650`](https://github.com/HiDeoo/starlight-openapi/commit/dc886506e811b78512a3c87702fe4c8372e1fae5) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Ensures property titles are rendered when provided in a schema.

## 0.14.0

### Minor Changes

- [#80](https://github.com/HiDeoo/starlight-openapi/pull/80) [`d6175bc`](https://github.com/HiDeoo/starlight-openapi/commit/d6175bc807b52e4d38e3771b83df16b11346a25a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`sidebar.operations.sort`](https://starlight-openapi.vercel.app/configuration/#sort) configuration option to configure the sorting method for the operation sidebar links.

  The current behavior to sort the operation sidebar links in the order they appear in the OpenAPI document is preserved by default. Setting this option to `'alphabetical'` will sort the operation sidebar links alphabetically.

- [#80](https://github.com/HiDeoo/starlight-openapi/pull/80) [`d6175bc`](https://github.com/HiDeoo/starlight-openapi/commit/d6175bc807b52e4d38e3771b83df16b11346a25a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Deprecates the sidebar `label`, `collapsed`, and `sidebarMethodBadges` options in favor of a new [`sidebar`](https://starlight-openapi.vercel.app/configuration/#sidebar) option object.

  The previous options are still supported for backward compatibility, but they will be removed in a future release.

  ```diff
  starlightOpenAPI([
    {
      base: 'api',
      schema: '../schemas/api-schema.yaml',
  -   label: 'My API',
  -   collapsed: false,
  -   sidebarMethodBadges: true,
  +   sidebar: {
  +     label: 'My API',
  +     collapsed: false,
  +     operations: { badges: true },
  +   },
    },
  ])
  ```

- [#80](https://github.com/HiDeoo/starlight-openapi/pull/80) [`d6175bc`](https://github.com/HiDeoo/starlight-openapi/commit/d6175bc807b52e4d38e3771b83df16b11346a25a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`sidebar.tags.sort`](https://starlight-openapi.vercel.app/configuration/#sort-1) configuration option to configure the sorting method for the tag sidebar groups.

  The current behavior to sort the tag sidebar groups in the order they appear in the OpenAPI document is preserved by default. Setting this option to `'alphabetical'` will sort the tag sidebar groups alphabetically.

- [#80](https://github.com/HiDeoo/starlight-openapi/pull/80) [`d6175bc`](https://github.com/HiDeoo/starlight-openapi/commit/d6175bc807b52e4d38e3771b83df16b11346a25a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`sidebar.operations.labels`](https://starlight-openapi.vercel.app/configuration/#labels) configuration option to define whether the operation sidebar labels should use the operation ID or summary.

  The current behavior to use the operation summary and fall back to the operation ID if no summary is provided is preserved by default. Setting this option to `'operationId'` will always use the operation ID as the operation sidebar label.

### Patch Changes

- [#80](https://github.com/HiDeoo/starlight-openapi/pull/80) [`d6175bc`](https://github.com/HiDeoo/starlight-openapi/commit/d6175bc807b52e4d38e3771b83df16b11346a25a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a rendering issue for model definition properties using nested `allOf` properties.

- [#80](https://github.com/HiDeoo/starlight-openapi/pull/80) [`d6175bc`](https://github.com/HiDeoo/starlight-openapi/commit/d6175bc807b52e4d38e3771b83df16b11346a25a) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a syntax highlighting issue for response [examples defined at the object-level in a reference of the `components` section](https://swagger.io/docs/specification/v3_0/adding-examples/#object-and-property-examples).

## 0.13.0

### Minor Changes

- [#75](https://github.com/HiDeoo/starlight-openapi/pull/75) [`52dd833`](https://github.com/HiDeoo/starlight-openapi/commit/52dd833ca0cb2bcac14693f95ebe9bfd758232a5) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.32.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

## 0.12.1

### Patch Changes

- [#73](https://github.com/HiDeoo/starlight-openapi/pull/73) [`beeb586`](https://github.com/HiDeoo/starlight-openapi/commit/beeb586577d2b88923bc1909995031ce41e90ce9) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds `astro` as a peer dependency to prevent potential build errors in monorepos with hoisting disabled.

## 0.12.0

### Minor Changes

- [#70](https://github.com/HiDeoo/starlight-openapi/pull/70) [`b6679d7`](https://github.com/HiDeoo/starlight-openapi/commit/b6679d762e9a07ca5e5df73242783a9e5f81169d) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Improves formatting of query parameter examples based on the [`style` and `explode` property values](https://swagger.io/specification/#fixed-fields-for-use-with-schema) and the [RFC 6570 URI template specification](https://datatracker.ietf.org/doc/html/rfc6570).

## 0.11.0

### Minor Changes

- [#67](https://github.com/HiDeoo/starlight-openapi/pull/67) [`194dfe7`](https://github.com/HiDeoo/starlight-openapi/commit/194dfe771958a33883da251503495f49cf140b54) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`sidebarMethodBadges`](https://starlight-openapi.vercel.app/configuration/#sidebarmethodbadges) schema configuration option to display badges next to sidebar operation links with the associated HTTP method.

## 0.10.0

### Minor Changes

- [#63](https://github.com/HiDeoo/starlight-openapi/pull/63) [`b19e249`](https://github.com/HiDeoo/starlight-openapi/commit/b19e24982ee893d49d117ca933fd8900db1d7522) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds overview pages for operations grouped by tags defined with a `description` or `externalDocs` fields displaying the tag's information.

## 0.9.0

### Minor Changes

- [#58](https://github.com/HiDeoo/starlight-openapi/pull/58) [`f91f2f4`](https://github.com/HiDeoo/starlight-openapi/commit/f91f2f4ac62c7fd0f00c48d6547158d464886aa9) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for Astro v5, drops support for Astro v4.

  ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now `0.30.0`.

  Please follow the [upgrade guide](https://github.com/withastro/starlight/releases/tag/%40astrojs/starlight%400.30.0) to update your project.
