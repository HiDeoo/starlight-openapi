# starlight-openapi

## 0.21.1

### Patch Changes

- [#129](https://github.com/HiDeoo/starlight-openapi/pull/129) [`5a55272`](https://github.com/HiDeoo/starlight-openapi/commit/5a552728b1b42c1ff51e332796947243e08d92f8) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Setups trusted publishing using OpenID Connect (OIDC) authentication — no code changes.

## 0.21.0

### Minor Changes

- [#127](https://github.com/HiDeoo/starlight-openapi/pull/127) [`f5141da`](https://github.com/HiDeoo/starlight-openapi/commit/f5141da3c61f62cf9286bbd7f0c21751386d11a8) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a new [`sidebar.operations.labels`](https://starlight-openapi.vercel.app/configuration/#labels) configuration value of `'path'` to use the operation path as the label for operation sidebar links.

## 0.20.0

### Minor Changes

- [#119](https://github.com/HiDeoo/starlight-openapi/pull/119) [`d5eb2b0`](https://github.com/HiDeoo/starlight-openapi/commit/d5eb2b0f0698884263265c0b8358643504c49057) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Updates the underlying OpenAPI [parser](https://github.com/readmeio/oas/tree/main/packages/parser) to version `4.1.2`.

### Patch Changes

- [#125](https://github.com/HiDeoo/starlight-openapi/pull/125) [`3c2dc5d`](https://github.com/HiDeoo/starlight-openapi/commit/3c2dc5dcb58bcfab8433252785186a63f6571ebc) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes various UI inconsistencies when rendering schema objects.

- [#121](https://github.com/HiDeoo/starlight-openapi/pull/121) [`6b94d76`](https://github.com/HiDeoo/starlight-openapi/commit/6b94d76003a6df9d9a39d82bc8f0ce219d98d823) Thanks [@LouiseMcMahon](https://github.com/LouiseMcMahon)! - Adds an heading before schema object examples to improve clarity and consistency.

## 0.19.1

### Patch Changes

- [#115](https://github.com/HiDeoo/starlight-openapi/pull/115) [`6c37f8e`](https://github.com/HiDeoo/starlight-openapi/commit/6c37f8eee1aae915c76d444d0038379a9613593e) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Prevents a potential build error for OpenAPI schemas containing incorrectly formatted enum values.

## 0.19.0

### Minor Changes

- [#112](https://github.com/HiDeoo/starlight-openapi/pull/112) [`64e03d9`](https://github.com/HiDeoo/starlight-openapi/commit/64e03d9201a0dc30bad088b83cede5f1f04aea09) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for specifying custom sidebar groups for individual OpenAPI schemas.

  When generating documentation for multiple schemas, this allows you to place the generated documentation pages for each schema anywhere in the Starlight sidebar, even in different sidebar groups.

  See the ["Sidebar groups"](https://starlight-openapi.vercel.app/configuration/#sidebar-groups) section in the documentation for more information.

## 0.18.0

### Minor Changes

- [#109](https://github.com/HiDeoo/starlight-openapi/pull/109) [`6de8f2b`](https://github.com/HiDeoo/starlight-openapi/commit/6de8f2bfbba77dc3ed20d5ca307994da5cfc8998) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Respects Starlight convention to generate URLs with a trailing slash when using the [`trailingSlash: 'ignore'`](https://docs.astro.build/en/reference/configuration-reference/#trailingslash) Astro configuration option (the default) as many common hosting providers redirect to URLs with a trailing slash by default.

### Patch Changes

- [#109](https://github.com/HiDeoo/starlight-openapi/pull/109) [`6de8f2b`](https://github.com/HiDeoo/starlight-openapi/commit/6de8f2bfbba77dc3ed20d5ca307994da5cfc8998) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes a sidebar link generation issue when using the Astro `trailingSlash` configuration option set to `always`.

## 0.17.0

### Minor Changes

- [#103](https://github.com/HiDeoo/starlight-openapi/pull/103) [`4179569`](https://github.com/HiDeoo/starlight-openapi/commit/41795691d108dd609cf3785a05ba5f3e126c06b9) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for [callbacks](https://swagger.io/docs/specification/v3_0/callbacks/) in OpenAPI 3 specs.

## 0.16.1

### Patch Changes

- [#100](https://github.com/HiDeoo/starlight-openapi/pull/100) [`1b00fcf`](https://github.com/HiDeoo/starlight-openapi/commit/1b00fcf91a7573d2caf5bdd6a3425b411f0f6f09) Thanks [@cruzdanilo](https://github.com/cruzdanilo)! - Fixes an issue preventing numeric enum values from being rendered.

## 0.16.0

### Minor Changes

- [#96](https://github.com/HiDeoo/starlight-openapi/pull/96) [`933cc5c`](https://github.com/HiDeoo/starlight-openapi/commit/933cc5c2c7d400c5f2392679620cb3daddd787d2) Thanks [@HiDeoo](https://github.com/HiDeoo)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.34.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

- [#96](https://github.com/HiDeoo/starlight-openapi/pull/96) [`933cc5c`](https://github.com/HiDeoo/starlight-openapi/commit/933cc5c2c7d400c5f2392679620cb3daddd787d2) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds clickable anchor links to headings which respects the Starlight [`markdown.headingLinksSection`](https://starlight.astro.build/reference/configuration/#headinglinks) configuration option.

## 0.15.0

### Minor Changes

- [#94](https://github.com/HiDeoo/starlight-openapi/pull/94) [`9b95bca`](https://github.com/HiDeoo/starlight-openapi/commit/9b95bca2f91225a096393d5e0584b6def658c23d) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for schemas using version `3.0.4` of the OpenAPI specification by updating the OpenAPI and Swagger API definitions parser used internally.

## 0.14.4

### Patch Changes

- [#90](https://github.com/HiDeoo/starlight-openapi/pull/90) [`6953670`](https://github.com/HiDeoo/starlight-openapi/commit/6953670897d4fad2125bf66f31bfe936e9d1ba3d) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes potential sidebar link issues when using the Astro `base` option.

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
