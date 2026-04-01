/**
 * crypto-utils.ts — API Key 加解密工具
 *
 * 使用 AES-256-GCM 加密，密钥从环境变量 AI_KEY_ENCRYPTION_SECRET 读取。
 * 密文格式: base64(iv) + ":" + base64(ciphertext) + ":" + base64(authTag)
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET
  if (!secret) {
    throw new Error('AI_KEY_ENCRYPTION_SECRET environment variable is required for API key encryption')
  }
  // Derive a 32-byte key via SHA-256
  return createHash('sha256').update(secret).digest()
}

/**
 * 加密明文 API Key，返回 "iv:ciphertext:authTag" 格式字符串
 */
export function encryptApiKey(plainText: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plainText, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const authTag = cipher.getAuthTag()

  return `${iv.toString('base64')}:${encrypted}:${authTag.toString('base64')}`
}

/**
 * 解密 API Key
 */
export function decryptApiKey(encryptedText: string): string {
  const parts = encryptedText.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted API key format')
  }

  const [ivB64, ciphertextB64, authTagB64] = parts
  const key = getEncryptionKey()
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertextB64, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * 返回掩码，如 "sk-****xyz"（保留前 4 后 3 字符）
 */
export function maskApiKey(encryptedText: string): string {
  try {
    const plain = decryptApiKey(encryptedText)
    if (plain.length <= 7) return '****'
    return `${plain.slice(0, 4)}****${plain.slice(-3)}`
  } catch {
    return '****'
  }
}
