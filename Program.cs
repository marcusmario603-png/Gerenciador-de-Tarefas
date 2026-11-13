using GerenciadorTarefas;
using GerenciadorTarefas.Models;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var storage = new TaskStorage(Path.Combine(app.Environment.ContentRootPath, "data", "tasks.json"));
var tasks = storage.Load();
var nextId = tasks.Count == 0 ? 1 : tasks.Max(task => task.Id) + 1;

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/tasks", () => Results.Ok(tasks.OrderBy(task => task.IsCompleted).ThenBy(task => task.Id)));

app.MapPost("/api/tasks", (CreateTaskRequest request) =>
{
    var title = request.Title?.Trim();
    if (string.IsNullOrWhiteSpace(title))
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["title"] = ["O título é obrigatório."] });

    var task = new TodoTask
    {
        Id = nextId++,
        Title = title,
        Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
    };
    tasks.Add(task);
    storage.Save(tasks);
    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.MapPatch("/api/tasks/{id:int}/complete", (int id) =>
{
    var task = tasks.FirstOrDefault(item => item.Id == id);
    if (task is null) return Results.NotFound();
    task.IsCompleted = !task.IsCompleted;
    storage.Save(tasks);
    return Results.Ok(task);
});

app.MapDelete("/api/tasks/{id:int}", (int id) =>
{
    var task = tasks.FirstOrDefault(item => item.Id == id);
    if (task is null) return Results.NotFound();
    tasks.Remove(task);
    storage.Save(tasks);
    return Results.NoContent();
});

app.Run();

internal record CreateTaskRequest(string? Title, string? Description);
