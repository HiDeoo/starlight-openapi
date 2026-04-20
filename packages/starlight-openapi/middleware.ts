import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import projectContext from 'virtual:starlight-openapi/context'
import schemas from 'virtual:starlight-openapi/schemas'

import { stripHtmlExtension, stripLeadingAndTrailingSlashes } from './libs/path'
import { getPaginationLinks, getSidebarFromSchemas } from './libs/starlight'

const allSchemas = Object.values(schemas)

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals

  const sidebar = getSidebarFromSchemas(
    stripLeadingAndTrailingSlashes(stripHtmlExtension(context.url.pathname)),
    starlightRoute.sidebar,
    allSchemas,
    projectContext,
  )

  starlightRoute.sidebar = sidebar
  starlightRoute.pagination = getPaginationLinks(sidebar, starlightRoute.entry.data, projectContext)
})
