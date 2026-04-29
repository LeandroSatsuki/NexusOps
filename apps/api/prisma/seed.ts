import { PrismaClient, TicketPriority, TicketStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = ["Hardware", "Software", "Rede", "Acesso", "Impressora", "E-mail", "ERP", "Segurança", "Outro"];

async function main() {
  const passwordHash = await bcrypt.hash("NexusOps@123", 12);

  const departments = await Promise.all(
    ["TI", "Financeiro", "Operações", "Comercial", "RH"].map((name) =>
      prisma.department.upsert({ where: { name }, create: { name }, update: {} })
    )
  );

  const team = await prisma.team.upsert({ where: { name: "Suporte Interno" }, create: { name: "Suporte Interno" }, update: {} });

  const users = await Promise.all([
    upsertUser("Admin NexusOps", "admin@nexusops.local", UserRole.ADMIN, "Administrador", departments[0].id, passwordHash),
    upsertUser("Ana Técnica", "ana.tecnica@nexusops.local", UserRole.TECNICO, "Analista de Suporte", departments[0].id, passwordHash),
    upsertUser("Bruno Técnico", "bruno.tecnico@nexusops.local", UserRole.TECNICO, "Técnico de Campo", departments[0].id, passwordHash),
    upsertUser("Carla Gestora", "carla.gestora@nexusops.local", UserRole.GESTOR, "Gestora de Operações", departments[2].id, passwordHash),
    upsertUser("Diego Solicitante", "diego@nexusops.local", UserRole.SOLICITANTE, "Analista Financeiro", departments[1].id, passwordHash),
    upsertUser("Elisa Solicitante", "elisa@nexusops.local", UserRole.SOLICITANTE, "Vendedora", departments[3].id, passwordHash),
    upsertUser("Fernanda Solicitante", "fernanda@nexusops.local", UserRole.SOLICITANTE, "RH Business Partner", departments[4].id, passwordHash)
  ]);

  await Promise.all(
    [
      { priority: TicketPriority.BAIXA, name: "Baixa", firstResponseMinutes: 480, resolutionMinutes: 4320 },
      { priority: TicketPriority.MEDIA, name: "Média", firstResponseMinutes: 240, resolutionMinutes: 1440 },
      { priority: TicketPriority.ALTA, name: "Alta", firstResponseMinutes: 60, resolutionMinutes: 480 },
      { priority: TicketPriority.CRITICA, name: "Crítica", firstResponseMinutes: 15, resolutionMinutes: 120 }
    ].map((policy) => prisma.slaPolicy.upsert({ where: { priority: policy.priority }, create: policy, update: policy }))
  );

  await Promise.all([
    prisma.alertRule.upsert({
      where: { type: "MACHINE_OFFLINE" },
      create: { type: "MACHINE_OFFLINE", name: "Máquina offline", severity: "ALTA", thresholdMinutes: 30 },
      update: { name: "Máquina offline", severity: "ALTA", thresholdMinutes: 30 }
    }),
    prisma.alertRule.upsert({
      where: { type: "LOW_DISK" },
      create: { type: "LOW_DISK", name: "Disco livre abaixo do limite", severity: "ALTA", thresholdPercent: 15 },
      update: { name: "Disco livre abaixo do limite", severity: "ALTA", thresholdPercent: 15 }
    }),
    prisma.alertRule.upsert({
      where: { type: "OUTDATED_AGENT" },
      create: { type: "OUTDATED_AGENT", name: "Agente desatualizado", severity: "MEDIA", expectedAgentVersion: "0.1.0" },
      update: { name: "Agente desatualizado", severity: "MEDIA", expectedAgentVersion: "0.1.0" }
    }),
    prisma.alertRule.upsert({
      where: { type: "MISSING_HEARTBEAT" },
      create: { type: "MISSING_HEARTBEAT", name: "Heartbeat atrasado", severity: "ALTA", thresholdMinutes: 45 },
      update: { name: "Heartbeat atrasado", severity: "ALTA", thresholdMinutes: 45 }
    })
  ]);

  const machines = [];
  for (let i = 1; i <= 15; i += 1) {
    const department = departments[i % departments.length];
    const machine = await prisma.machine.upsert({
      where: { installId: `seed-install-${i}` },
      create: {
        installId: `seed-install-${i}`,
        hostname: `NB-CORP-${String(i).padStart(3, "0")}`,
        friendlyName: `Notebook Corporativo ${i}`,
        assetTag: `PAT-${String(1000 + i)}`,
        serialNumber: `SNXOPS${String(i).padStart(5, "0")}`,
        osName: "Windows 11 Pro",
        osVersion: i % 3 === 0 ? "23H2" : "24H2",
        domainOrWorkgroup: "CORP",
        primaryUserId: users[4 + (i % 3)].id,
        currentUser: users[4 + (i % 3)].email,
        localIp: `192.168.10.${30 + i}`,
        macAddress: `00-11-22-33-44-${String(i).padStart(2, "0")}`,
        cpuName: i % 2 === 0 ? "Intel Core i5" : "AMD Ryzen 5",
        totalRamMb: i % 4 === 0 ? 32768 : 16384,
        totalStorageGb: 512,
        freeStorageGb: i % 5 === 0 ? 35 : 220,
        status: i % 6 === 0 ? "OFFLINE" : "ONLINE",
        lastHeartbeatAt: new Date(Date.now() - (i % 6 === 0 ? 90 : 5) * 60_000),
        agentVersion: i % 4 === 0 ? "0.0.9" : "0.1.0",
        departmentId: department.id,
        branch: i % 2 === 0 ? "Matriz" : "Filial Campinas",
        notes: "Carga inicial de demonstração."
      },
      update: {}
    });
    machines.push(machine);
    await prisma.machineHeartbeat.create({
      data: {
        machineId: machine.id,
        hostname: machine.hostname,
        loggedUser: machine.currentUser,
        osName: machine.osName,
        osVersion: machine.osVersion,
        localIp: machine.localIp,
        cpuName: machine.cpuName,
        totalRamMb: machine.totalRamMb,
        totalStorageGb: machine.totalStorageGb,
        freeStorageGb: machine.freeStorageGb,
        uptimeSeconds: 3600 * i,
        agentVersion: machine.agentVersion
      }
    });
  }

  for (let i = 1; i <= 20; i += 1) {
    const priority = [TicketPriority.BAIXA, TicketPriority.MEDIA, TicketPriority.ALTA, TicketPriority.CRITICA][i % 4];
    const status = Object.values(TicketStatus)[i % Object.values(TicketStatus).length];
    const sla = await prisma.slaPolicy.findUnique({ where: { priority } });
    await prisma.ticket.upsert({
      where: { friendlyId: `CH-${String(i).padStart(6, "0")}` },
      create: {
        friendlyId: `CH-${String(i).padStart(6, "0")}`,
        title: `Chamado de ${categories[i % categories.length].toLowerCase()} ${i}`,
        description: `Solicitação criada na carga inicial para validar o fluxo operacional ${i}.`,
        status,
        priority,
        category: categories[i % categories.length],
        requesterId: users[4 + (i % 3)].id,
        assigneeId: users[1 + (i % 2)].id,
        teamId: team.id,
        machineId: machines[i % machines.length].id,
        slaPolicyId: sla?.id,
        dueAt: new Date(Date.now() + (i - 5) * 60 * 60_000),
        channel: i % 5 === 0 ? "ALERTA" : "PORTAL",
        comments: {
          create: {
            authorId: users[1 + (i % 2)].id,
            body: "Comentário inicial para demonstrar histórico do chamado.",
            visibility: "PUBLICO"
          }
        },
        activities: { create: { actorId: users[0].id, action: "ticket.seeded", after: { seed: true } } }
      },
      update: {}
    });
  }

  for (let i = 0; i < 5; i += 1) {
    await prisma.alert.create({
      data: {
        machineId: machines[i * 2].id,
        title: i % 2 === 0 ? "Máquina sem heartbeat recente" : "Disco com pouco espaço livre",
        description: "Alerta inicial para validação operacional.",
        severity: i % 2 === 0 ? "ALTA" : "MEDIA",
        status: i === 0 ? "RECONHECIDO" : "ABERTO",
        assigneeId: users[1].id
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: users[0].id,
      action: "seed.completed",
      entity: "System",
      after: { users: users.length, machines: machines.length, tickets: 20 }
    }
  });

  console.log("Seed concluído. Login: admin@nexusops.local / NexusOps@123");
}

async function upsertUser(name: string, email: string, role: UserRole, jobTitle: string, departmentId: string, passwordHash: string) {
  return prisma.user.upsert({
    where: { email },
    create: { name, email, role, jobTitle, departmentId, passwordHash },
    update: { name, role, jobTitle, departmentId }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
