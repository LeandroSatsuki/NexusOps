import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { AlertStatus, UserRole } from "@prisma/client";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Roles } from "../common/roles.decorator";
import { UpdateAlertDto, UpsertAlertRuleDto } from "./dtos";
import { AlertsService } from "./alerts.service";

@Controller("alerts")
@Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Get()
  list(@Query("status") status?: AlertStatus, @Query("machineId") machineId?: string) {
    return this.alerts.list({ status, machineId });
  }

  @Get("rules")
  rules() {
    return this.alerts.rules();
  }

  @Patch("rules")
  @Roles(UserRole.ADMIN)
  upsertRule(@Body() dto: UpsertAlertRuleDto, @CurrentUser() user: RequestUser) {
    return this.alerts.upsertRule(dto, user.sub);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateAlertDto, @CurrentUser() user: RequestUser) {
    return this.alerts.update(id, dto, user.sub);
  }
}
