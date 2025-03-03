const path = require('node:path')
const pug = require('pug')

/**
 * Pug plugin
 * @param {
 *   folder: string,
 *   globals: Object.<string, *>
 * }
 * @returns {(function(*, Function): Promise<void>)}
 */
module.exports = ({ folder = 'templates', globals = {} } = {}) => {
  const templateFolder = path.resolve(process.cwd(), folder)

  return async (context, next) => {
    const { req, res, container, i18n, assets } = context

    const templateFunctions = {
      get canonical () {
        return res.routeMatched.generatePath({ locale: this.locale, ...req.params }, req.query)
      },

      get locale () {
        return req.attributes.locale || container.get('translation.locale', 'en')
      },

      get locales () {
        return container.get('translation.locales', [])
      },

      get route () {
        return res.routeMatched
      },

      get url () {
        return `${container.get('application.hostname')}${req.uri}`
      },

      get queries () {
        return req.query
      },

      t (name, options = {}) {
        if (!i18n) {
          throw new Error('i18n is not available')
        }

        return i18n.t(name, { lng: templateFunctions.locale, ...options })
      },

      setting (name, defaultValue) {
        if (!i18n) {
          throw new Error('i18n is not available')
        }

        return i18n.t(container.get(`application.${name}`, defaultValue), { lng: templateFunctions.locale })
      },

      assets (name, type = 'script') {
        if (!assets) {
          throw new Error('assets is not available')
        }

        return assets.get(name, type)
      }
    }

    context.set('view', {
      render (name, data) {
        res
          .set('content-type', 'text/html')
          .set('content-encoding', 'gzip')
          .send(pug.renderFile(`${templateFolder}/${name}.pug`, {
            ...templateFunctions,
            ...globals,
            ...data
          }))
      }
    })
    next()
  }
}
