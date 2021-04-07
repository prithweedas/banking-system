import crypto from 'crypto'

const ITERATIONS = 2095

const INTERNAL_PASSWORD = process.env.INTERNAL_PASSWORD || ''

export const encrypt = function (text: string, password?: string) {
  const iv = crypto.randomBytes(16)
  const salt = crypto.randomBytes(64)
  const key = !password
    ? crypto.pbkdf2Sync(INTERNAL_PASSWORD, salt, ITERATIONS, 32, 'sha512')
    : crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha512')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
}

export const decrypt = function (encdata: string, password?: string) {
  const bData = Buffer.from(encdata, 'base64')
  const salt = bData.slice(0, 64)
  const iv = bData.slice(64, 80)
  const tag = bData.slice(80, 96)
  const text = bData.slice(96)
  const key = !password
    ? crypto.pbkdf2Sync(INTERNAL_PASSWORD, salt, ITERATIONS, 32, 'sha512')
    : crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha512')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = decipher.update(text) + decipher.final('utf-8')
  return decrypted
}
