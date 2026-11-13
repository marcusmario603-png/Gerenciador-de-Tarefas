using System.Text.Json;
using GerenciadorTarefas.Models;

namespace GerenciadorTarefas;

public class TaskStorage(string filePath)
{
    private readonly JsonSerializerOptions _options = new() { WriteIndented = true };

    public List<TodoTask> Load()
    {
        if (!File.Exists(filePath)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<TodoTask>>(File.ReadAllText(filePath)) ?? [];
        }
        catch (JsonException)
        {
            Console.WriteLine("Aviso: o arquivo de tarefas está inválido. Uma lista vazia será usada.");
            return [];
        }
    }

    public void Save(IEnumerable<TodoTask> tasks)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        File.WriteAllText(filePath, JsonSerializer.Serialize(tasks, _options));
    }
}
