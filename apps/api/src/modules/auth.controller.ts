import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Public } from "../common/public.decorator";
import { AuthService } from "./auth.service";
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshDto } from "./dtos";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, { ipAddress: req.ip, userAgent: req.headers["user-agent"] });
  }

  @Public()
  @Post("refresh")
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
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }
}

