# Meu Foco — Gerenciador de Tarefas

Aplicação web full stack para organizar tarefas. O backend usa ASP.NET Core e C#; a interface usa HTML, CSS e JavaScript sem frameworks. As tarefas ficam persistidas em um arquivo JSON local.

## Funcionalidades

- Criar tarefas com título obrigatório e descrição opcional
- Listar, filtrar, concluir e remover tarefas
- Acompanhar contagens e progresso de conclusão
- Manter os dados entre execuções em `data/tasks.json`
- Interface responsiva para desktop e celular

## Requisitos e execução

- .NET 10 SDK

No terminal, entre na pasta do projeto e execute:

```bash
dotnet run
```

O terminal mostrará o endereço local. Abra-o no navegador (normalmente `http://localhost:xxxx`). A primeira alteração cria `data/tasks.json` na pasta do projeto.

## Como o front-end se conecta ao back-end

O navegador carrega `wwwroot/index.html`, `wwwroot/styles.css` e `wwwroot/app.js`. O ASP.NET Core serve esses arquivos estáticos e também disponibiliza a API no mesmo endereço e porta. Por isso, o JavaScript pode chamar caminhos relativos como `/api/tasks`, sem configurar uma URL de outro servidor nem CORS.

O fluxo para criar uma tarefa é:

1. A pessoa preenche o formulário da página.
2. `app.js` captura o envio e usa `fetch()` com `POST /api/tasks`, enviando título e descrição como JSON.
3. O endpoint minimal API em `Program.cs` valida o título, cria um objeto `TodoTask` e o adiciona à lista mantida pelo servidor.
4. `TaskStorage` serializa a lista em `data/tasks.json` e a API devolve a tarefa criada como JSON.
5. O front-end faz novamente `GET /api/tasks` e atualiza a lista e os indicadores na tela.

As outras operações seguem o mesmo padrão: `GET /api/tasks` lê a lista; `PATCH /api/tasks/{id}/complete` alterna o status concluído; `DELETE /api/tasks/{id}` remove. Cada alteração salva o arquivo JSON. A interface não acessa o arquivo diretamente: toda leitura e escrita passam pelo backend.

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/tasks` | Lista as tarefas |
| `POST` | `/api/tasks` | Cria uma tarefa; corpo JSON: `{ "title": "...", "description": "..." }` |
| `PATCH` | `/api/tasks/{id}/complete` | Alterna entre pendente e concluída |
| `DELETE` | `/api/tasks/{id}` | Remove uma tarefa |

## Estrutura principal

```text
GerenciadorTarefas/
├── Models/TodoTask.cs       # Modelo dos dados da tarefa
├── Program.cs               # Servidor ASP.NET Core e endpoints da API
├── TaskStorage.cs           # Leitura e gravação JSON
└── wwwroot/
    ├── index.html           # Estrutura da interface
    ├── styles.css           # Aparência e layout responsivo
    └── app.js               # Chamadas HTTP e atualização da tela
```

## Conceitos praticados

- C# moderno, classes, records, listas e LINQ
- ASP.NET Core Minimal APIs e códigos HTTP
- JSON no corpo de requisições e respostas
- `fetch`, eventos do DOM e renderização segura com `textContent`
- Persistência local com `System.Text.Json`
- Separação entre interface, API, modelo e armazenamento

## Próximos passos

1. Adicionar testes automatizados para os endpoints.
2. Separar operações em um serviço e trocar o JSON por SQLite.
3. Adicionar prazo, prioridade e busca.
4. Implementar autenticação para vários usuários.
