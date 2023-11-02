/**
 * Copyright (c) 2023-present, Bruno Carvalho de Araujo.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const middleware = require('../src')

describe('error-handler', () => {
  describe('exports', () => {
    it('should expose a default function', () => {
      expect(typeof middleware).toBe('function')
    })
  })

  describe('usage', () => {
    it('should return an error handler', () => {
      expect(typeof middleware()).toBe('function')
    })
  })

  describe('error handler', () => {
    it('should handle an unknown error', () => {
      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      middleware()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should handle an invalid status', () => {
      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      err.statusCode = 214

      middleware()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should handle client errors', () => {
      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      err.statusCode = 400

      middleware()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(400)
      const [[clientErr]] = res.json.mock.calls

      expect(clientErr.error).toHaveProperty('status', 400)
      expect(clientErr.error).toHaveProperty('name', 'Error')
      expect(clientErr.error).toHaveProperty('message', 'error')
      expect(clientErr.error).toHaveProperty('stack')
    })

    it('should ignore stack on production', () => {
      process.env.NODE_ENV = 'production'

      jest.resetModules()

      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      err.statusCode = 400

      middleware()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(400)
      const [[clientErr]] = res.json.mock.calls

      expect(clientErr.error).toHaveProperty('status', 400)
      expect(clientErr.error).toHaveProperty('name', 'Error')
      expect(clientErr.error).toHaveProperty('message', 'error')
      expect(clientErr.error).not.toHaveProperty('stack')
    })
  })
})

describe('middleware', () => {
  it('should handle error without message', () => {
    const res = {
      json: jest.fn(),
      status: jest.fn()
    }

    const err = {}

    middleware()(err, null, res, null)

    expect(res.status).toHaveBeenCalledWith(500)
    const [[serverErr]] = res.json.mock.calls

    expect(serverErr.error).toHaveProperty('status', 500)
    expect(serverErr.error).toHaveProperty('message', 'Internal server error')
  })

  it('should handle error with invalid status', () => {
    const res = {
      json: jest.fn(),
      status: jest.fn()
    }

    const err = {
      statusCode: 300
    }

    middleware()(err, null, res, null)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('should handle error with valid status', () => {
    const res = {
      json: jest.fn(),
      status: jest.fn()
    }

    const err = {
      statusCode: 404
    }

    middleware()(err, null, res, null)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should handle error with additional fields', () => {
    const res = {
      json: jest.fn(),
      status: jest.fn()
    }

    const err = {
      statusCode: 400,
      message: 'Bad request',
      name: 'BadRequestError',
      code: 400,
      type: 'client_error',
      reason: 'Invalid input',
      errors: [{ message: 'Invalid email' }],
      trace: 'trace_id',
      trace_id: 'trace_id',
      isRequestError: true
    }

    middleware()(err, null, res, null)

    expect(res.status).toHaveBeenCalledWith(400)
    const [[clientErr]] = res.json.mock.calls

    expect(clientErr.error).toHaveProperty('status', 400)
    expect(clientErr.error).toHaveProperty('message', 'Bad request')
    expect(clientErr.error).toHaveProperty('name', 'BadRequestError')
    expect(clientErr.error).toHaveProperty('code', 400)
    expect(clientErr.error).toHaveProperty('type', 'client_error')
    expect(clientErr.error).toHaveProperty('reason', 'Invalid input')
    expect(clientErr.error).toHaveProperty('errors', [{ message: 'Invalid email' }])
    expect(clientErr.error).toHaveProperty('trace', 'trace_id')
    expect(clientErr.error).toHaveProperty('trace_id', 'trace_id')
    expect(clientErr.error).toHaveProperty('isRequestError', true)
  })
})
