/**
 * Copyright (c) 2023-present, Bruno Carvalho de Araujo.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const http = require('http-status')
const assign = require('lodash.assign')
const pick = require('lodash.pick')

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * @param {{ withTrace?: boolean }} options
 * @returns {(err: Error, request: Request, response: Response, next: NextFunction) => void}
 */
function middleware (options = {}) {
  return (err, request, response, next) => {
    let status = err.code || err.status || err.statusCode || http.INTERNAL_SERVER_ERROR

    if (isNaN(status)) {
      status = http.INTERNAL_SERVER_ERROR
    }

    if (status < http.BAD_REQUEST) {
      status = http.INTERNAL_SERVER_ERROR
    }

    response.status(status)

    const error = {
      status,
      isRequestError: true
    }

    // show the stacktrace when not in production
    if (process.env.NODE_ENV !== 'production') {
      error.stack = err.stack
    }

    if (!err.hasOwnProperty('message')) {
      err = new Error('Internal server error')
    }

    if (isNaN(error.code)) {
      err.code = status
    }

    if (!err.type) {
      error.type = http[status]
    }

    // error fields
    assign(error, pick(err, [
      'message',
      'name',
      'code',
      'type',
      'reason',
      'errors',
      'trace',
      'trace_id',
      'isRequestError'
    ]))

    if (error.errors) {
      error.errors = error.errors.map(error => {
        return Object.getOwnPropertyNames(error)
          .filter(key => !(key === 'stack' && process.env.NODE_ENV === 'production'))
          .reduce((previous, current) => ({ ...previous, [current]: error[current] }), {})
      })
    }

    // internal server errors
    if (status >= http.INTERNAL_SERVER_ERROR) {
      error.message = err.message || http[status]
    }

    response.json({ error })
  }
}

function yupErrorHandlerMiddleware () {
  const yup = require('yup')

  return (error, request, response, next) => {
    if ((error instanceof yup.ValidationError)) {
      const err = new Error(error.message)
      err.code = 422
      err.name = error.name
      err.type = error.type
      err.reason = error.name.toUpperCase().replace('ERROR', '')
      return next(err)
    }

    return next(error)
  }
}

/**
 * @param {Error} error
 */
function isRequestError (error) {
  return error.isRequestError instanceof Error
}

module.exports = middleware
module.exports.yupErrorHandlerMiddleware = yupErrorHandlerMiddleware
module.exports.isRequestError = isRequestError
