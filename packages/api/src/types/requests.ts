import { RequestHandler } from 'express'

export type CustomRequestHandler<
  ReqBody,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Locals = Record<string, any>,
  ReqParams = unknown
> = RequestHandler<ReqParams, unknown, ReqBody, unknown, Locals>

export type AuthLocal = {
  accountId: string
}
