using Serilog;
using Server.Util;
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
    builder.WebHost.ConfigureKestrel((context, options) =>
    {
        //options.Listen(IPAddress.Any, 80);
        options.Listen(IPAddress.Any, 443, listenOptions =>
        {
            listenOptions.UseHttps("./certificate.pfx", "Daniel");
        });
    });

    var app = builder.Build();
    app.MapControllers();

    var webSocketOptions = new WebSocketOptions
    {
        KeepAliveInterval = TimeSpan.FromMinutes(2)
    };

    app.UseWebSockets(webSocketOptions);

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