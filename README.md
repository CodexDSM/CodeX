# 1. Projeto API - Equipe CodeX

## Plataforma de Gestão Integrada - Newe Log

![Status](https://img.shields.io/badge/status-em--desenvolvimento-yellow)

-----

## 2\. Descrição do Desafio 

A Newe Log, nossa empresa parceira, enfrenta desafios operacionais devido à descentralização de seus processos em múltiplas ferramentas, como Microsoft Lists, Google Forms e planilhas diversas. Essa fragmentação resulta em retrabalho, risco de erros, e dificulta a obtenção de uma visão consolidada dos dados comerciais, operacionais e administrativos.

**A dor principal** é a falta de uma única ferramenta, o que impacta a agilidade na tomada de decisões e a eficiência das equipes.

Nosso desafio é desenvolver uma **plataforma web integrada** que centralize esses processos, automatize tarefas manuais e forneça dashboards com indicadores chaves, garantindo maior controle e eficiência para a empresa.

-----

## 3\. Backlog de Produto

A tabela abaixo representa a lista de funcionalidades priorizadas para o desenvolvimento do produto.

| Rank | Prioridade | User Story |
| :--- | :--- | :--- |
| 1 | Alta | Como um Vendedor, eu quero registrar uma venda e notificar o time Operacional automaticamente. |
| 2 | Alta | Como um Operacional, eu quero visualizar um painel com os fretes que acabaram de ser vendidos. |
| 11 | Média | Como um Gestor de RH, eu quero visualizar um painel com a localizacao de trabalho de todos os colaboradores. |
| ... | ... | ... |

**Para ver o Backlog completo, [clique aqui](./docs/ProductBacklog_CodeX_API2DSM.pdf).**

-----

## 4\. Cronograma de Evolução do Projeto

O desenvolvimento foi dividido em 3 Sprints, cada uma com um objetivo claro para a entrega de valor contínuo.

### **Sprint 1: Estrutura e Fluxo Principal**

  * **Status:** *Concluído*
  * **Período:** 08/09/2025 a 28/09/2025
  * **Foco:** Construir o esqueleto do sistema, permitindo que o fluxo principal (Venda \> Operação \> Faturamento) funcione de ponta a ponta.

### **Sprint 2:  <br>**

  * **Status:** *Concluído*
  * **Período:** 06/10/2025 a 26/10/2025
  * **Foco:** Implementação da página de eventos, automatização da cotações de fretes e melhorias no sistema conforme planejado.

### **Sprint 3: <br>**

  * **Status:** *Em Andamento*
  * **Período:** 03/11/2025 a 23/11/2025
  * **Foco:** Integração dos módulos e ajustes a partir dos feedbacks das Sprints.

-----

## 5\. Tabela Descritiva das Sprints

| Sprint | Período da Sprint | Link para Documentação da Sprint | Entrega da Sprint |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | 08/09/2025 a 28/09/2025 | [Documentação da Sprint 1](./docs/Sprints/Sprint-1/) | [Gif da Entrega da Sprint 1](./docs/Sprints/Sprint-1/EntregaSprint1.gif) |]
| **Sprint 2** | 06/10/2025 a 26/10/2025 | [Documentação da Sprint 2](./docs/Sprints/Sprint-2/) | [Gif da Entrega da Sprint 2](./docs/Sprints/Sprint-2/EntregaSprint2.gif) |]
| **Sprint 3** | 03/11/2025 a 23/11/2025 | [Documentação da Sprint 3](./docs/Sprints/Sprint-3/) | |]
-----

## 6\. Tecnologias Utilizadas

<div align="center">

