# Vale de Jade — Além das nuvens

Protótipo 3D solo de fantasia oriental, desenvolvido em JavaScript e Three.js.
**Versão 0.5:** inventário funcional, mundo procedural e a classe Invocador.

## Jogar

Abra `index.html` no Chrome ou Edge. Extraia o ZIP inteiro antes de abrir.
Não exige instalação, servidor ou conexão com a internet. Use teclado e mouse.
Se já estiver jogando, atualize a página para carregar a nova versão.

## Inventário

Pressione **I** ou clique em Inventário. O mundo fica pausado durante a organização.

- Abas: todos, armas, armaduras, acessórios, consumíveis e materiais.
- Busca por nome, filtro de raridade, filtro “Posso usar” e ordenação.
- 60 espaços para tipos de item, com unidades empilhadas.
- Arma, armadura e acessório equipáveis. A comparação mostra a diferença para o item atual.
- Armas aumentam o ataque; armaduras reduzem o dano recebido; acessórios acrescentam poder espiritual aos ataques e às invocações.
- Armas respeitam classe e nível. Armaduras e acessórios podem ser usados por todas as classes, respeitando o nível.
- Elixir de vida recupera 60 PV; elixir espiritual recupera 65 de energia. Recursos cheios não gastam o elixir.
- Inimigos concedem itens e moedas. A qualidade e o nível dos equipamentos acompanham a região.
- Se não houver espaço para um novo tipo de item, ele é convertido em moedas, com aviso.
- Descartar exige confirmação. Um item equipado precisa ser desequipado primeiro.

Personagens antigos recebem equipamento básico e elixires uma única vez, sem perder o progresso.
Moedas e materiais já podem ser acumulados; lojas e fabricação ainda não estão implementadas.

![Inventário com filtros e equipamentos](inventario.png)

## Mundo e progressão

O santuário, a floresta de bambu e as ruínas da versão anterior continuam presentes.
Ao norte, **12 áreas procedurais** formam uma fronteira de quatro faixas conectadas
por pontes, totalizando **15 regiões** e aproximadamente 200 × 370 unidades de extensão.

- Bosque Esmeralda, Deserto de Âmbar, Jardins da Geada e Terras do Eclipse.
- Cada personagem tem uma semente própria; a mesma jornada mantém seu mapa ao recarregar.
- Biomas, raios das ilhas, vegetação e posições dos inimigos são gerados a partir dessa semente.
- 108 criaturas adicionais; até 126 inimigos no mundo, contando a jornada original e seus chefes.
- O perigo cresce com a distância ao norte: novas áreas de nível 4 a 11, com inimigos chegando ao nível 12 e elites na última faixa.
- Vida, dano, experiência e qualidade dos itens aumentam nas áreas mais distantes.
- Criaturas da fronteira retornam após 180 segundos de jogo ativo, quando você está a mais de 15 unidades do ponto de nascimento. O tempo restante também é salvo.
- Inimigos das missões originais permanecem purificados para preservar o progresso.
- As rotas principais ficam livres de vegetação. Cliques não calculam desvios; use WASD ao redor de obstáculos.
- **M** abre o mapa completo e os níveis recomendados. O minimapa acompanha a posição do jogador.

O mundo é grande e procedural, mas finito. Regiões descobertas ficam registradas separadamente por personagem.

![Mapa das quinze regiões](mapa-procedural.png)

## Classes

- **Espadachim:** combo de espada, dança de lâminas e cura de jade.
- **Arcanista:** projéteis astrais, explosão em área e cura lunar.
- **Guardião solar:** lança, impacto de fogo e escudo temporário.
- **Invocador:** dardo sombrio, pacto com criaturas e ritual das almas.

### Invocador

Crie um personagem em uma vaga vazia e escolha Invocador.

| Tecla | Habilidade |
| --- | --- |
| 1 / Espaço | Dardo sombrio: projétil a distância |
| 2 | Pacto das trevas: invoca cão sombrio, espectro e bruto abissal por 60 segundos |
| 3 | Ritual das almas: cura 30 PV do jogador, restaura os aliados e aumenta o dano deles em 60% por 8 segundos |

