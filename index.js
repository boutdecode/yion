require('dotenv').config()

const { createApp, createServer } = require('yion')
const bodyParser = require('@boutdecode/body-parser')
const logger = require('@boutdecode/logger')
const session = require('@boutdecode/session')
const encoding = require('@boutdecode/encoding')
const i18n = require('@boutdecode/i18n')
const assets = require('./plugins/assets')

const bootstrap = ({
  config = {},
  plugins = []
}) => {
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
  app.use(moduleLoader({ modules: config.modules.modules, config, app, api }))

  server.listen(process.env.NODE_PORT || config?.application.port)
    // eslint-disable-next-line no-console
    .on('listening', () => console.log(`🤖 Server starting on port ${process.env.NODE_PORT}.`))

  return { app, api, server }
}

module.exports = {
  bootstrap, createApp, createServer, bodyParser, logger, session, encoding, i18n, assets
}
