import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type RequestUser = {
  sub: string;
  email: string;
  role: string;
  sessionId?: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
  return req.user;
});

