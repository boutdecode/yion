const path = require('node:path')
const { globSync } = require('glob')

/**
 * Module loader
 * @param {
 *   modules: string[],
 *   folder: string,
 *   config: Object.<string, *>,
 *   app: Application,
 *   api: Api
 * }
 *
 * @returns {(function(*, Function): void)}
 */
module.exports = ({
  modules = [],
  folder = 'modules',
  config = {},
  app = {},
  api = {}
} = {}) => {
  const modulesFolder = path.resolve(process.cwd(), folder)
  const contexts = { app, api }

  for (const module of modules) {
    const modulePath = path.resolve(modulesFolder, module)
    const configFiles = globSync(`${modulePath}/config/**/*.{js,ts,mjs,mts}`)
    const middlewareFiles = globSync(`${modulePath}/middlewares/**/*.{js,ts,mjs,mts}`)
    const operationFiles = globSync(`${modulePath}/{operators,pages}/**/*.{js,ts,mjs,mts}`)

    // eslint-disable-next-line no-console
    console.log(`⚙️ Configuring "${module}" module...`)
    for (const file of configFiles) {
      try {
        let module = require(file)
        if (module.__esModule) {
          module = module.default
        }

        if (typeof module === 'function') {
          module({ ...contexts, config })
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`⛔️ Module loader throw error from ${file} : `, error)
        process.exit(1)
      }
    }

    // eslint-disable-next-line no-console
    console.log(`📦 Loading "${module}" module...`)
    for (const file of middlewareFiles) {
      try {
        let module = require(file)
        if (module.__esModule) {
          module = module.default
        }

        const { context, handler } = module
        if (typeof handler === 'function') {
          contexts[context].use(handler)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`⛔️ Module loader throw error from ${file} : `, error)
        process.exit(1)
      }
    }

    for (const file of operationFiles) {
      try {
        let module = require(file)
        if (module.__esModule) {
          module = module.default
        }
        const { context, route, input, output, security, openapi, handler } = module
        const { method = 'get', pattern } = route

        if (typeof handler === 'function') {
          if (context === 'app') {
            app[method](pattern, handler)
          } else if (context === 'api') {
            api[method](pattern, { input, output, security, openapi }, handler)
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`⛔️ Module loader throw error from ${file} : `, error)
        process.exit(1)
      }
    }
  }

  return (container, next) => {
    next()
  }
}
