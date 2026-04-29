import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { Roles } from "../common/roles.decorator";
import { CreateUserDto, UpdateUserDto } from "./dtos";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  list(@Query("search") search?: string, @Query("role") role?: UserRole) {
    return this.users.list({ search, role });
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  get(@Param("id") id: string) {
    return this.users.get(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto, @CurrentUser() user: RequestUser) {
    return this.users.create(dto, user.sub);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: RequestUser) {
    return this.users.update(id, dto, user.sub);
  }
}

