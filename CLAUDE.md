# BYG Barbearia — Sistema de agendamento

Sistema web de agendamento para **uma única barbearia** (BYG Barbearia). O cliente marca o corte pelo site, o horário vai para o Google Agenda no tablet do barbeiro e o cliente recebe confirmação e lembrete pelo WhatsApp.

Projeto de cliente real e também de portfólio: priorize código limpo, testado e bem justificado.

## Stack

- **Back-end:** Java 25 + Spring Boot (versão estável mais recente)
- **Front-end:** Angular
- **Banco:** PostgreSQL, com migrations via **Flyway**
- **Infra:** uma VPS (Hostinger KVM 1, 4 GB RAM) com Docker Compose: app Spring + PostgreSQL + Caddy (HTTPS automático)
- Imagem final do app: `eclipse-temurin:25-jre`

## Arquitetura: monolito modular

Um único projeto Spring (um `pom.xml`, um `.jar`). **Não** usar microsserviços.

Módulos = pacotes de primeiro nível em `com.seuapp`:

```
com.seuapp
├── agendamento   serviços, horários, regra de conflito
├── cliente
├── barbeiro
├── notificacao   WhatsApp + lembretes (@Scheduled)
└── calendario    Google Calendar API
```

Regras (verificadas pelo **Spring Modulith**):
- Classes no pacote raiz do módulo = API pública. Subpacote `internal/` = privado do módulo.
- Um módulo **nunca** importa `internal` de outro (repository, entidade, etc.).
- Sem dependências circulares entre módulos.
- Manter o teste `ApplicationModules.of(BarbeariaApplication.class).verify()` passando.

### Comunicação entre módulos: eventos

- `agendamento` publica `AgendamentoCriado` / `AgendamentoCancelado` (records públicos com os dados que os ouvintes precisam).
- `notificacao` e `calendario` escutam com `@ApplicationModuleListener` (após commit, assíncrono, transação própria).
- `agendamento` não conhece `notificacao` nem `calendario`.
- Usar `spring-modulith-starter-jpa` (registro de publicação de eventos) e
  `spring.modulith.events.republish-outstanding-events-on-restart=true`.
- Lembretes: `notificacao` grava seu próprio registro de lembrete ao receber `AgendamentoCriado`, apaga em `AgendamentoCancelado`, e um `@Scheduled` lê só essa tabela.

## Banco de dados

- `spring.jpa.hibernate.ddl-auto=validate`. Nunca `update`.
- Toda mudança de esquema = nova migration em `src/main/resources/db/migration/` (`V<n>__descricao.sql`).
- **Nunca editar uma migration já aplicada**: crie uma nova.
- Conflito de horário deve ser garantido também no banco (constraint), não só no service.

## Integrações

- **WhatsApp:** Cloud API oficial da Meta, direto (sem BSP). Só templates de **utilidade** (confirmação, lembrete). Nada de APIs não oficiais (Baileys, Evolution). Credenciais via variáveis de ambiente.
- **Google Calendar:** OAuth da conta do barbeiro; criar, atualizar e cancelar eventos.
- Plano B da v1: link `wa.me` com mensagem pronta, enquanto a Meta não aprova os templates.

## Front-end (identidade visual)

Design de referência: tela de login (desktop + mobile) feita no canvas do Claude.

- Fundo preto, tons prata/branco, sem gradientes.
- Fontes: **Oswald** (títulos, caixa alta, letter-spacing) + **Inter** (texto).
- Tokens CSS globais:
  ```css
  --bg: #0B0B0B;
  --panel: #111111;
  --surface: #161616;
  --border: #333333;
  --divider: #222222;
  --text: #F2F2F2;
  --muted: #A3A3A3;
  --primary-bg: #EDEDED;   /* botão principal */
  --primary-text: #0B0B0B;
  --radius: 10px;
  ```
- Inputs e botões com 48–50px de altura; alvos de toque ≥ 44px.
- Login aceita e-mail **ou** telefone; uma tela única para cliente e barbeiro (redireciona por role). Opções "Continuar com Google" e "Agendar sem cadastro".

## Escopo

- **v1:** agendamento (serviço → barbeiro → horário), painel do barbeiro, Google Calendar, login.
- **v2:** confirmação e lembrete automáticos pelo WhatsApp.

## Convenções

- Código e nomes de domínio em **português** (Agendamento, Cliente, Barbeiro).
- Testes para regras de negócio (principalmente conflito de horário) e para os módulos.
- Segredos só em variáveis de ambiente; nunca commitar `.env`.
