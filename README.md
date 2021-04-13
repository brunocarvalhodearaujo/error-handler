@brunocarvalho/error-handler
============================

A error handler for express APIs applications.

## Instalation

```sh
$ [sudo] npm install --save @brunocarvalho/error-handler
```

## usage

```js
import express from 'express'
import errorHandler from '@brunocarvalho/error-handler'

const app = express()

app.get('/', (req, res) => {
  const err: RequestError = new Error('Not Found')
  err.reason = `item not found in database`
  err.statusCode = 404
  throw err
})

app.use(errorHandler())
```
