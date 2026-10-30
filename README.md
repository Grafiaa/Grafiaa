# Grafiaa

[![CI](https://github.com/Grafiaa/Grafiaa/actions/workflows/ci.yml/badge.svg)](https://github.com/Grafiaa/Grafiaa/actions/workflows/ci.yml)

Editor de fontes e alfabetos no navegador. Trabalho de DevOps do G3.

**No ar:** https://grafiaa.onrender.com

## O produto

Com o Grafiaa, a pessoa cria uma conta, começa de uma fonte pronta ou inventa um alfabeto, desenha as letras, testa digitando e baixa a fonte (.otf) para usar no computador.

Para quem é:
- **Designer ou estudante de design:** ajusta letras de uma fonte pronta.
- **Criador de mundos** (escritor, mestre de RPG, quem faz jogo): inventa um alfabeto para uma língua fictícia.

O pedido original do cliente está em [docs/pedido-do-cliente.md](docs/pedido-do-cliente.md), e os requisitos, na [ERS](docs/ERS.md).

## O que já funciona (MVP)

| Feature | O que a pessoa faz | Issue |
|---|---|---|
| RF01 · Criar conta | Cria a conta com e-mail e senha e já entra | [#11](https://github.com/Grafiaa/Grafiaa/issues/11) |
| RF02 · Entrar e sair | Entra com e-mail e senha e sai pelo botão Sair | [#12](https://github.com/Grafiaa/Grafiaa/issues/12) |
| RF03 · Ver minhas fontes | Vê as próprias fontes em cards, com amostra e data; nunca as de outra pessoa | [#13](https://github.com/Grafiaa/Grafiaa/issues/13) |
| RF04 · Criar, renomear e excluir fonte | Cria uma fonte em branco, muda o nome e exclui, até 20 fontes | [#14](https://github.com/Grafiaa/Grafiaa/issues/14) |

As outras 11 features (editar letras, alfabeto inventado, baixar o .otf e o resto) estão no Product Backlog do [quadro](https://github.com/orgs/Grafiaa/projects/1), em ordem de prioridade.

## Blueprint

O blueprint é o [protótipo](docs/prototipo/index.html) que a equipe fez antes do projeto: 6 telas desenhadas, sem nada funcionando de verdade. O trabalho é transformar esse protótipo num sistema que funciona. O protótipo, por sua vez, se inspirou no Glyphs, um editor de fontes profissional.

| Tela | O que mostra | Situação |
|---|---|---|
| T1 | Entrar e criar conta | Funcionando |
| T2 | Minhas fontes | Funcionando |
| T3 | Nova fonte | Funcionando (ponto de partida Em branco) |
| T4 | Visão da fonte (todas as letras) | No backlog |
| T5 | Editor de letra | No backlog |
| T6 | Testar fonte | No backlog |

## Como a gente trabalha

- Scrum com sprints curtos: as atas de planning, review e retrospectiva estão em [docs/sprints.md](docs/sprints.md), e cada sprint é uma milestone.
- Quadro Kanban: https://github.com/orgs/Grafiaa/projects/1
- Cada funcionalidade é uma issue com a etiqueta `feature`, com história, critérios de aceite e cenários de teste.
- Todo trabalho entra na `main` por Pull Request: com o robô de testes verde e revisado pela outra pessoa.
- Cada cenário de teste vira um teste automático, e cada merge na `main` vai para o ar sozinho. Como isso funciona está em [docs/pipeline.md](docs/pipeline.md).

## Tecnologias

| Parte | Ferramenta |
|---|---|
| Página (frontend) | React, TypeScript e Vite |
| Servidor (backend) | Node.js 24 e Express |
| Banco de dados | PostgreSQL (Neon, na nuvem) |
| Hospedagem | Render |
| Testes automáticos | Vitest e Supertest |
| CI e CD | GitHub Actions |
| Monitoramento | UptimeRobot |

## Como rodar no computador

Precisa de Node.js 24 ou mais novo e do Docker.

```bash
# 1. Banco de dados de teste, no Docker
docker run --name grafiaa-banco -e POSTGRES_USER=grafiaa -e POSTGRES_PASSWORD=grafiaa -e POSTGRES_DB=grafiaa -p 5432:5432 -d postgres:17

# 2. Configuração local (o .env nunca vai para o GitHub)
cp .env.example .env

# 3. Instalar e ligar
npm install
npm run dev
```

A página abre em http://localhost:5173. As tabelas do banco são criadas sozinhas quando o servidor liga.

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm test` | Roda os testes automáticos (não precisa de banco) |
| `npm run typecheck` | Confere os tipos do TypeScript |
| `npm run build` | Monta o sistema como vai para o ar |

## Equipe

| Pessoa | Papel | O que fez |
|---|---|---|
| Geovana ([@Geovana2302](https://github.com/Geovana2302)) | Product Owner, Scrum Master e QA | Pedido do cliente, ERS, histórias, critérios e cenários de teste, prioridades, revisão de todos os PRs, testes no site, prova do CI, atas dos sprints |
| Stela ([@Shayja-P](https://github.com/Shayja-P)) | Desenvolvimento e DevOps | Código das features e testes automáticos, robôs de CI e CD, banco e servidor na nuvem, monitoramento |
