using Serilog;
using Server.Services;
using Server.Util;
using SignalingServer.MiddleWare;
using System.Net;
//Serilog
var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile($"appsettings.{environmentName}.json", optional: true, reloadOnChange: true)
    .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .Enrich.With<TaipeiTime>()
    .CreateLogger();
try
{
    var builder = WebApplication.CreateBuilder(args);

    //Serilog
    builder.Host.UseSerilog();
    // Add services to the container.
    builder.Services.AddControllers();
    builder.Services.AddSingleton<RoomManager>();
    builder.WebHost.ConfigureKestrel((context, options) =>
    {
        //options.Listen(IPAddress.Any, 80);
        options.Listen(IPAddress.Any, 443, listenOptions =>
        {
            listenOptions.UseHttps("./server.pfx", "Daniel");
        });
    });

    var app = builder.Build();
    app.MapControllers();

    var webSocketOptions = new WebSocketOptions
    {
        KeepAliveInterval = TimeSpan.FromMinutes(2)
    };

    app.UseWebSockets(webSocketOptions);
    app.AuthenticationMiddleware();

    app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}