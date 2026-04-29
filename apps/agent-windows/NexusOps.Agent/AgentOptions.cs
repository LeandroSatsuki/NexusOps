namespace NexusOps.Agent;

public sealed class AgentOptions
{
    public string ApiUrl { get; set; } = Environment.GetEnvironmentVariable("NEXUSOPS_AGENT_API_URL") ?? "http://localhost:3333";
    public string AgentToken { get; set; } = Environment.GetEnvironmentVariable("NEXUSOPS_AGENT_TOKEN") ?? "";
    public int IntervalSeconds { get; set; } = int.TryParse(Environment.GetEnvironmentVariable("NEXUSOPS_AGENT_INTERVAL_SECONDS"), out int seconds) ? seconds : 60;
    public string AgentVersion { get; set; } = "0.1.0";
    public string StatePath { get; set; } = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "NexusOps", "agent-state.json");
}

