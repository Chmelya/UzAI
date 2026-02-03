using UzAI.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddPersistence(builder.Configuration)
    .AddApplicationServices()
    .AddApiServices();

var app = builder.Build();

app.ConfigurePipeline();

app.Run();
