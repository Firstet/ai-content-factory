import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAdminUser();
  }

  async ensureDefaultAdminUser() {
    try {
      const email = 'admin@aicontentfactory.local';
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (!existing) {
        const passwordHash = await bcrypt.hash('ChangeMe!2024', 12);
        await this.prisma.user.create({
          data: {
            id: 'user-admin-id',
            email,
            name: 'Content Studio Admin',
            passwordHash,
            role: 'ADMIN',
            isActive: true,
          },
        });
        console.log('[AuthService] Auto-seeded default admin user (admin@aicontentfactory.local).');
      }
    } catch (err: any) {
      console.warn('[AuthService] Error seeding default admin user:', err.message);
    }
  }

  async validateUser(email: string, password: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-provision default admin if logging in with default credentials
      if (email === 'admin@aicontentfactory.local' && password === 'ChangeMe!2024') {
        await this.ensureDefaultAdminUser();
        user = await this.prisma.user.findUnique({ where: { email } });
      }
    }

    if (!user || !user.isActive) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: 'EDITOR',
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refreshTokens(userId: string, token: string) {
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId, token, isRevoked: false },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(userId: string, token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, token },
      data: { isRevoked: true },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
    return { message: 'All sessions revoked' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token and persist
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
    };
  }
}
