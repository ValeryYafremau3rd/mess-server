import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateToken(token: string) {
    try {
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length < 2) return null;

      const payloadBase64 = parts[1];
      const decodedString = Buffer.from(payloadBase64, 'base64').toString();
      const payload = JSON.parse(decodedString);

      return payload;
    } catch (error) {
      console.error('Token error:', error.message);
      return null;
    }
  }
}
