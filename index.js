require('dotenv').config()

const { createApp, createServer } = require('yion')
const bodyParser = require('@boutdecode/body-parser')
const logger = require('@boutdecode/logger')
const session = require('@boutdecode/session')
const encoding = require('@boutdecode/encoding')
const i18n = require('@boutdecode/i18n')
const assets = require('./plugins/assets')

/**
 * Bootstrap the application
 * @param {
 *    application: Object.<string, *>,
 *   api: Object.<string, *>,
 *   assets: Object.<string, *>,
 *   config: Object.<string, *>,
 *   modules: string[],
 *   store: Object.<string, *>,
 *   translation: Object.<string, *>,
 *   view: Object.<string, *>
 * } config
 * @param Function[] [plugins=[]]
 * @returns {{app: Application, api: Api, server: Server}}
 */
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
    const plugin = require(`./plugins/${config.view?.render || 'pug'}`)
    app.use(plugin(config.view))
  }
  if (config.store) {
    const { plugin } = require('@boutdecode/store')
    app.use(plugin(config.store))
  }

  plugins.forEach(plugin => app.use(plugin(config)))
  app.use(moduleLoader({ modules: config.modules, config, app, api }))

  const port = process.env.NODE_PORT || config?.application?.port || 8080
  server.listen(port)
    // eslint-disable-next-line no-console
    .on('listening', () => console.log(`🤖 Server starting on port ${port} ...`))

  return { app, api, server }
}

module.exports = {
  bootstrap, createApp, createServer, bodyParser, logger, session, encoding, i18n, assets
}
