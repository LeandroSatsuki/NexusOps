namespace NexusOps.Agent;

public sealed record HeartbeatPayload(
    string InstallId,
    string Hostname,
    string? LoggedUser,
    string OsName,
    string OsVersion,
    string? LocalIp,
    string? MacAddress,
    string? CpuName,
    int? TotalRamMb,
    int? TotalStorageGb,
    int? FreeStorageGb,
    int? UptimeSeconds,
    string AgentVersion
);

