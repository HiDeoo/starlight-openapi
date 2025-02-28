import { z } from 'astro/zod'
import type { OpenAPI } from 'openapi-types'

import { getBasePath, stripLeadingAndTrailingSlashes } from './path'
import { getPathItemSidebarGroups, getWebhooksSidebarGroups } from './pathItem'
import { makeSidebarGroup, makeSidebarLink, type SidebarManualGroup } from './starlight'

export const SchemaConfigSchema = z
  .object({
    /**
     * The base path containing the generated documentation.
     * @example 'api/petstore'
     */
    base: z.string().min(1).transform(stripLeadingAndTrailingSlashes),
    /**
     * Wheter the generated documentation sidebar group should be collapsed by default.\
     * @deprecated
     * @default true
     */
    collapsed: z.boolean().default(true),
    /**
     * The generated documentation sidebar group label.
     * @deprecated
     * @defaultValue
     * Defaults to the OpenAPI document title.
     */
    label: z.string().optional(),
    /**
     * The OpenAPI/Swagger schema path or URL.
     */
    schema: z.string().min(1),
    /**
     * The generated sidebar group configuration.
     */
    sidebar: z
      .object({
        /**
         * Wheter the generated documentation sidebar group should be collapsed by default.
         * @default true
         */
        collapsed: z.boolean().default(true),
        /**
         * The generated documentation sidebar group label.
         * @defaultValue
         * Defaults to the OpenAPI document title.
         */
        label: z.string().optional(),
        /**
         * The generated documentation sidebar group operations configuration.
         */
        operations: z
          .object({
            /**
             * Defines if the sidebar should display badges next to operation links with the associated HTTP method.
             * @default false
             */
            badges: z.boolean().default(false),
          })
          .default({}),
      })
      .default({}),
    /**
     * Defines if the sidebar should display badges next to operation links with the associated HTTP method.
     * @deprecated
     * @default false
     */
    sidebarMethodBadges: z.boolean().default(false),
  })
  .transform((value) => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const { collapsed, label, sidebarMethodBadges, ...rest } = value

    if (!collapsed) {
      rest.sidebar.collapsed = collapsed
    }

    if (label) {
      rest.sidebar.label = label
    }

    if (sidebarMethodBadges) {
      rest.sidebar.operations.badges = sidebarMethodBadges
    }

    return rest
  })

export function getSchemaSidebarGroups(schema: Schema): SidebarManualGroup {
  const { config, document } = schema

  return makeSidebarGroup(
    config.sidebar.label ?? document.info.title,
    [
      makeSidebarLink('Overview', getBasePath(config)),
      ...getPathItemSidebarGroups(schema),
      ...getWebhooksSidebarGroups(schema),
    ],
    config.sidebar.collapsed,
  )
}

export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

export interface Schema {
  config: StarlightOpenAPISchemaConfig
  document: OpenAPI.Document
}