As criaturas seguem o personagem e priorizam o alvo selecionado. Sem alvo, defendem
seu mestre de inimigos próximos. O cão combate de perto; o espectro ataca a distância;
o bruto tem mais vida e atrai a atenção dos inimigos. Eles recebem dano, podem morrer
e mostram vida e duração no painel. Um novo pacto substitui o grupo anterior, com
limite de três aliados. O estado das invocações também fica salvo.

![Invocador e seus aliados](invocacoes.png)

## Missões e habitantes

Mestre Yun aguarda no santuário; Lin está junto à ponte da floresta; Mei, na entrada
das ruínas. Aproxime-se e pressione **E** para conversar, aceitar ou entregar missões.
As quatro missões da versão anterior continuam disponíveis, com recompensas únicas.
A missão de Mei permite coletar três memórias de cristal e libera o desafio do Colosso.
Feitos anteriores contam para as missões de combate. **J** abre o diário e permite
retornar ao santuário.

## Controles

| Controle | Ação |
| --- | --- |
| WASD / setas | Mover em relação à câmera |
| Shift + movimento | Correr |
| Clique no chão | Caminhar até o ponto |
| Clique em inimigo | Selecionar, aproximar e atacar |
| TAB | Alternar alvo próximo |
| 1 / Espaço, 2, 3 | Habilidades da classe |
| I | Inventário |
| M | Mapa completo |
| E | Conversar / coletar memória próxima |
| J | Diário de missões |
| V / roda | Alternar câmera / ajustar distância |
| Botão direito + arrastar | Girar câmera |
| H / Esc | Pausar; Esc fecha a janela atual |

O alvo mantém a barra de vida no painel e sobre o modelo. Saia dos círculos de aviso
para evitar ataques inimigos. A experiência excedente é mantida ao subir de nível.

## Personagens e salvamento

Três vagas independentes guardam nome, classe, evolução, posição, câmera, missões,
inventário, equipamentos, inimigos, mapa, descobertas e invocações. O jogo salva
automaticamente a cada três segundos e nas mudanças importantes.

O menu de pausa oferece Salvar agora e Salvar e trocar personagem. Baixar backup
exporta as três vagas; Restaurar backup valida o arquivo e pede confirmação antes de
substituí-las. A migração preserva os personagens das versões 0.2, 0.3 e 0.4.

O armazenamento é local ao navegador, sem conta online ou sincronização em nuvem.
Trocar de navegador, endereço ou computador, limpar os dados ou usar modo privado
pode afetar os saves. Use backup para transportar sua jornada.

## Verificação

Testes de regras: `node systems.test.cjs` (Node.js, sem dependências).
Verificam geração reproduzível, biomas, posições válidas, rotas, dificuldade,
validação de itens, restrições de equipamentos e compatibilidade dos saves.

Também verificados no Chrome: três vagas, migração, exportação/restauração, seleção
de alvo, inventário e filtros, descarte, consumíveis, bônus efetivos em combate,
Invocador e combate dos aliados, pausa e retomada das invocações, mapa, travessia
até a última faixa, reaparecimento de inimigos e posições distantes após recarregar.
Interface conferida em 1440 × 900 e 1280 × 720.

## Estrutura e limites

- `index.html` / `style.css`: interface e apresentação.
- `game.js`: cena, combate, interface, missões e companheiros.
- `systems.js`: catálogo de itens e geração determinística do mundo.
- `storage.js`: validação, três personagens e cópia de recuperação.
- `systems.test.cjs`: testes das regras e da compatibilidade.
- `vendor/`: Three.js 0.160.0 e licença MIT para funcionamento offline.

Ainda é um protótipo solo, sem multiplayer, lojas ou fabricação. Arte procedural
original; nenhum arquivo, personagem ou código de Zu Online foi utilizado.
