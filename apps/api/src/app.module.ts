import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaService } from "./common/prisma.service";
import { AuditService } from "./common/audit.service";
import { JwtAuthGuard } from "./common/jwt-auth.guard";
import { RolesGuard } from "./common/roles.guard";
import { AuthController } from "./modules/auth.controller";
import { AuthService } from "./modules/auth.service";
import { UsersController } from "./modules/users.controller";
import { UsersService } from "./modules/users.service";
import { MachinesController } from "./modules/machines.controller";
import { MachinesService } from "./modules/machines.service";
import { TicketsController } from "./modules/tickets.controller";
import { TicketsService } from "./modules/tickets.service";
import { AlertsController } from "./modules/alerts.controller";
import { AlertsService } from "./modules/alerts.service";
import { DashboardController } from "./modules/dashboard.controller";
import { SlaController } from "./modules/sla.controller";
import { AuditController } from "./modules/audit.controller";
import { CommentsController } from "./modules/comments.controller";
import { AttachmentsController } from "./modules/attachments.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_SECONDS ?? 60) * 1000,
        limit: Number(process.env.RATE_LIMIT_MAX ?? 20)
      }
    ])
  ],
  controllers: [
    AuthController,
    UsersController,
    MachinesController,
    TicketsController,
    AlertsController,
    DashboardController,
    SlaController,
    AuditController,
    CommentsController,
    AttachmentsController
  ],
  providers: [
    PrismaService,
    AuditService,
    AuthService,
    UsersService,
    MachinesService,
    TicketsService,
    AlertsService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AppModule {}
