# Yion bundle by Bout de code

![https://boutdecode.fr](https://boutdecode.fr/img/logo.png)

[Bout de code](https://boutdecode.fr) - Développement de site internet et blog avec de vrais morceaux de codes, simples, élégants, utiles (parfois) et surtout sans fioriture.

## Installation

```shell
$ npm install @boutdecode/yion
```

## Yion plugin

For yion : 

```javascript
const { 
  createApp,
  createServer,
  bodyParser,
  logger,
  session,
  encoding,
  i18n,
  assets
} = require('@boutdecode/yion')

const app = createApp()
const server = createServer(app)

app.use(logger())
app.use(bodyParser())
app.use(session())
app.use(encoding())
app.use(i18n())
app.use(assets())

app.get('/', ({ res }) => {
  res
    .set('Content-Type', 'text/html; charset=utf-8')
    .set('Content-Encoding', 'gzip')
    .send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Yion</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>Hello world</h1>
        </body>
      </html>
    `)
})

server.listen(8080)
```

OR you can bootstrap application in one line

```javascript
const { bootstrap } = require('@boutdecode/yion')

bootstrap({
  api: true,
  view: 'jsx',
  store: true,
  config: {
    application: {
      port: 8080
    }
  }
})
```

## Tests

```shell
$ npm run test
```
