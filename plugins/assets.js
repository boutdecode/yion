const path = require('node:path')

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
      get (name) {
        return manifest[name] ? `/${manifest[name].file}` : null
      }
    })

    next()
  }
}
