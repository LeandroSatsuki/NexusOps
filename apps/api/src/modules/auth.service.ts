import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../common/audit.service";
import { ChangePasswordDto, LoginDto } from "./dtos";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  jobTitle: true,
  role: true,
  status: true,
  avatarUrl: true,
  department: true,
  createdAt: true,
  updatedAt: true
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService
  ) {}

  async login(dto: LoginDto, meta: { ipAddress?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.status !== UserStatus.ATIVO) throw new UnauthorizedException("Credenciais inválidas.");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Credenciais inválidas.");

    const expiresAt = new Date(Date.now() + Number(process.env.JWT_REFRESH_TTL_DAYS ?? 14) * 24 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshHash: "pending",
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt
      }
    });

    const accessToken = await this.signAccess(user.id, user.email, user.role, session.id);
    const refreshToken = await this.signRefresh(user.id, session.id);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshHash: await bcrypt.hash(refreshToken, Number(process.env.BCRYPT_ROUNDS ?? 12)) }
    });
    await this.audit.log({ actorId: user.id, action: "auth.login", entity: "Session", entityId: session.id, ipAddress: meta.ipAddress });

    return {
      accessToken,
      refreshToken,
      user: await this.prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUserSelect })
    };
  }

  async refresh(refreshToken: string, meta: { ipAddress?: string }) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sessionId: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });
      const session = await this.prisma.session.findUnique({ where: { id: payload.sessionId }, include: { user: true } });
      if (!session || session.revokedAt || session.expiresAt < new Date()) throw new UnauthorizedException("Sessão expirada.");
      const valid = await bcrypt.compare(refreshToken, session.refreshHash);
      if (!valid) throw new UnauthorizedException("Refresh token inválido.");

      await this.prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date(), ipAddress: meta.ipAddress } });
      return {
        accessToken: await this.signAccess(session.user.id, session.user.email, session.user.role, session.id)
      };
    } catch {
      throw new UnauthorizedException("Refresh token inválido.");
    }
  }

  async logout(actorId: string, sessionId?: string, ipAddress?: string) {
    if (sessionId) {
      await this.prisma.session.updateMany({ where: { id: sessionId, userId: actorId }, data: { revokedAt: new Date() } });
      await this.audit.log({ actorId, action: "auth.logout", entity: "Session", entityId: sessionId, ipAddress });
    }
    return { ok: true };
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: publicUserSelect });
  }

  async changePassword(userId: string, dto: ChangePasswordDto, ipAddress?: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException("Senha atual inválida.");
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, Number(process.env.BCRYPT_ROUNDS ?? 12)) }
    });
    await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit.log({ actorId: userId, action: "auth.password_changed", entity: "User", entityId: userId, ipAddress });
    return { ok: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) await this.audit.log({ actorId: user.id, action: "auth.password_reset_requested", entity: "User", entityId: user.id });
    return { ok: true, message: "Se o e-mail existir, o fluxo de recuperação será iniciado. Envio real está mockado no dev." };
  }

  private signAccess(sub: string, email: string, role: string, sessionId: string) {
    return this.jwt.signAsync(
      { sub, email, role, sessionId },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL ?? "15m" }
    );
  }

  private signRefresh(sub: string, sessionId: string) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 14);
    return this.jwt.signAsync({ sub, sessionId }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: `${days}d` });
  }
}

