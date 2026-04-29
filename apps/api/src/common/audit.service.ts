import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

type AuditInput = {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        before: input.before as object | undefined,
        after: input.after as object | undefined,
        ipAddress: input.ipAddress
      }
    });
  }
}

