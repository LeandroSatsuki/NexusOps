using System.Text.Json;
using Microsoft.Extensions.Options;

namespace NexusOps.Agent;

public sealed class MachineIdentityStore
{
    private readonly AgentOptions _options;

    public MachineIdentityStore(IOptions<AgentOptions> options)
    {
        _options = options.Value;
    }

    public async Task<string> GetOrCreateInstallIdAsync(CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_options.StatePath)!);
        if (File.Exists(_options.StatePath))
        {
            AgentState? state = JsonSerializer.Deserialize<AgentState>(await File.ReadAllTextAsync(_options.StatePath, cancellationToken));
            if (!string.IsNullOrWhiteSpace(state?.InstallId)) return state.InstallId;
        }

        string installId = Guid.NewGuid().ToString("N");
        await File.WriteAllTextAsync(_options.StatePath, JsonSerializer.Serialize(new AgentState(installId)), cancellationToken);
        return installId;
    }

    private sealed record AgentState(string InstallId);
}

