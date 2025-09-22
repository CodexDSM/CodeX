# Estratégia de Branch (GitFlow) - Projeto Newe Log

## 1\. Introdução

Este documento define a estratégia de versionamento de código a ser seguida pela equipe do projeto Newe Log. O objetivo é manter nosso repositório organizado, garantir a qualidade do código e facilitar o trabalho paralelo, evitando conflitos e garantindo que o branch principal (`main`) esteja sempre estável.

Adotaremos uma versão simplificada do fluxo de trabalho **GitFlow**.

## 2\. Branches Principais

Nosso repositório terá dois branches com tempo de vida infinito.

###  `main`

  * **Propósito:** Este branch representa a versão oficial e estável do projeto. É o código que seria entregue ao cliente ao final de uma Sprint ou do projeto.
  * **Regras:**
      * **Ninguém** pode enviar código diretamente para o branch `main`.
      * O branch `main` só recebe código através de merges vindos do branch `develop`, marcando uma nova versão estável do produto.

###  `develop`

  * **Propósito:** Este é o nosso branch principal de desenvolvimento. Ele serve como um ponto de integração para todas as funcionalidades que foram finalizadas e testadas. Ele sempre conterá o código mais recente do que está sendo desenvolvido.
  * **Regras:**
      * Todo o desenvolvimento de novas funcionalidades **começa a partir** deste branch.
      * Todo o desenvolvimento de novas funcionalidades **termina neste** branch (após um Pull Request).

## 3\. Branches de Suporte

Para desenvolver novas funcionalidades, usaremos branches temporários.

###  `feature/*`

  * **Propósito:** Desenvolver uma nova User Story do Product Backlog. Cada funcionalidade terá seu próprio branch, garantindo isolamento.
  * **Ciclo de Vida:**
    1.  É criado a partir do branch `develop`.
    2.  Existe apenas enquanto a funcionalidade está em desenvolvimento.
    3.  Ao ser finalizado, é mesclado de volta ao `develop` através de um Pull Request.
  * **Padrão de Nomenclatura:**
    `feature/nome-curto-e-descritivo`
      * **Exemplos:**
          * `feature/cadastro-cliente`
          * `feature/painel-operacional`
          * `feature/login-localizacao`

-----

## 4\. Fluxo de Trabalho (Passo a Passo)

Este é o fluxo que cada desenvolvedor deve seguir para implementar uma User Story.

1.  **Sincronize seu `develop` local:** Antes de começar qualquer trabalho, garanta que seu branch `develop` local esteja atualizado com a versão do repositório remoto.

    ```sh
    git checkout develop
    git pull origin develop
    ```

2.  **Crie seu branch de `feature`:** Crie um novo branch a partir do `develop` com o nome da sua funcionalidade.

    ```sh
    git checkout -b feature/cadastro-cliente
    ```

3.  **Desenvolve e Faça Commits:** Trabalhe na sua funcionalidade. Faça commits pequenos e atômicos com mensagens claras.

    ```sh
    # ... faz alterações no código ...
    git add .
    git commit -m "feat: adiciona formulario de cadastro de cliente"
    ```

4.  **Envie seu branch para o repositório remoto:**

    ```sh
    git push -u origin feature/cadastro-cliente
    ```

5.  **Abra um Pull Request (PR):** No GitHub, abra um Pull Request do seu branch (`feature/cadastro-cliente`) para o branch `develop`.

      * No título do PR, coloque um resumo do que foi feito.
      * Na descrição, detalhe as alterações e, se possível, coloque um link para a User Story no Jira ou na planilha.

6.  **Code Review (Revisão de Código):**

      * Marque pelo menos **um** outro membro da equipe para revisar seu código.
      * O revisor irá analisar o código, fazer comentários e solicitar ajustes se necessário.
      * O autor do PR deve realizar os ajustes solicitados.

7.  **Merge do Pull Request:**

      * Somente após a **aprovação** do revisor, o Pull Request pode ser mesclado ao branch `develop`.
      * Utilize a opção **"Squash and merge"** no GitHub para manter o histórico do `develop` limpo.

8.  **Limpeza:** Após o merge, o branch de `feature` pode ser deletado tanto no repositório remoto (o GitHub oferece um botão para isso) quanto localmente.

<!-- end list -->
