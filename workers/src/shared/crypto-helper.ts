// Lightweight crypto helper for workers (no NestJS DI)
import * as crypto from 'crypto';

export class CryptoService {
  private static getKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET || '';
    return crypto.createHash('sha256').update(secret).digest();
  }

  static decrypt(encryptedValue: string): string {
    const [ivHex, authTagHex, cipherHex] = encryptedValue.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(cipherHex, 'hex');
    const key = this.getKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}
