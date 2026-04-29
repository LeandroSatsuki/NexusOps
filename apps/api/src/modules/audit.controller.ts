import { Controller, Get, Query } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../common/roles.decorator";
import { PrismaService } from "../common/prisma.service";

@Controller("audit")
@Roles(UserRole.ADMIN, UserRole.GESTOR)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query("entity") entity?: string, @Query("actorId") actorId?: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, actorId },
      include: { actor: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }
}

