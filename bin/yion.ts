#!/usr/bin/node

import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

import bootstrap from '../index'

const configJsFilePath = path.resolve(process.cwd(), 'yion.config.js')
const configTsFilePath = path.resolve(process.cwd(), 'yion.config.ts')
const modulesPath = path.resolve(process.cwd(), 'modules')
const require = createRequire(import.meta.url)

if (fs.existsSync(configJsFilePath)) {
  const data = require(configJsFilePath)
  if (!data.modules && fs.existsSync(modulesPath)) {
    data.modules = fs.readdirSync(modulesPath)
  }

  bootstrap(data)
} else if (fs.existsSync(configTsFilePath)) {
  const data = require(configTsFilePath)
  if (!data.modules && fs.existsSync(modulesPath)) {
    data.modules = fs.readdirSync(modulesPath)
  }

  bootstrap(data)
} else {
  throw new Error('Need a configuration (yion.config.js) file at the root of the project')
}
