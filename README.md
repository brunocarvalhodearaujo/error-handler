error-handler
=============

A error handler for express APIs applications.

## Instalation

```sh
$ [sudo] npm install --save @brunocarvalho/json-error-handler
```

## usage

```js
import express from 'express'
import errorHandler from '@brunocarvalho/error-handler'

const app = express()

app.use(errorHandler())
```
