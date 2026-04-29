using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Options;

namespace NexusOps.Agent;

public sealed class SystemInventoryCollector
{
    private readonly AgentOptions _options;

    public SystemInventoryCollector(IOptions<AgentOptions> options)
    {
        _options = options.Value;
    }

    public HeartbeatPayload Collect(string installId)
    {
        DriveInfo? systemDrive = DriveInfo.GetDrives().FirstOrDefault(drive => drive.IsReady && drive.Name.StartsWith(Path.GetPathRoot(Environment.SystemDirectory) ?? "C:"));
        IPAddress? ip = Dns.GetHostAddresses(Dns.GetHostName()).FirstOrDefault(address => address.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(address));
        NetworkInterface? nic = NetworkInterface.GetAllNetworkInterfaces().FirstOrDefault(item => item.OperationalStatus == OperationalStatus.Up && item.NetworkInterfaceType != NetworkInterfaceType.Loopback);

        return new HeartbeatPayload(
            InstallId: installId,
            Hostname: Environment.MachineName,
            LoggedUser: Environment.UserName,
            OsName: RuntimeInformation.OSDescription,
            OsVersion: Environment.OSVersion.VersionString,
            LocalIp: ip?.ToString(),
            MacAddress: nic == null ? null : string.Join("-", nic.GetPhysicalAddress().GetAddressBytes().Select(b => b.ToString("X2"))),
            CpuName: Environment.GetEnvironmentVariable("PROCESSOR_IDENTIFIER"),
            TotalRamMb: GetTotalRamMb(),
            TotalStorageGb: systemDrive == null ? null : ToGb(systemDrive.TotalSize),
            FreeStorageGb: systemDrive == null ? null : ToGb(systemDrive.AvailableFreeSpace),
            UptimeSeconds: (int)(Stopwatch.GetTimestamp() / Stopwatch.Frequency),
            AgentVersion: _options.AgentVersion
        );
    }

    private static int? GetTotalRamMb()
    {
        if (!OperatingSystem.IsWindows()) return null;
        return GC.GetGCMemoryInfo().TotalAvailableMemoryBytes > 0 ? (int)(GC.GetGCMemoryInfo().TotalAvailableMemoryBytes / 1024 / 1024) : null;
    }

    public static int ToGb(long bytes) => (int)Math.Round(bytes / 1024d / 1024d / 1024d);
}

