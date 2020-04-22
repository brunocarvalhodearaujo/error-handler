/**
 * Copyright (c) 2020-present, Bruno Carvalho de Araujo.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Request, Response, NextFunction } from 'express'

export type RequestError = Error & {
  statusCode?: number,
  reason?: string
}

type Options = {
  withTrace?: boolean
}

type middleware = (options?: Options) => (
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => void

export default middleware
