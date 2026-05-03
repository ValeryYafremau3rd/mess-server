import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateToken(userId: number) {
    const payload = { sub: userId, iss: this.configService.get('ISSUER_ID') };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
