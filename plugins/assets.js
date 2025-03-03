const path = require('node:path')

/**
 * Assets plugin
 * @param {
 *     folder: string
 * } folder
 * @returns {(function(*, Function): void)}
 */
module.exports = ({ folder = 'public' } = {}) => {
  const assetsFolder = path.resolve(process.cwd(), folder)
  let manifest = {}
  try {
    manifest = require(`${assetsFolder}/manifest.json`)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('⛔️ Manifest file not found', e)
    manifest = {}
  }

  return (context, next) => {
    context.set('assets', {
      get (name, type = 'script') {
        for (const asset in manifest) {
          if (manifest[asset].name === name) {
            return type === 'script'
              ? manifest[asset].file
              : manifest[asset].css
          }
        }

        return null
      }
    })

    next()
  }
}
