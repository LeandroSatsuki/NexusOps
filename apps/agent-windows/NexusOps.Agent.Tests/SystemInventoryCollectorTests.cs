using NexusOps.Agent;
using Xunit;

namespace NexusOps.Agent.Tests;

public sealed class SystemInventoryCollectorTests
{
    [Fact]
    public void ToGb_RoundsBytesToGigabytes()
    {
        Assert.Equal(2, SystemInventoryCollector.ToGb(2L * 1024 * 1024 * 1024));
    }
}
