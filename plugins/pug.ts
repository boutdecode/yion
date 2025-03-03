import path from 'node:path'
import pug from 'pug'

module.exports = ({ folder = 'templates', globals = {} } = {}) => {
  const templateFolder = path.resolve(process.cwd(), folder)

  return async (context: any, next: Function) => {
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

      t (name: string, options = {}): string {
        if (!i18n) {
          throw new Error('i18n is not available')
        }

        return i18n.t(name, { lng: templateFunctions.locale, ...options })
      },

      setting (name: string, defaultValue: any): string {
        if (!i18n) {
          throw new Error('i18n is not available')
        }

        return i18n.t(container.get(`application.${name}`, defaultValue), { lng: templateFunctions.locale })
      },

      asset (name: string): string {
        if (!assets) {
          throw new Error('assets is not available')
        }

        return assets.get(name)
      }
    }

    context.set('view', {
      render (name: string, data: Record<string, any>) {
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
