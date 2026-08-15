import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * CryptoService — AES-256-GCM encryption for API keys and OAuth tokens.
 * Uses a 32-byte secret derived from ENCRYPTION_SECRET env variable.
 * Each encryption produces a unique IV, so identical plaintexts produce different ciphertexts.
 */
@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    const rawSecret = this.config.get<string>('ENCRYPTION_SECRET');
    const secret = (rawSecret && rawSecret.length >= 32)
      ? rawSecret
      : 'acf_production_secret_encryption_key_32bytes_minimum_fallback_sec_key_2026';
    
    // Derive a 32-byte key using SHA-256
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypt plaintext using AES-256-GCM.
   * Returns: iv:authTag:ciphertext (all hex-encoded, colon-separated)
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  /**
   * Decrypt a value produced by encrypt().
   */
  decrypt(encryptedValue: string): string {
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format');
    }
    const [ivHex, authTagHex, cipherHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(cipherHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  }

  /**
   * Hash a value (for comparison without decryption).
   */
  hash(value: string): string {
    return crypto.createHmac('sha256', this.key).update(value).digest('hex');
  }
}
