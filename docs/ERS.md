# Grafiaa · Especificação de Requisitos de Software (ERS)

Editor de fontes · Versão 1.1 · 25/10/2026

## Histórico do documento

| Versão | Data | Responsável | Atividades realizadas |
|---|---|---|---|
| 1.0 | 25/10/2026 | Geovana (PO / SM / QA) | Criação da Especificação de Requisitos (MVP) |
| 1.1 | 25/10/2026 | Geovana (PO / SM / QA) | Correções da revisão: Problema, RN07 e aprovação (registrada no Pull Request); textos mais simples na Solução, nos requisitos, nas regras e no RNF02 |

## 1. Identificação do projeto

| | |
|---|---|
| Produto | Grafiaa — Editor de fontes e alfabetos no navegador |
| Cliente | Startup de design (representada pelo professor da disciplina) |
| Equipe (G3) | Geovana (Product Owner, Scrum Master e QA) e Stela (Desenvolvimento e DevOps) |
| Repositório e quadro | [github.com/Grafiaa/Grafiaa](https://github.com/Grafiaa/Grafiaa) · Quadro Kanban: [github.com/orgs/Grafiaa/projects/1](https://github.com/orgs/Grafiaa/projects/1) |

## 2. Problema

Softwares tradicionais de edição tipográfica e design de fontes (como Glyphs e FontLab) são aplicações desktop complexas, pesadas e proprietárias, que exigem instalação local e têm uma curva de aprendizado íngreme. Estudantes de design que precisam apenas personalizar glifos de uma fonte existente para uma identidade visual, bem como criadores de mundos (autores literários, mestres de RPG e criadores de jogos independentes) que necessitam desenhar alfabetos fictícios vinculados a teclas reais, encontram uma barreira de ferramentas. Quem está começando precisa de um caminho mais simples: desenhar as letras, testar digitando e baixar a fonte (.otf), tudo no navegador e sem instalar nada.

## 3. Solução proposta

Desenvolver o Grafiaa, uma aplicação web leve e acessível que permite a criação e personalização de fontes vetoriais diretamente no navegador, sem exigir instalação. O sistema resolve o problema com:

- **Duas jornadas:** (1) começar de uma fonte aberta (Source Sans 3, licença SIL OFL) ou (2) criar um alfabeto fictício de 26 caracteres (a-z) do zero;
- **Editor vetorial simplificado:** nós de canto e suaves, caneta Bézier, retângulo, elipse e manipulação fluida;
- **Salvamento automático:** o site salva sozinho, para a pessoa não perder o trabalho;
- **Ambiente interativo de teste:** experimentação tipográfica em vários tamanhos de texto (12 a 200 px);
- **Baixar a fonte:** gera um arquivo .otf para instalar no computador.

## 4. Escopo do produto

**Usuários-alvo:**
- (a) Designer / estudante de design: personaliza glifos de tipografias livres para peças gráficas;
- (b) Criador de mundos: cria escritas para línguas inventadas, ligando os novos símbolos às teclas convencionais.

**Glossário:**
- **Glifo:** desenho vetorial individual.
- **Fonte:** conjunto de glifos e métricas compilados.
- **Contorno:** forma geométrica fechada ou aberta composta por nós e alças.
- **Métricas:** grade fixa em 1000 unidades por em (linha de base: 0, altura-x: 500, maiúsculas: 700, ascendente: 800, descendente: -200).

## 5. Requisitos funcionais

| Cód. | Requisito | Detalhamento | Tela | Prio. |
|---|---|---|---|---|
| RF01 | Criar conta | Cadastro com e-mail e senha. Login e direcionamento imediato para Minhas Fontes. | T1 | Must |
| RF02 | Entrar e sair | Autenticação de usuários existentes com mensagem padronizada; logout seguro. | T1 | Must |
| RF03 | Ver minhas fontes | Cards das fontes com amostra visual, data da última alteração e estado vazio. | T2 | Must |
| RF04 | Gerenciar fontes | Criar projeto vazio (com glifo de espaço padrão), renomear e excluir projeto com confirmação. | T2, T3 | Must |
| RF05 | Visão da fonte | Grade completa de glifos com filtros (Todos, Latino, Grego, Cirílico, Sem desenho) e busca. | T4 | Must |
| RF06 | Fonte aberta inicial | Criar projeto copiando os glifos da fonte livre Source Sans 3 (SIL OFL). | T3 | Must |
| RF07 | Importar arquivo | Importar arquivo .otf ou .ttf do computador como ponto de partida da fonte. | T3 | Could |
| RF08 | Editar letra | Zoom e movimento da tela, linhas-guia, seleção e arrasto de nós e alças, troca entre canto e suave. | T5 | Must |
| RF09 | Caneta e formas | Desenho vetorial com caneta (nós e curvas Bézier) e formas básicas (retângulo, elipse). | T5 | Should |
| RF10 | Apagar e histórico | Exclusão com Delete; Desfazer (Ctrl+Z) e Refazer (Ctrl+Shift+Z). | T5 | Should |
| RF11 | Salvar sozinho | Salvamento automático em até 2 s sem edição, mostrando se salvou. | T5 | Must |
| RF12 | Medidas e prévia | Painel de largura, margens e coordenadas, e faixa de prévia embaixo. | T5 | Could |
| RF13 | Alfabeto inventado | Criação guiada com 26 glifos ligados às teclas de a a z, para línguas fictícias. | T3, T4 | Should |
| RF14 | Testar digitando | Campo de digitação livre com a fonte, tamanhos de 12 a 200 px e aviso de letras faltando. | T6 | Should |
| RF15 | Baixar fonte .otf | Geração e download da fonte em formato .otf, para instalar no computador. | T4, T6 | Must |

## 6. Regras de negócio

| Cód. | Regra |
|---|---|
| RN01 | E-mail único no sistema. Senha com no mínimo 8 caracteres, guardada criptografada e nunca mostrada de volta. |
| RN02 | Mensagem de login padronizada ("E-mail ou senha incorretos"), sem indicar qual campo causou a falha. |
| RN03 | Cada usuário só vê e altera as próprias fontes; fontes de outra pessoa retornam erro 404. |
| RN04 | Limites por conta: até 20 fontes por usuário, 1.000 glifos por fonte e 5.000 pontos por glifo. |
| RN05 | Nome da fonte com 1 a 60 caracteres; é usado como nome no arquivo exportado. |
| RN06 | Métricas fixas em 1000 unidades por em: descendente (-200) < base (0) < altura-x (500) ≤ maiúsculas (700) ≤ ascendente (800). |
| RN07 | Nome do glifo único na fonte, até 63 caracteres: letras sem acento, números, ponto e sublinhado, sem começar por número nem ponto. O caractere é opcional, mas, se existir, é único na fonte. |
| RN08 | Toda fonte nova já nasce com o glifo de espaço, com largura de 250 unidades. |
| RN09 | Coordenadas inteiras entre -2000 e 3000. Contornos fechados têm pelo menos 2 nós. |
| RN10 | Contornos abertos são permitidos no editor, mas ficam fora do .otf, com aviso ao usuário. |
| RN11 | Buracos internos de glifos (como em "o" e "b") seguem a orientação certa para ficarem vazados no .otf. |
| RN12 | Projetos baseados em fontes livres copiam os glifos sem alterar a fonte original e mantêm a licença SIL OFL, com nome novo. |
| RN13 | No alfabeto inventado, cada símbolo desenhado é ligado a uma tecla de a a z. |
| RN14 | O salvamento acontece até 2 segundos depois da última edição, com aviso visual do status e alerta ao sair com alterações não salvas. |
| RN15 | Excluir projeto ou glifo pede confirmação e não pode ser desfeito. |

## 7. Requisitos não funcionais

- **RNF01 (Segurança):** aplicação disponível publicamente com HTTPS.
- **RNF02 (CI):** testes automáticos rodam a cada Pull Request, antes do merge na main.
- **RNF03 (CD):** deploy automático a cada merge aprovado na main, com uma release no GitHub por sprint.
- **RNF04 (Desempenho):** arrastar nós no editor fica fluido em glifos de até 500 pontos.
- **RNF05 (Navegadores e telas):** Chrome, Edge, Firefox e Safari. Editor para telas a partir de 1280 px; telas de conta e de lista funcionam no celular.
- **RNF06 (Idioma):** interface toda em português do Brasil.

## 8. Telas e protótipo ([docs/prototipo/index.html](prototipo/index.html))

- **T1 · Entrar e criar conta:** abas de entrar e de cadastro, com mensagens de validação nos campos.
- **T2 · Minhas fontes:** cards das fontes, amostra dos glifos, data de alteração e menu com renomear e excluir.
- **T3 · Nova fonte:** janela com nome e forma de começar (fonte aberta, alfabeto fictício, em branco ou importar).
- **T4 · Visão da fonte:** grade de glifos com filtros e busca, métricas da fonte e atalhos para Testar e Exportar .otf.
- **T5 · Editor de glifo:** área de desenho com linhas-guia, ferramentas de nós e formas, painel lateral e faixa de prévia.
- **T6 · Testar fonte:** campo de teste livre com tamanho ajustável (12 a 200 px) e Exportar .otf.

## 9. Fora de escopo (MVP)

Para cumprir os prazos das Entregas 1 e 2, ficam fora do escopo inicial: kerning (espaçamento por pares de letras), acentos compostos automáticos, camadas de fundo para decalcar imagens, vários pesos e estilos (negrito e itálico), escritas contextuais complexas (árabe, devanágari), recuperação de senha por e-mail e colaboração em tempo real.

## 10. Matriz de rastreabilidade e aprovação

| Requisito | Tela | Regras de negócio | Prioridade |
|---|---|---|---|
| RF01 | T1 | RN01 | Must |
| RF02 | T1 | RN02, RN03 | Must |
| RF03 | T2 | RN03, RN04 | Must |
| RF04 | T2, T3 | RN04, RN05, RN08, RN15 | Must |
| RF05 | T4 | RN06, RN07 | Must |
| RF06 | T3 | RN06, RN12 | Must |
| RF07 | T3 | RN06, RN12 | Could |
| RF08 | T5 | RN06, RN09 | Must |
| RF09 | T5 | RN09 | Should |
| RF10 | T5 | RN09 | Should |
| RF11 | T5 | RN14 | Must |
| RF12 | T5 | RN06, RN07 | Could |
| RF13 | T3, T4 | RN13 | Should |
| RF14 | T6 | RN10 | Should |
| RF15 | T4, T6 | RN05, RN10, RN11, RN12 | Must |

| Aprovação | Nome | Registro |
|---|---|---|
| Produto / Qualidade | Geovana (PO / SM / QA) | Autora do documento, 25/10/2026 |
| Desenvolvimento / DevOps | Stela (Desenvolvimento e DevOps) | Aprovação no Pull Request que publicou este documento |

---

Projeto Acadêmico G3 — Grafiaa
