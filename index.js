require('dotenv').config()

const { createApp, createServer } = require('yion')
const bodyParser = require('@boutdecode/body-parser')
const logger = require('@boutdecode/logger')
const session = require('@boutdecode/session')
const encoding = require('@boutdecode/encoding')
const i18n = require('@boutdecode/i18n')
const assets = require('./plugins/assets')

const bootstrap = ({
  api = true,
  config = {},
  view = 'jsx',
  store = true,
  plugins = []
}) => {
  const container = require('./plugins/container')
  const moduleLoader = require('./plugins/module-loader')

  const apps = []
  const app = createApp()
  apps.push(app)

  if (api) {
    const { createApi } = require('@boutdecode/open-api')
    const apiDoc = require('@boutdecode/open-api/plugins/open-api-doc')
    const cors = require('@boutdecode/open-api/plugins/cors')

    api = createApi({ openapi: config.api })
    api.use(cors(config.cors))

    app.use(apiDoc(api))
    apps.push(api)
  }

  const server = createServer(...apps)

  if (view) {
    const plugin = require(`./plugins/${view}`)
    app.use(plugin(config.view))
  }

  if (store) {
    const { plugin } = require('@boutdecode/store')
    app.use(plugin(config.store))
  }

  app.use(container(config))
  app.use(logger())
  app.use(bodyParser())
  app.use(encoding())
  app.use(session())
  app.use(assets(config.assets))
  app.use(i18n(config.translation))
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
