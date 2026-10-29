# Sprints do Grafiaa

Registro de cada sprint: planning, review e retrospectiva. A Geovana (PO e Scrum Master) escreve, por Pull Request.

## Sprint 0 · Preparação e esqueleto andante

- **Período:** 25/10/2026 a 26/10/2026
- **Meta:** deixar o projeto pronto para as features: o processo no GitHub, os documentos do produto e o esqueleto do app no ar, passando por testes, CI e CD.

### Review · 29/10/2026

Feita por escrito, sem reunião.

- **Participantes:** Geovana (PO, Scrum Master e QA) e Stela (desenvolvimento e DevOps)
- **No ar:** https://grafiaa.onrender.com e https://grafiaa.onrender.com/health (`{"status":"ok","banco":"ok"}`)

| Issue | O que foi entregue | Responsável | Entregue em | Decisão |
|---|---|---|---|---|
| #1 | Modelos de issue e de Pull Request | Stela | PR #2 · 25/10 | Aceita |
| #3 | Protótipo no repositório (blueprint) | Stela | PR #4 · 25/10 | Aceita |
| #5 | Pedido do Cliente | Geovana | PR #6 · 25/10 | Aceita |
| #7 | README do produto e do blueprint | Geovana | PR #8 · 25/10 | Aceita |
| #9 | ERS do Grafiaa | Geovana | PR #10 · 26/10 | Aceita |
| #26 | Esqueleto do app (web, API e banco) | Stela | PR #27 · 26/10 | Aceita |
| #28 | Primeiros testes automáticos (/health e migrações) | Stela | PR #29 · 26/10 | Aceita |
| #30 | Robô de CI: testes e build a cada PR | Stela | PR #31 · 26/10 | Aceita |
| #32 | Robô de CD: publicar no Render depois de cada merge | Stela | PR #33 · 26/10 | Aceita |
| #34 | Prova do CI: PR com erro sendo barrado | Geovana | PR #35, fechado sem merge · 26/10 | Aceita |
| #36 | Monitoramento: aviso por e-mail se o site cair | Stela | UptimeRobot, sem PR · 26/10 | Aceita |

**Incremento:** Release v0.1.0 (criada pela Stela depois do merge desta ata).

### Retrospectiva · 29/10/2026

Feita por escrito, sem reunião.

**Manter** (o que funcionou)

- Toda mudança por issue, branch e PR, com revisão da outra antes do merge. Nada entrou na main sem revisão. (Stela)
- Revisão com comentário dizendo o que foi conferido, como nos PRs #27, #29 e #31. (Stela)
- Os robôs: o CI testa todo PR e barrou o erro na prova do PR com erro; o CD publica sozinho depois do merge. (Stela)
- Receber cada passo meu em .txt, com onde clicar e o que escrever. Assim fiz a prova do PR com erro sozinha, pelo site. (Geovana)

**Parar** (o que atrapalhou)

- Fechar issue sem marcar as caixinhas do "Pronto quando" (8 issues ficaram assim). (Stela)
- Deixar dúvidas importantes em aberto: o prazo real da Entrega 2 e o que ela exige ainda não foram confirmados com o professor. (Stela)
- Receber o material de cada passo só na hora: o meu contexto da Entrega 1 já não servia na Fase 3. (Geovana)

**Tentar** (o que mudar no Sprint 1)

- Marcar o "Pronto quando" antes de fechar cada issue. (Stela)
- No Sprint 1, a Geovana escrever os cenários de teste em cada issue antes de eu começar a programar, como o guia pede. (Stela)
- Fazer a planning do Sprint 1 por escrito no docs/sprints.md, com a meta e as features escolhidas. (Stela)
- No começo de cada sprint, a Stela me mandar o que vou fazer naquele sprint, para eu me preparar antes. (Geovana)
- Escrever os cenários de teste de cada feature antes de a Stela começar a programar. (Geovana e Stela)
