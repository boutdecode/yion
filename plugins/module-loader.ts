import path from 'node:path'
import { createRequire } from 'node:module'
import { globSync } from 'glob'

module.exports = ({
  modules = [],
  folder = 'modules',
  config = {},
  app = {},
  api = {}
} = {}) => {
  const require = createRequire(import.meta.url)
  const modulesFolder = path.resolve(process.cwd(), folder)
  const contexts: Record<string, any> = { app, api }

  for (const module of modules) {
    const modulePath = path.resolve(modulesFolder, module)
    const configFiles = globSync(`${modulePath}/config/**/*.{js,ts}`)
    const middlewareFiles = globSync(`${modulePath}/middlewares/**/*.{js,ts}`)
    const operationFiles = globSync(`${modulePath}/{operators,pages}/**/*.{js,ts}`)

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
        const { method, pattern } = route

        if (typeof handler === 'function') {
          if (context === 'app') {
            // @ts-ignore
            app[method](pattern, handler)
          } else if (context === 'api') {
            // @ts-ignore
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

  return (_: any, next: Function) => {
    next()
  }
}
