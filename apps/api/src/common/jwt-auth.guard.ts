import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { PrismaService } from "./prisma.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwt: JwtService,
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: { sessionId?: string; sub?: string } }>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new UnauthorizedException("Token ausente.");

    try {
      request.user = await this.jwt.verifyAsync(header.slice(7), {
        secret: process.env.JWT_ACCESS_SECRET
      });
      if (!request.user?.sessionId || !request.user.sub) throw new UnauthorizedException("Token inválido ou expirado.");

      const session = await this.prisma.session.findUnique({
        where: { id: request.user.sessionId },
        include: { user: true }
      });
      if (!session || session.userId !== request.user.sub || session.revokedAt || session.expiresAt < new Date() || session.user.status !== "ATIVO") {
        throw new UnauthorizedException("Token inválido ou expirado.");
      }
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }
  }
}
