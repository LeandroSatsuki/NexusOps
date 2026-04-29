import { Controller, Get } from "@nestjs/common";
import { TicketPriority, TicketStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { Roles } from "../common/roles.decorator";

@Controller("dashboard")
@Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async summary() {
    const [
      totalMachines,
      onlineMachines,
      offlineMachines,
      openAlerts,
      openTickets,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByTechnician,
      recentEvents,
      recentTickets,
      assetsWithMoreTickets
    ] = await Promise.all([
      this.prisma.machine.count({ where: { status: { not: "INATIVO" } } }),
      this.prisma.machine.count({ where: { status: "ONLINE" } }),
      this.prisma.machine.count({ where: { status: "OFFLINE" } }),
      this.prisma.alert.count({ where: { status: "ABERTO" } }),
      this.prisma.ticket.count({ where: { status: { in: ["NOVO", "TRIAGEM", "EM_ANDAMENTO", "AGUARDANDO_USUARIO", "AGUARDANDO_TERCEIRO"] } } }),
      this.groupTicketsByStatus(),
      this.groupTicketsByPriority(),
      this.prisma.ticket.groupBy({ by: ["assigneeId"], _count: true, where: { assigneeId: { not: null } } }),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { actor: true } }),
      this.prisma.ticket.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { requester: true, assignee: true, machine: true } }),
      this.prisma.ticket.groupBy({ by: ["machineId"], _count: true, where: { machineId: { not: null } }, orderBy: { _count: { machineId: "desc" } }, take: 8 })
    ]);

    return {
      cards: { totalMachines, onlineMachines, offlineMachines, openAlerts, openTickets },
      ticketsByStatus,
      ticketsByPriority,
      ticketsByTechnician,
      recentEvents,
      recentTickets,
      assetsWithMoreTickets,
      serviceMetrics: {
        overdueTickets: await this.prisma.ticket.count({ where: { dueAt: { lt: new Date() }, status: { notIn: ["FECHADO", "CANCELADO"] } } }),
        resolvedTickets: await this.prisma.ticket.count({ where: { status: TicketStatus.RESOLVIDO } })
      }
    };
  }

  private async groupTicketsByStatus() {
    const rows = await this.prisma.ticket.groupBy({ by: ["status"], _count: true });
    return Object.fromEntries(Object.values(TicketStatus).map((status) => [status, rows.find((row) => row.status === status)?._count ?? 0]));
  }

  private async groupTicketsByPriority() {
    const rows = await this.prisma.ticket.groupBy({ by: ["priority"], _count: true });
    return Object.fromEntries(Object.values(TicketPriority).map((priority) => [priority, rows.find((row) => row.priority === priority)?._count ?? 0]));
  }
}

