import { createRequire } from 'node:module'

import dotenv from 'dotenv'

// @ts-ignore
import { createApp, createServer } from 'yion'
// @ts-ignore
import * as bodyParser from '@boutdecode/body-parser'
// @ts-ignore
import * as logger from '@boutdecode/logger'
// @ts-ignore
import * as session from '@boutdecode/session'
// @ts-ignore
import * as encoding from '@boutdecode/encoding'
// @ts-ignore
import * as i18n from '@boutdecode/i18n'

import assets from './plugins/assets'

dotenv.config()

export type BootstrapOptions = {
  config: {
    application: {
      port: number
    },
    modules: String[],
    api?: Record<string, any>,
    cors?: Record<string, any>,
    assets?: Record<string, any>,
    translation?: Record<string, any>,
    view?: Record<string, any>,
    store?: Record<string, any>,
  }
  plugins?: Array<Function>
}

export default ({
  config,
  plugins = []
}: BootstrapOptions) => {
  const require = createRequire(import.meta.url)
  const container = require('./plugins/container')
  const moduleLoader = require('./plugins/module-loader')

  const apps = []
  const app = createApp()
  apps.push(app)

  let api
  if (config.api) {
    const { createApi } = require('@boutdecode/open-api')
    const apiDoc = require('@boutdecode/open-api/plugins/open-api-doc')
    const cors = require('@boutdecode/open-api/plugins/cors')

    api = createApi({ openapi: config.api })
    if (config.cors) {
      api.use(cors(config.cors))
    }

    app.use(apiDoc(api, config.api))
    apps.push(api)
  }

  const server = createServer(...apps)

  app.use(container(config))
  app.use(logger())
  app.use(bodyParser())
  app.use(encoding())
  app.use(session())
  if (config.assets) {
    app.use(assets(config.assets))
  }
  if (config.translation) {
    app.use(i18n(config.translation))
  }

  if (config.view) {
    const plugin = require(`./plugins/${config.view?.render || 'jsx'}`)
    app.use(plugin(config.view))
  }

  if (config.store) {
    const { plugin } = require('@boutdecode/store')
    app.use(plugin(config.store))
  }

  plugins.forEach(plugin => app.use(plugin(config)))
  app.use(moduleLoader({ modules: config.modules, config, app, api }))

  server.listen(process.env.NODE_PORT || config?.application.port)
    // eslint-disable-next-line no-console
    .on('listening', () => console.log(`🤖 Server starting on port ${process.env.NODE_PORT}.`))

  return { app, api, server }
}
