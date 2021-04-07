import { Response } from 'express'

export const errorResponse = (
  res: Response,
  status = 500,
  message = 'Something went wrong'
): void => {
  res
    .status(status)
    .json({
      success: false,
      error: message
    })
    .end()
}
