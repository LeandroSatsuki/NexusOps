import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { AuditService } from "../common/audit.service";
import { PrismaService } from "../common/prisma.service";
import { Roles } from "../common/roles.decorator";
import { CreateAttachmentDto } from "./dtos";

@Controller("attachments")
export class AttachmentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  @Get()
  list(@Query("ticketId") ticketId: string) {
    return this.prisma.ticketAttachment.findMany({ where: { ticketId }, orderBy: { createdAt: "desc" } });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.SOLICITANTE)
  async create(@Body() dto: CreateAttachmentDto, @CurrentUser() user: RequestUser) {
    const attachment = await this.prisma.ticketAttachment.create({ data: dto });
    await this.audit.log({
      actorId: user.sub,
      action: "ticket.attachment_added",
      entity: "Ticket",
      entityId: dto.ticketId,
      after: { attachmentId: attachment.id, fileName: attachment.fileName }
    });
    return attachment;
  }
}

