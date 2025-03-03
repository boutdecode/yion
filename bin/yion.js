#!/usr/bin/node

const fs = require('node:fs')
const path = require('node:path')
const { globSync } = require('glob')

const { bootstrap } = require('../index')

const configJsFilePath = globSync(`${process.cwd()}/yion.config.{js,ts,cjs,mjs}`)[0]
const modulesPath = path.resolve(process.cwd(), 'modules')

if (fs.existsSync(configJsFilePath)) {
  const data = require(configJsFilePath)
  if (!data.modules && fs.existsSync(modulesPath)) {
    data.config.modules = fs.readdirSync(modulesPath)
  }

  bootstrap(data)
} else {
  throw new Error('Need a configuration (yion.config) file at the root of the project')
}
