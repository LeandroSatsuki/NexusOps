import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../common/audit.service";
import { CreateUserDto, UpdateUserDto } from "./dtos";

const userSelect = {
  id: true,
  name: true,
  email: true,
  jobTitle: true,
  role: true,
  status: true,
  avatarUrl: true,
  department: true,
  createdAt: true,
  updatedAt: true
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  list(query: { search?: string; role?: UserRole }) {
    return this.prisma.user.findMany({
      where: {
        role: query.role,
        OR: query.search
          ? [{ name: { contains: query.search, mode: "insensitive" } }, { email: { contains: query.search, mode: "insensitive" } }]
          : undefined
      },
      orderBy: { name: "asc" },
      select: userSelect
    });
  }

  get(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect });
  }

  async create(dto: CreateUserDto, actorId: string) {
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, Number(process.env.BCRYPT_ROUNDS ?? 12)),
        jobTitle: dto.jobTitle,
        departmentId: dto.departmentId,
        role: dto.role
      },
      select: userSelect
    });
    await this.audit.log({ actorId, action: "user.created", entity: "User", entityId: user.id, after: user });
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const before = await this.prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect });
    const user = await this.prisma.user.update({ where: { id }, data: dto, select: userSelect });
    const action = dto.role && dto.role !== before.role ? "user.role_changed" : "user.updated";
    await this.audit.log({ actorId, action, entity: "User", entityId: id, before, after: user });
    return user;
  }
}

