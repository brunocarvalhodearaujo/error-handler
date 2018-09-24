const errorHandler = require('../src')

describe('@brunocarvalho/error-handler', () => {
  describe('exports', () => {
    it('should expose a default function', () => {
      expect(typeof errorHandler).toBe('function')
    })
  })

  describe('usage', () => {
    it('should return an error handler', () => {
      expect(typeof errorHandler()).toBe('function')
    })
  })

  describe('error handler', () => {
    it('should handle an unknown error', () => {
      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      errorHandler()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should handle an invalid status', () => {
      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      err.statusCode = 214

      errorHandler()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('should handle client errors', () => {
      const res = {
        json: jest.fn(),
        status: jest.fn()
      }

      const err = new Error('error')

      err.statusCode = 400

      errorHandler()(err, null, res)

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

      errorHandler()(err, null, res)

      expect(res.status).toHaveBeenCalledWith(400)
      const [[clientErr]] = res.json.mock.calls

      expect(clientErr.error).toHaveProperty('status', 400)
      expect(clientErr.error).toHaveProperty('name', 'Error')
      expect(clientErr.error).toHaveProperty('message', 'error')
      expect(clientErr.error).not.toHaveProperty('stack')
    })
  })
})
