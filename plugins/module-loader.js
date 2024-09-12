const path = require('node:path')
const { globSync } = require('glob')

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
    const configFiles = globSync(`${modulePath}/config/**/*.{js,ts}`)
    const middlewareFiles = globSync(`${modulePath}/middlewares/**/*.{js,ts}`)
    const operationFiles = globSync(`${modulePath}/operators/**/*.{js,ts}`)

    // eslint-disable-next-line no-console
    console.log(`⚙️ Configuring "${module}" module...`)
    for (const file of configFiles) {
      try {
        const module = require(file)
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
        const { context, handler } = require(file)
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
        const { context, route, schema = {}, handler } = require(file)
        const { method, pattern } = route

        if (typeof handler === 'function') {
          if (context === 'app') {
            app[method](pattern, handler)
          } else if (context === 'api') {
            api[method](pattern, schema, handler)
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
