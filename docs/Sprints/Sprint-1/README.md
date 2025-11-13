# Plataforma de Gestão Integrada
## Documentação da Sprint 1

Este documento apresenta as principais informações sobre a Sprint 1 do projeto Plataforma de Gestão Integrada. Aqui estão o objetivo da sprint, o MVP definido, a lista do backlog, além dos critérios de prontidão (Definition of Ready) e de conclusão (Definition of Done).

---

**Sumário**
- Objetivo
- MVP
- Sprint Backlog
- Definition of Ready
- Definition of Done

---

### Objetivo
O foco nesta sprint é lançar a base da plataforma, priorizando cadastro de colaboradores, clientes, controle de permissões, autenticação e recursos operacionais fundamentais.

---

### MVP

| Recurso                               | Descrição                                                         |
| -------------------------------------- | ----------------------------------------------------------------- |
| Cadastro de Colaboradores              | Permite ao RH adicionar novos membros para uso da plataforma.      |
| Cadastro e Edição de Clientes          | Adicionar novos clientes e editar as informações dos já existentes.|
| Preenchimento de Checklists operacionais| Operadores podem registrar operações e anexar fotos.               |
| Gestão de Permissões                   | Administradores controlam níveis de acesso de usuários.            |
| Autenticação de Usuários               | Login seguro para todos os membros.                                |
| Indicação de Localização de Trabalho   | Colaboradores informam se estão em Home Office, Presencial ou Evento ao logar. |
| Acesso rápido a formulários            | Colaboradores terceiros acessam formulários sem login.             |
| Painel de Localização                  | RH pode visualizar onde cada colaborador está trabalhando.         |
| Histórico de Interações                | Vendedores registram todas as interações realizadas com clientes.  |

---

### Sprint Backlog

| Id  | Prioridade | User Stories                                                                                                                   |
| :-: | :--------: | ------------------------------------------------------------------------------------------------------------------------------ |
| 01  | Alta       | Como Analista de RH, quero cadastrar novos colaboradores para acesso à plataforma.                                             |
| 02  | Alta       | Como Vendedor, quero cadastrar novo cliente, incluindo documentos e contatos.                                                  |
| 03  | Alta       | Como Operador, quero preencher checklists operacionais e anexar fotos.                                                         |
| 04  | Alta       | Como Vendedor, quero editar informações de cliente já cadastrado.                                                              |
| 05  | Alta       | Como Administrador, quero gerenciar os níveis de permissão dos usuários.                                                       |
| 09  | Alta       | Como Colaborador, quero informar minha localização de trabalho ao logar (Home Office, Presencial ou Evento).                   |
| 14  | Média      | Como Colaborador Terceiro sem cadastro de login, quero acessar diretamente os formulários.                                     |
| 15  | Média      | Como Gestor de RH, quero visualizar um painel com a localização de trabalho de todos os colaboradores.                         |
| 20  | Média      | Como Vendedor, quero registrar o histórico de interações com clientes.                                                         |

---

### Definition of Ready

**Critérios para User Stories**
- Título claro e objetivo compreendido pela equipe
- Critérios de aceitação documentados
- Regras de negócio definidas
- Estimativa feita pelo time
- Sem dependências bloqueadoras
- Equipe compreende totalmente a tarefa

**Critérios para artefatos relacionados**
- Design ou documentação disponível
- Detalhamento das regras de negócio (texto ou diagrama)
- Modelo de dados definido
- Estratégia de testes estabelecida


### Definition of Done

- Código testado de acordo com os cenários levantados no backlog
- Upload do código no repositório seguindo padrões de commit da equipe
- Informar o PO sobre a finalização da tarefa para validação
- Registrar o tempo de realização no Jira ou informar diretamente PO/SM