[![HTML](https://img.shields.io/badge/-HTML-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS](https://img.shields.io/badge/-CSS-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/) [![Node.js](https://img.shields.io/badge/-Node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/) [![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) [![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/) [![Jira](https://img.shields.io/badge/-Jira-0052CC?style=flat&logo=jira&logoColor=white)](https://www.atlassian.com/software/jira) [![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/)

</div>

  * **Frontend:** `HTML`, `CSS` e `React`
  * **Backend:** `Node.js`, `Next` e`JavaScript`
  * **Banco de Dados:** Banco de Dados Relacional (MySQL)
  * **Gerenciamento:** `Jira` (para Backlog), `GitHub` (para versionamento)

-----

## 7\. Estrutura do Projeto

O projeto segue uma arquitetura cliente-servidor, com o código organizado da seguinte forma:

  - **/app:** Contém toda a lógica de negócio e a conexão com o banco de dados.
  - **/frontend:** Contém todos os arquivos relacionados à interface do usuário.
  - **/docs:** Pasta com toda a documentação do projeto, manuais e diagramas.

-----

## 8\. Como Executar o Projeto

### Pré-requisitos

  * [Node.js](https://nodejs.org/en/)
  * [Git](https://git-scm.com)
  * Um SGBD Relacional de sua preferência.

### Instalação e Execução

1.  Clone o repositório:
    ```sh
    git clone https://github.com/CodexDSM/CodeX.git
    ```
2.  Configure as variáveis de ambiente no arquivo `.env`.
3.  Navegue até o diretório e instale as dependências do backend e do frontend.
    ```sh
     cd codex/front
     npm install
     npm run dev
    ```
    ```sh
     cd codex/app
     npm install
     npm run dev
    ```

-----

## 9\. Link para Pasta de Documentação

Toda a documentação do projeto está centralizada e pode ser acessada nos links abaixo.

  * **Estratégia de Branch:** [Documento de Estratégia de Branch (Git Flow)](./docs/GitFlow.md)
  * **DoR e DoD (Definition of Ready & Definition of Done):**
      * [Checklist de DoR e DoD](./docs/U.S_Cenários_R.N._DoR.pptx)
      * [Mockup / Protótipo](https://www.figma.com/proto/XwOWDv5ccjUUGrWecSSVFv/CodeX?node-id=10-634&p=f&t=wtTYc0qTYeluLbyq-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=10%3A634&show-proto-sidebar=1)

-----

## 10\. Equipe

| Foto | Nome Completo | Papel | GitHub | LinkedIn |
| :--- | :--- | :--- | :--- | :--- |
| <img src="https://github.com/CodexDSM/CodeX/blob/main/docs/photos/enrico.jpg" width="80" height="80" alt="Foto do Membro 1" style="border-radius:50%;"> |**Enrico de Chiara Germano** | Product Owner / Desenvolvedor | [Link do GitHub](https://github.com/EnricoGermano) | [Link do LinkedIn](https://www.linkedin.com/in/enrico-de-chiara-germano-022894204) |
| <img src="https://github.com/CodexDSM/CodeX/blob/main/docs/photos/leonardo.jpg" width="80" height="80" alt="Foto do Membro 2" style="border-radius:50%;"> | **Leonardo da Silva Lopes** | Scrum Master / Desenvolvedor | [Link do GitHub](https://github.com/leodaslb) | [Link do LinkedIn](https://www.linkedin.com/in/leonardo-silva-lopes-aab435283) |
| <img src="https://github.com/CodexDSM/CodeX/blob/main/docs/photos/kaique.jpg" width="80" height="80" alt="Foto do Membro 3" style="border-radius:50%;"> | **Kaique Henrique Silva Pinto** | Desenvolvedor | [Link do GitHub](https://github.com/kaiquehsp) | [Link do LinkedIn](https://www.linkedin.com/in/kaiquehenrique) |
| <img src="https://github.com/CodexDSM/CodeX/blob/main/docs/photos/pedro.jpeg" width="80" height="80" alt="Foto do Membro 4" style="border-radius:50%;"> | **Pedro Miguel Fernandes** | Desenvolvedor | [Link do GitHub](https://www.linkedin.com/in/pedro-nascimento-87a22937a) | [Link do LinkedIn](https://github.com/P3dr0213) |
| <img src="https://github.com/CodexDSM/CodeX/blob/main/docs/photos/lucas.jpg" width="80" height="80" alt="Foto do Membro 5" style="border-radius:50%;"> | **Lucas Gabriel Marins dos Santos** | Desenvolvedor | [Link do GitHub](https://github.com/lucasMarinsSantos) | [Link do LinkedIn](https://www.linkedin.com/in/lucas-gabriel-marins-dos-santos-56b529246/) |
