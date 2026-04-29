using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace NexusOps.Agent;

public sealed class HeartbeatClient
{
    private readonly HttpClient _httpClient;
    private readonly AgentOptions _options;

    public HeartbeatClient(HttpClient httpClient, IOptions<AgentOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task SendAsync(HeartbeatPayload payload, CancellationToken cancellationToken)
    {
        using HttpRequestMessage request = new(HttpMethod.Post, $"{_options.ApiUrl.TrimEnd('/')}/api/machine-heartbeats");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.AgentToken);
        request.Content = JsonContent.Create(payload, options: new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web));

        using HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}

