using NexusOps.Agent;

HostApplicationBuilder builder = Host.CreateApplicationBuilder(args);
builder.Services.AddWindowsService(options => options.ServiceName = "NexusOps Agent");
builder.Services.Configure<AgentOptions>(builder.Configuration.GetSection("NexusOps"));
builder.Services.AddHttpClient<HeartbeatClient>();
builder.Services.AddSingleton<MachineIdentityStore>();
builder.Services.AddSingleton<SystemInventoryCollector>();
builder.Services.AddHostedService<Worker>();

IHost host = builder.Build();
host.Run();

