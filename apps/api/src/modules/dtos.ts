import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength
} from "class-validator";
import { AlertRuleType, AlertSeverity, AlertStatus, TicketChannel, TicketPriority, TicketStatus, UserRole, UserStatus } from "@prisma/client";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class RegisterHeartbeatDto {
  @IsOptional()
  @IsString()
  machineId?: string;

  @IsString()
  installId!: string;

  @IsString()
  hostname!: string;

  @IsOptional()
  @IsString()
  loggedUser?: string;

  @IsString()
  osName!: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  localIp?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  cpuName?: string;

  @IsOptional()
  @IsInt()
  totalRamMb?: number;

  @IsOptional()
  @IsInt()
  totalStorageGb?: number;

  @IsOptional()
  @IsInt()
  freeStorageGb?: number;

  @IsOptional()
  @IsInt()
  uptimeSeconds?: number;

  @IsString()
  agentVersion!: string;
}

export class UpdateMachineDto {
  @IsOptional()
  @IsString()
  friendlyName?: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  domainOrWorkgroup?: string;

  @IsOptional()
  @IsString()
  primaryUserId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTicketDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  requesterId?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsEnum(TicketChannel)
  channel?: TicketChannel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

export class CreateCommentDto {
  @IsString()
  body!: string;

  @IsOptional()
  @IsBoolean()
  internal?: boolean;
}

export class CreateAttachmentDto {
  @IsString()
  ticketId!: string;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsString()
  storageKey!: string;
}

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpsertAlertRuleDto {
  @IsEnum(AlertRuleType)
  type!: AlertRuleType;

  @IsString()
  name!: string;

  @IsEnum(AlertSeverity)
  severity!: AlertSeverity;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  thresholdMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  thresholdPercent?: number;

  @IsOptional()
  @IsString()
  expectedAgentVersion?: string;
}

export class UpsertSlaPolicyDto {
  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  firstResponseMinutes!: number;

  @IsInt()
  @Min(1)
  resolutionMinutes!: number;
}
