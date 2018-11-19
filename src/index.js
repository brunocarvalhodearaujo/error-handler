const http = require('http-status')
const assign = require('lodash.assign')
const pick = require('lodash.pick')

/**
 * @param {Error} [err]
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 */
function middleware (err, request, response, next) {
  let status = err.code || err.status || err.statusCode || http.INTERNAL_SERVER_ERROR

  if (status < http.BAD_REQUEST) {
    status = http.INTERNAL_SERVER_ERROR
  }

  response.status(status)

  const error = { status }

  // show the stacktrace when not in production
  if (process.env.NODE_ENV !== 'production') {
    error.stack = err.stack
  }

  if (!err.type) {
    error.type = http[status]
  }

  // error fields
  assign(error, pick(err, [ 'message', 'name', 'code', 'type', 'reason' ]))

  // internal server errors
  if (status >= http.INTERNAL_SERVER_ERROR) {
    error.message = err.message || http[status]
  }

  response.json({ error })
}

module.exports = () => middleware
