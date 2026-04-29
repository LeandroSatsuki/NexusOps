import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { PrismaService } from "../common/prisma.service";
import { TicketsService } from "./tickets.service";
import { CreateCommentDto } from "./dtos";

@Controller("comments")
export class CommentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tickets: TicketsService
  ) {}

  @Get()
  list(@Query("ticketId") ticketId: string) {
    return this.prisma.ticketComment.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" }
    });
  }

  @Post(":ticketId")
  create(@Param("ticketId") ticketId: string, @Body() dto: CreateCommentDto, @CurrentUser() user: RequestUser) {
    return this.tickets.comment(ticketId, dto, user.sub);
  }
}

