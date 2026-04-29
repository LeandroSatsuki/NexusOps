import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { TicketPriority, TicketStatus, UserRole } from "@prisma/client";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Roles } from "../common/roles.decorator";
import { CreateCommentDto, CreateTicketDto, UpdateTicketDto } from "./dtos";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("status") status?: TicketStatus,
    @Query("priority") priority?: TicketPriority,
    @Query("assigneeId") assigneeId?: string,
    @Query("requesterId") requesterId?: string,
    @Query("machineId") machineId?: string,
    @Query("category") category?: string
  ) {
    return this.tickets.list({ search, status, priority, assigneeId, requesterId, machineId, category });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.tickets.get(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.SOLICITANTE)
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: RequestUser) {
    return this.tickets.create(dto, user.sub);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  update(@Param("id") id: string, @Body() dto: UpdateTicketDto, @CurrentUser() user: RequestUser) {
    return this.tickets.update(id, dto, user.sub);
  }

  @Post(":id/comments")
  comment(@Param("id") id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: RequestUser) {
    return this.tickets.comment(id, dto, user.sub);
  }
}
