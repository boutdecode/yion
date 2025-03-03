import path from 'node:path'

export type AssetsOptions = {
  folder?: string
}

export default ({ folder = 'public' }: AssetsOptions = {}) => {
  const assetsFolder = path.resolve(process.cwd(), folder)
  let manifest: Record<string, any> = {}
  try {
    manifest = require(`${assetsFolder}/manifest.json`)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('⛔️ Manifest file not found', e)
    manifest = {}
  }

  return (context: any, next: Function) => {
    context.set('assets', {
      get (name: string) {
        return manifest[name] ? `/${manifest[name].file}` : null
      }
    })

    next()
  }
}
