import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: unknown }>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new UnauthorizedException("Token ausente.");

    try {
      request.user = await this.jwt.verifyAsync(header.slice(7), {
        secret: process.env.JWT_ACCESS_SECRET
      });
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }
  }
}

