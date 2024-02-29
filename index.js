const { createApp, createServer } = require('yion')
const bodyParser = require('@boutdecode/body-parser')
const logger = require('@boutdecode/logger')
const session = require('@boutdecode/session')
const encoding = require('@boutdecode/encoding')
const i18n = require('@boutdecode/i18n')

module.exports = {
  createApp, createServer, bodyParser, logger, session, encoding, i18n
}
