const path = require('node:path')
const babel = require('@babel/core')

module.exports = ({
  extension = '.jsx',
  folder = 'templates',
  globals = {},
  plugins = []
} = {}) => {
  const templateFolder = path.resolve(process.cwd(), folder)

  if (extension.charAt(0) !== '.') {
    extension = `.${extension}`
  }

  // eslint-disable-next-line n/no-deprecated-api
  if (require.extensions[extension]) {
    return
  }

  // eslint-disable-next-line n/no-deprecated-api
  require.extensions[extension] = (module, filename) => {
    try {
      const result = babel.transformFileSync(filename, {
        plugins: [
          ...plugins,
          ['@babel/plugin-transform-react-jsx', { pragma: 'h' }],
        ]
      })

      module._compile(`const h = require('hyperscript-jsx/string'); ${result.code}`, filename)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      throw new Error(e)
    }
  }

  return (context, next) => {
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

      asset (name) {
        if (!assets) {
          throw new Error('assets is not available')
        }

        return assets.get(name)
      }
    }

    context.set('view', {
      render (jsx, data = {}) {
        res
          .set('content-type', 'text/html')
          .set('content-encoding', 'gzip')
          .send(`<!DOCTYPE html>${require(`${templateFolder}/${jsx}${extension}`)({
            ...templateFunctions,
            ...globals,
            ...data
          })}`)
      }
    })

    next()
  }
}
