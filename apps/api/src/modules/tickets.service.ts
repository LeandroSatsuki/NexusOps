import { Injectable } from "@nestjs/common";
import { CommentVisibility, TicketPriority, TicketStatus } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../common/audit.service";
import { CreateCommentDto, CreateTicketDto, UpdateTicketDto } from "./dtos";

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  list(query: {
    search?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assigneeId?: string;
    requesterId?: string;
    machineId?: string;
    category?: string;
  }) {
    return this.prisma.ticket.findMany({
      where: {
        status: query.status,
        priority: query.priority,
        assigneeId: query.assigneeId,
        requesterId: query.requesterId,
        machineId: query.machineId,
        category: query.category,
        OR: query.search
          ? [{ title: { contains: query.search, mode: "insensitive" } }, { friendlyId: { contains: query.search, mode: "insensitive" } }]
          : undefined
      },
      include: {
        requester: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        machine: true,
        tags: { include: { tag: true } },
        comments: { orderBy: { createdAt: "asc" } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  get(id: string) {
    return this.prisma.ticket.findUniqueOrThrow({
      where: { id },
      include: {
        requester: true,
        assignee: true,
        machine: true,
        checklist: { orderBy: { position: "asc" } },
        attachments: true,
        comments: { orderBy: { createdAt: "asc" }, include: { author: true } },
        activities: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } }
      }
    });
  }

  async create(dto: CreateTicketDto, actorId: string) {
    const sequence = (await this.prisma.ticket.count()) + 1;
    const friendlyId = `CH-${String(sequence).padStart(6, "0")}`;
    const slaPolicy = await this.prisma.slaPolicy.findUnique({ where: { priority: dto.priority } });
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : slaPolicy ? new Date(Date.now() + slaPolicy.resolutionMinutes * 60_000) : undefined;

    const ticket = await this.prisma.ticket.create({
      data: {
        friendlyId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        category: dto.category,
        requesterId: dto.requesterId ?? actorId,
        assigneeId: dto.assigneeId,
        machineId: dto.machineId,
        dueAt,
        channel: dto.channel ?? "MANUAL",
        slaPolicyId: slaPolicy?.id,
        tags: dto.tags?.length
          ? {
              create: dto.tags.map((name) => ({
                tag: { connectOrCreate: { where: { name }, create: { name } } }
              }))
            }
          : undefined,
        activities: { create: { actorId, action: "ticket.created", after: { title: dto.title, priority: dto.priority } } }
      },
      include: { requester: true, assignee: true, machine: true, tags: { include: { tag: true } } }
    });
    await this.audit.log({ actorId, action: "ticket.created", entity: "Ticket", entityId: ticket.id, after: ticket });
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, actorId: string) {
    const before = await this.prisma.ticket.findUniqueOrThrow({ where: { id } });
    const closedAt = dto.status === "FECHADO" ? new Date() : undefined;
    const resolvedAt = dto.status === "RESOLVIDO" ? new Date() : undefined;
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { ...dto, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined, closedAt, resolvedAt },
      include: { requester: true, assignee: true, machine: true, tags: { include: { tag: true } } }
    });
    await this.prisma.ticketActivityLog.create({
      data: { ticketId: id, actorId, action: dto.status && dto.status !== before.status ? "ticket.status_changed" : "ticket.updated", before, after: ticket }
    });
    await this.audit.log({
      actorId,
      action: dto.status && dto.status !== before.status ? "ticket.status_changed" : "ticket.updated",
      entity: "Ticket",
      entityId: id,
      before,
      after: ticket
    });
    return ticket;
  }

  async comment(ticketId: string, dto: CreateCommentDto, actorId: string) {
    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: actorId,
        body: dto.body,
        visibility: dto.internal ? CommentVisibility.INTERNO : CommentVisibility.PUBLICO
      },
      include: { author: true }
    });
    await this.prisma.ticketActivityLog.create({
      data: { ticketId, actorId, action: dto.internal ? "ticket.internal_comment_added" : "ticket.comment_added", after: { commentId: comment.id } }
    });
    await this.audit.log({ actorId, action: "ticket.comment_added", entity: "Ticket", entityId: ticketId, after: { commentId: comment.id } });
    return comment;
  }
}
