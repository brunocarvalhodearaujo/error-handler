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
  status?: number,
  code?: number,
  name?: string,
  type?: string,
  errors?: string,
  trace?: string,
  trace_id?: string,
  reason?: string,
  [key: string]: any
}

export type Options = {
  withTrace?: boolean
}

declare function middleware (options?: Options): (
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => any

export declare function yupErrorHandlerMiddleware(): (
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => any

export default middleware
