import { Body, Controller, Get, Inject, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Public } from "../common/public.decorator";
import { AuthService } from "./auth.service";
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshDto } from "./dtos";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, { ipAddress: req.ip, userAgent: req.headers["user-agent"] });
  }

  @Public()
  @Post("refresh")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, { ipAddress: req.ip });
  }

  @Post("logout")
  logout(@CurrentUser() user: RequestUser, @Req() req: Request) {
    return this.auth.logout(user.sub, user.sessionId, req.ip);
  }

  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user.sub);
  }

  @Post("change-password")
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto, @Req() req: Request) {
    return this.auth.changePassword(user.sub, dto, req.ip);
  }

  @Public()
  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }
}
