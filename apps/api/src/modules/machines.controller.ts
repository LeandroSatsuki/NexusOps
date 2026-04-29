import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { MachineStatus, UserRole } from "@prisma/client";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Public } from "../common/public.decorator";
import { Roles } from "../common/roles.decorator";
import { RegisterHeartbeatDto, UpdateMachineDto } from "./dtos";
import { MachinesService } from "./machines.service";

@Controller()
export class MachinesController {
  constructor(private readonly machines: MachinesService) {}

  @Get("machines")
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  list(
    @Query("search") search?: string,
    @Query("status") status?: MachineStatus,
    @Query("os") os?: string,
    @Query("departmentId") departmentId?: string,
    @Query("branch") branch?: string
  ) {
    return this.machines.list({ search, status, os, departmentId, branch });
  }

  @Get("machines/:id")
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  get(@Param("id") id: string) {
    return this.machines.get(id);
  }

  @Patch("machines/:id")
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  update(@Param("id") id: string, @Body() dto: UpdateMachineDto, @CurrentUser() user: RequestUser) {
    return this.machines.update(id, dto, user.sub);
  }

  @Post("machines/:id/deactivate")
  @Roles(UserRole.ADMIN)
  deactivate(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.machines.deactivate(id, user.sub);
  }

  @Public()
  @Post("machine-heartbeats")
  heartbeat(@Body() dto: RegisterHeartbeatDto, @Headers("authorization") authorization?: string) {
    return this.machines.heartbeat(dto, authorization);
  }
}

