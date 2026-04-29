using Microsoft.Extensions.Options;

namespace NexusOps.Agent;

public sealed class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly AgentOptions _options;
    private readonly MachineIdentityStore _identityStore;
    private readonly SystemInventoryCollector _collector;
    private readonly HeartbeatClient _client;

    public Worker(
        ILogger<Worker> logger,
        IOptions<AgentOptions> options,
        MachineIdentityStore identityStore,
        SystemInventoryCollector collector,
        HeartbeatClient client)
    {
        _logger = logger;
        _options = options.Value;
        _identityStore = identityStore;
        _collector = collector;
        _client = client;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        string installId = await _identityStore.GetOrCreateInstallIdAsync(stoppingToken);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                HeartbeatPayload payload = _collector.Collect(installId);
                await SendWithRetryAsync(payload, stoppingToken);
                _logger.LogInformation("Heartbeat enviado para {ApiUrl} como {InstallId}", _options.ApiUrl, installId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao enviar heartbeat");
            }

            await Task.Delay(TimeSpan.FromSeconds(Math.Max(15, _options.IntervalSeconds)), stoppingToken);
        }
    }

    private async Task SendWithRetryAsync(HeartbeatPayload payload, CancellationToken cancellationToken)
    {
        for (int attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                await _client.SendAsync(payload, cancellationToken);
                return;
            }
            catch when (attempt < 3)
            {
                await Task.Delay(TimeSpan.FromSeconds(attempt * 5), cancellationToken);
            }
        }

        await _client.SendAsync(payload, cancellationToken);
    }
}

