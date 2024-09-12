const path = require('node:path')

module.exports = ({ folder = 'public' } = {}) => {
  const assetsFolder = path.resolve(process.cwd(), folder)
  const manifest = require(`${assetsFolder}/manifest.json`)

  return (context, next) => {
    context.set('assets', {
      get (name) {
        return manifest[name] ? `/${manifest[name].file}` : null
      }
    })

    next()
  }
}
